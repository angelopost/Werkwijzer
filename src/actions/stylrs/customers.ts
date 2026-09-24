"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSalonUser, requireOwner } from "@/lib/stylrs/permissions";
import { customerFormSchema, customerNoteSchema } from "@/lib/stylrs/validation/customer";

export type ActionState = { error?: string } | undefined;

async function assertOwnsCustomer(salonId: string, customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.salonId !== salonId) {
    throw new Error("Klant niet gevonden.");
  }
  return customer;
}

function parseCustomerForm(formData: FormData) {
  return customerFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });
}

export async function createCustomer(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireSalonUser();
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.customer.create({
    data: {
      salonId: user.salonId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/stylrs/klanten");
}

export async function updateCustomer(
  customerId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireSalonUser();
  await assertOwnsCustomer(user.salonId, customerId);

  const parsed = parseCustomerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/stylrs/klanten");
  revalidatePath(`/stylrs/klanten/${customerId}`);
}

export async function deleteCustomer(customerId: string): Promise<ActionState> {
  const user = await requireOwner();
  await assertOwnsCustomer(user.salonId, customerId);

  const appointmentCount = await prisma.appointment.count({ where: { customerId } });
  if (appointmentCount > 0) {
    return { error: "Deze klant heeft een afsprakengeschiedenis en kan niet worden verwijderd." };
  }

  await prisma.customer.delete({ where: { id: customerId } });
  revalidatePath("/stylrs/klanten");
}

export async function addCustomerNote(
  customerId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireSalonUser();
  await assertOwnsCustomer(user.salonId, customerId);

  const parsed = customerNoteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Notitie mag niet leeg zijn." };
  }

  await prisma.customerNote.create({
    data: { customerId, body: parsed.data.body },
  });

  revalidatePath(`/stylrs/klanten/${customerId}`);
}

export async function deleteCustomerNote(customerId: string, noteId: string) {
  const user = await requireSalonUser();
  await assertOwnsCustomer(user.salonId, customerId);

  await prisma.customerNote.deleteMany({ where: { id: noteId, customerId } });
  revalidatePath(`/stylrs/klanten/${customerId}`);
}
