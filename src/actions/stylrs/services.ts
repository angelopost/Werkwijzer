"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import { serviceFormSchema } from "@/lib/stylrs/validation/service";

export type ActionState = { error?: string } | undefined;

async function assertOwnsService(salonId: string, serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.salonId !== salonId) {
    throw new Error("Behandeling niet gevonden.");
  }
  return service;
}

function parseServiceForm(formData: FormData) {
  return serviceFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    durationMinutes: formData.get("durationMinutes"),
    category: formData.get("category") ?? "",
  });
}

export async function createService(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();
  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  const employeeIds = formData.getAll("employeeId").map(String);
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, salonId: user.salonId },
    select: { id: true },
  });

  await prisma.service.create({
    data: {
      salonId: user.salonId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      durationMinutes: parsed.data.durationMinutes,
      category: parsed.data.category || null,
      employees: {
        create: employees.map((e) => ({ employeeId: e.id })),
      },
    },
  });

  revalidatePath("/stylrs/behandelingen");
}

export async function updateService(
  serviceId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsService(user.salonId, serviceId);

  const parsed = parseServiceForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  const employeeIds = formData.getAll("employeeId").map(String);
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, salonId: user.salonId },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.service.update({
      where: { id: serviceId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        durationMinutes: parsed.data.durationMinutes,
        category: parsed.data.category || null,
      },
    }),
    prisma.employeeService.deleteMany({ where: { serviceId } }),
    prisma.employeeService.createMany({
      data: employees.map((e) => ({ employeeId: e.id, serviceId })),
    }),
  ]);

  revalidatePath("/stylrs/behandelingen");
}

export async function toggleServiceActive(serviceId: string) {
  const user = await requireOwner();
  const service = await assertOwnsService(user.salonId, serviceId);

  await prisma.service.update({
    where: { id: serviceId },
    data: { active: !service.active },
  });

  revalidatePath("/stylrs/behandelingen");
}

export async function deleteService(serviceId: string): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsService(user.salonId, serviceId);

  const appointmentCount = await prisma.appointment.count({ where: { serviceId } });
  if (appointmentCount > 0) {
    return {
      error: "Deze behandeling heeft afspraken (historie). Schakel de behandeling uit in plaats van te verwijderen.",
    };
  }

  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath("/stylrs/behandelingen");
}
