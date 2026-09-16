"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { combineDateAndTime, getWeekDays, getWeekdayIndex, parseDateKey } from "@/lib/dates";
import { createPermanentShift } from "@/lib/permanent-shifts";
import { shiftFormSchema } from "@/lib/validation/shift";
import { leaveFormSchema } from "@/lib/validation/leave";

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
  };

  if (typeof shiftId === "string" && shiftId) {
    await prisma.shift.update({ where: { id: shiftId }, data: values });
  } else {
    await prisma.shift.create({ data: { ...values, createdById: admin.id } });
  }

  if (data.permanent) {
    await createPermanentShift({
      userId: data.assignedUserId,
      weekday: getWeekdayIndex(values.date),
      startTime: data.startTime,
      endTime: data.endTime,
      breakMinutes: data.breakMinutes,
      notes: data.notes || null,
      activeFrom: values.date,
      createdById: admin.id,
    });
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

export async function updateLeavePeriod(
  leaveId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = leaveFormSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      type: data.type,
      startDate: parseDateKey(data.startDate),
      endDate: parseDateKey(data.endDate),
      reason: data.reason || null,
    },
  });

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/verlof");
  return { success: true };
}

export async function deleteLeavePeriod(leaveId: string) {
  await requireAdmin();
  await prisma.leaveRequest.delete({ where: { id: leaveId } });
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/verlof");
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
