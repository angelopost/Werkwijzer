"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import {
  workshopActionSchema,
  workshopCreateSchema,
  workshopUpdateSchema,
} from "@/lib/validation/workshop";

export type WorkshopActionState = { error?: string; success?: boolean; id?: string } | undefined;

function revalidateWorkshop(workshopId?: string) {
  revalidatePath("/workshops");
  if (workshopId) revalidatePath(`/workshops/${workshopId}`);
}

export async function createWorkshop(
  _prevState: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();

  const parsed = workshopCreateSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const workshop = await prisma.workshop.create({
    data: { name: parsed.data.name, date: parseDateKey(parsed.data.date) },
  });

  revalidateWorkshop();
  return { success: true, id: workshop.id };
}

export async function updateWorkshop(
  workshopId: string,
  _prevState: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();

  const parsed = workshopUpdateSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    status: formData.get("status"),
    paymentLinkSent: formData.get("paymentLinkSent"),
    paid: formData.get("paid"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      name: data.name,
      date: parseDateKey(data.date),
      status: data.status,
      paymentLinkSent: data.paymentLinkSent === "ja",
      paid: data.paid === "ja",
      notes: data.notes?.trim() || null,
    },
  });

  revalidateWorkshop(workshopId);
  return { success: true };
}

export async function deleteWorkshop(workshopId: string) {
  await requireAdmin();
  await prisma.workshop.delete({ where: { id: workshopId } });
  revalidateWorkshop();
}

export async function addWorkshopAction(
  workshopId: string,
  _prevState: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();

  const parsed = workshopActionSchema.safeParse({
    date: formData.get("date"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  await prisma.workshopAction.create({
    data: {
      workshopId,
      date: parseDateKey(parsed.data.date),
      description: parsed.data.description,
    },
  });

  revalidateWorkshop(workshopId);
  return { success: true };
}

export async function deleteWorkshopAction(actionId: string) {
  await requireAdmin();
  const action = await prisma.workshopAction.delete({ where: { id: actionId } });
  revalidateWorkshop(action.workshopId);
}
