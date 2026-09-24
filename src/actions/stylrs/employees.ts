"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import {
  employeeFormSchema,
  availabilityFormSchema,
  timeOffFormSchema,
} from "@/lib/stylrs/validation/employee";

export type ActionState = { error?: string } | undefined;

async function assertOwnsEmployee(salonId: string, employeeId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.salonId !== salonId) {
    throw new Error("Medewerker niet gevonden.");
  }
  return employee;
}

export async function createEmployee(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();

  const parsed = employeeFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    function: formData.get("function") ?? "",
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.employee.create({
    data: {
      salonId: user.salonId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      function: parsed.data.function || null,
      color: parsed.data.color,
    },
  });

  revalidatePath("/stylrs/medewerkers");
}

export async function updateEmployee(
  employeeId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  const parsed = employeeFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    function: formData.get("function") ?? "",
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      function: parsed.data.function || null,
      color: parsed.data.color,
    },
  });

  revalidatePath("/stylrs/medewerkers");
  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}

export async function toggleEmployeeActive(employeeId: string) {
  const user = await requireOwner();
  const employee = await assertOwnsEmployee(user.salonId, employeeId);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { active: !employee.active },
  });

  revalidatePath("/stylrs/medewerkers");
  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}

export async function deleteEmployee(employeeId: string): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  const appointmentCount = await prisma.appointment.count({ where: { employeeId } });
  if (appointmentCount > 0) {
    return {
      error:
        "Deze medewerker heeft afspraken (historie). Deactiveer de medewerker in plaats van te verwijderen.",
    };
  }

  await prisma.employee.delete({ where: { id: employeeId } });
  revalidatePath("/stylrs/medewerkers");
}

export async function setAvailability(
  employeeId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  const parsed = availabilityFormSchema.safeParse({
    weekday: formData.get("weekday"),
    working: formData.get("working") === "on",
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde tijden." };
  }

  if (!parsed.data.working) {
    await prisma.employeeAvailability.deleteMany({
      where: { employeeId, weekday: parsed.data.weekday },
    });
  } else {
    await prisma.employeeAvailability.upsert({
      where: { employeeId_weekday: { employeeId, weekday: parsed.data.weekday } },
      create: {
        employeeId,
        weekday: parsed.data.weekday,
        startTime: parsed.data.startTime!,
        endTime: parsed.data.endTime!,
      },
      update: {
        startTime: parsed.data.startTime!,
        endTime: parsed.data.endTime!,
      },
    });
  }

  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}

export async function addTimeOff(employeeId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  const parsed = timeOffFormSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde data." };
  }

  await prisma.timeOff.create({
    data: {
      employeeId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}

export async function deleteTimeOff(employeeId: string, timeOffId: string) {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  await prisma.timeOff.deleteMany({ where: { id: timeOffId, employeeId } });
  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}

export async function setEmployeeServices(employeeId: string, formData: FormData) {
  const user = await requireOwner();
  await assertOwnsEmployee(user.salonId, employeeId);

  const serviceIds = formData.getAll("serviceId").map(String);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, salonId: user.salonId },
    select: { id: true },
  });
  const validIds = services.map((s) => s.id);

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { employeeId } }),
    prisma.employeeService.createMany({
      data: validIds.map((serviceId) => ({ employeeId, serviceId })),
    }),
  ]);

  revalidatePath(`/stylrs/medewerkers/${employeeId}`);
}
