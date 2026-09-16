"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { combineDateAndTime, getWeekDays, parseDateKey } from "@/lib/dates";
import { shiftFormSchema } from "@/lib/validation/shift";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function saveShift(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = shiftFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;
  const shiftId = formData.get("id");

  const values = {
    date: parseDateKey(data.date),
    startTime: combineDateAndTime(data.date, data.startTime),
    endTime: combineDateAndTime(data.date, data.endTime),
    breakMinutes: data.breakMinutes,
    notes: data.notes || null,
    assignedUserId: data.assignedUserId,
    functieId: data.functieId,
  };

  if (typeof shiftId === "string" && shiftId) {
    await prisma.shift.update({ where: { id: shiftId }, data: values });
  } else {
    await prisma.shift.create({ data: { ...values, createdById: admin.id } });
  }

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  return { success: true };
}

export async function deleteShift(shiftId: string) {
  await requireAdmin();
  await prisma.shift.delete({ where: { id: shiftId } });
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
}

export async function publishWeek(weekStartKey: string) {
  await requireAdmin();
  const weekStart = parseDateKey(weekStartKey);
  const days = getWeekDays(weekStart);
  const from = days[0];
  const to = days[6];

  await prisma.shift.updateMany({
    where: {
      status: "DRAFT",
      date: { gte: from, lte: to },
    },
    data: { status: "PUBLISHED" },
  });

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
}
