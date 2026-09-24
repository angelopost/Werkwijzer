import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findAvailableEmployeeForBooking } from "@/lib/stylrs/availability";
import { publicBookingSchema } from "@/lib/stylrs/validation/public-booking";
import { sendAppointmentConfirmation } from "@/lib/stylrs/email";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: { bookingSettings: true },
  });
  if (!salon || !salon.bookingSettings) {
    return NextResponse.json({ error: "Salon niet gevonden" }, { status: 404 });
  }

  if (salon.bookingSettings.requireEmail && !data.email) {
    return NextResponse.json({ error: "E-mailadres is verplicht" }, { status: 400 });
  }
  if (salon.bookingSettings.requirePhone && !data.phone) {
    return NextResponse.json({ error: "Telefoonnummer is verplicht" }, { status: 400 });
  }
  if (!salon.bookingSettings.allowEmployeeSelection && data.employeeId) {
    return NextResponse.json({ error: "Zelf een medewerker kiezen is niet mogelijk." }, { status: 400 });
  }
  if (!data.employeeId && !salon.bookingSettings.allowNoPreference) {
    return NextResponse.json({ error: "Kies een medewerker." }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || service.salonId !== salon.id || !service.active) {
    return NextResponse.json({ error: "Behandeling niet gevonden" }, { status: 404 });
  }

  const [hh, mm] = data.time.split(":").map(Number);
  const startTime = new Date(`${data.date}T00:00:00`);
  startTime.setHours(hh, mm, 0, 0);
  const endTime = new Date(startTime.getTime() + service.durationMinutes * 60_000);

  const now = new Date();
  if (startTime.getTime() < now.getTime() + salon.bookingSettings.minNoticeMinutes * 60_000) {
    return NextResponse.json(
      { error: "Dit tijdstip ligt te dichtbij. Kies een tijdstip verder in de toekomst." },
      { status: 409 }
    );
  }
  const maxAdvance = new Date();
  maxAdvance.setDate(maxAdvance.getDate() + salon.bookingSettings.maxAdvanceDays);
  if (startTime.getTime() > maxAdvance.getTime()) {
    return NextResponse.json({ error: "Deze datum ligt te ver in de toekomst." }, { status: 409 });
  }

  let appointmentId: string;
  try {
    appointmentId = await prisma.$transaction(async (tx) => {
      const employeeId = await findAvailableEmployeeForBooking(tx, {
        salonId: salon.id,
        serviceId: service.id,
        employeeId: data.employeeId || null,
        startTime,
        endTime,
      });
      if (!employeeId) {
        throw new Error("SLOT_TAKEN");
      }

      let customer = data.email
        ? await tx.customer.findFirst({
            where: { salonId: salon.id, email: { equals: data.email, mode: "insensitive" } },
          })
        : null;

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            salonId: salon.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || null,
            phone: data.phone || null,
          },
        });
      }

      const appointment = await tx.appointment.create({
        data: {
          salonId: salon.id,
          customerId: customer.id,
          employeeId,
          serviceId: service.id,
          startTime,
          endTime,
          price: service.price,
          source: "ONLINE",
        },
      });

      return appointment.id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Dit tijdstip is helaas net vergeven. Kies een ander tijdstip." },
        { status: 409 }
      );
    }
    throw error;
  }

  await sendAppointmentConfirmation(appointmentId);

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { employee: true, service: true },
  });

  return NextResponse.json({
    appointment: {
      id: appointmentId,
      startTime,
      endTime,
      serviceName: appointment?.service.name,
      employeeName: appointment ? `${appointment.employee.firstName} ${appointment.employee.lastName}` : null,
      price: service.price,
    },
  });
}
