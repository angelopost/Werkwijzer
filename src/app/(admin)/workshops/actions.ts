"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import {
  workshopActionSchema,
  workshopCreateSchema,
  workshopNotesSchema,
  workshopStatusSchema,
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

export async function updateWorkshopNotes(
  workshopId: string,
  _prevState: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();

  const parsed = workshopNotesSchema.safeParse({
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  await prisma.workshop.update({
    where: { id: workshopId },
    data: { notes: parsed.data.notes?.trim() || null },
  });

  revalidateWorkshop(workshopId);
  return { success: true };
}

export async function updateWorkshopStatus(
  workshopId: string,
  patch: { status?: "OPEN" | "REMINDER" | "AFGEHANDELD"; paymentLinkSent?: boolean; paid?: boolean }
): Promise<{ error?: string } | undefined> {
  await requireAdmin();

  const parsed = workshopStatusSchema.safeParse(patch);
  if (!parsed.success) return { error: "Ongeldige status" };

  await prisma.workshop.update({ where: { id: workshopId }, data: parsed.data });

  revalidateWorkshop(workshopId);
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
