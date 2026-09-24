"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { manualAppointmentSchema } from "@/lib/stylrs/validation/appointment";
import { isEmployeeFree } from "@/lib/stylrs/availability";
import { sendAppointmentRescheduled, sendAppointmentCancelled } from "@/lib/stylrs/email";
import type { AppointmentStatus } from "@/generated/prisma/enums";

export type ActionState = { error?: string } | undefined;

function revalidateAgendaPaths() {
  revalidatePath("/stylrs/agenda");
  revalidatePath("/stylrs/afspraken");
  revalidatePath("/stylrs/dashboard");
}

export async function createManualAppointment(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireSalonUser();

  const parsed = manualAppointmentSchema.safeParse({
    customerId: formData.get("customerId") ?? "",
    newCustomerFirstName: formData.get("newCustomerFirstName") ?? "",
    newCustomerLastName: formData.get("newCustomerLastName") ?? "",
    newCustomerEmail: formData.get("newCustomerEmail") ?? "",
    newCustomerPhone: formData.get("newCustomerPhone") ?? "",
    employeeId: formData.get("employeeId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    price: formData.get("price") || undefined,
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }
  const data = parsed.data;

  const [employee, service] = await Promise.all([
    prisma.employee.findUnique({ where: { id: data.employeeId } }),
    prisma.service.findUnique({ where: { id: data.serviceId } }),
  ]);
  if (!employee || employee.salonId !== user.salonId) return { error: "Medewerker niet gevonden." };
  if (!service || service.salonId !== user.salonId) return { error: "Behandeling niet gevonden." };

  const [hh, mm] = data.startTime.split(":").map(Number);
  const startTime = new Date(`${data.date}T00:00:00`);
  startTime.setHours(hh, mm, 0, 0);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);

  const bookingSettings = await prisma.bookingSettings.findUnique({ where: { salonId: user.salonId } });

  try {
    await prisma.$transaction(async (tx) => {
      const free = await isEmployeeFree(tx, {
        employeeId: employee.id,
        startTime,
        endTime,
        bufferMinutes: bookingSettings?.bufferMinutes ?? 0,
      });
      if (!free) {
        throw new Error("CONFLICT");
      }

      let customerId = data.customerId || undefined;
      if (!customerId) {
        const customer = await tx.customer.create({
          data: {
            salonId: user.salonId,
            firstName: data.newCustomerFirstName!,
            lastName: data.newCustomerLastName!,
            email: data.newCustomerEmail || null,
            phone: data.newCustomerPhone || null,
          },
        });
        customerId = customer.id;
      } else {
        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        if (!customer || customer.salonId !== user.salonId) throw new Error("CUSTOMER_NOT_FOUND");
      }

      await tx.appointment.create({
        data: {
          salonId: user.salonId,
          customerId,
          employeeId: employee.id,
          serviceId: service.id,
          startTime,
          endTime,
          price: data.price ?? service.price,
          note: data.note || null,
          source: "MANUAL",
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return { error: "Deze medewerker is op dit tijdstip al bezet. Kies een andere tijd." };
    }
    if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
      return { error: "Klant niet gevonden." };
    }
    throw error;
  }

  revalidateAgendaPaths();
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  const user = await requireSalonUser();
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.salonId !== user.salonId) return;

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status } });

  if (status === "CANCELLED") {
    await sendAppointmentCancelled(appointmentId);
  }

  revalidateAgendaPaths();
}

export async function rescheduleAppointment(
  appointmentId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireSalonUser();
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.salonId !== user.salonId) return { error: "Afspraak niet gevonden." };

  const date = String(formData.get("date") ?? "");
  const startTimeStr = String(formData.get("startTime") ?? "");
  const employeeId = String(formData.get("employeeId") ?? appointment.employeeId);

  if (!date || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTimeStr)) {
    return { error: "Kies een geldige datum en tijd." };
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.salonId !== user.salonId) return { error: "Medewerker niet gevonden." };

  const durationMs = appointment.endTime.getTime() - appointment.startTime.getTime();
  const [hh, mm] = startTimeStr.split(":").map(Number);
  const startTime = new Date(`${date}T00:00:00`);
  startTime.setHours(hh, mm, 0, 0);
  const endTime = new Date(startTime.getTime() + durationMs);

  const bookingSettings = await prisma.bookingSettings.findUnique({ where: { salonId: user.salonId } });

  try {
    await prisma.$transaction(async (tx) => {
      const free = await isEmployeeFree(tx, {
        employeeId,
        startTime,
        endTime,
        bufferMinutes: bookingSettings?.bufferMinutes ?? 0,
        excludeAppointmentId: appointmentId,
      });
      if (!free) throw new Error("CONFLICT");

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { startTime, endTime, employeeId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return { error: "Deze medewerker is op dit tijdstip al bezet. Kies een andere tijd." };
    }
    throw error;
  }

  await sendAppointmentRescheduled(appointmentId);
  revalidateAgendaPaths();
}
