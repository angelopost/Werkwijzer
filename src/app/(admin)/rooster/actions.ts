"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { combineDateAndTime, getWeekDays, getWeekdayIndex, parseDateKey, toDateKey } from "@/lib/dates";
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
  const shift = await prisma.shift.delete({ where: { id: shiftId } });

  if (shift.permanentShiftId) {
    await prisma.permanentShiftException.upsert({
      where: {
        permanentShiftId_date: { permanentShiftId: shift.permanentShiftId, date: shift.date },
      },
      create: { permanentShiftId: shift.permanentShiftId, date: shift.date },
      update: {},
    });
  }

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
}

/** Verwijdert een heel vast patroon (alleen nog komende diensten; voorbije diensten
 * blijven staan voor het urenoverzicht) en zorgt dat er niets meer wordt bijgevuld. */
export async function deletePermanentShift(permanentShiftId: string) {
  await requireAdmin();
  const today = parseDateKey(toDateKey(new Date()));

  await prisma.shift.deleteMany({
    where: { permanentShiftId, date: { gte: today } },
  });
  await prisma.permanentShift.delete({ where: { id: permanentShiftId } });

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
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
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
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
      startTime: data.startTime || null,
      endTime: data.endTime || null,
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

  // Vaste patronen die deze week meepubliceren, publiceren we direct helemaal door
  // (alle weken en maanden tegelijk), zodat dat niet per week hoeft te gebeuren.
  const draftPermanentShiftIds = await prisma.shift.findMany({
    where: { status: "DRAFT", date: { gte: from, lte: to }, permanentShiftId: { not: null } },
    select: { permanentShiftId: true },
    distinct: ["permanentShiftId"],
  });
  const permanentShiftIds = draftPermanentShiftIds
    .map((s) => s.permanentShiftId)
    .filter((id): id is string => id !== null);

  await prisma.shift.updateMany({
    where: {
      status: "DRAFT",
      OR: [
        { date: { gte: from, lte: to } },
        ...(permanentShiftIds.length > 0 ? [{ permanentShiftId: { in: permanentShiftIds } }] : []),
      ],
    },
    data: { status: "PUBLISHED" },
  });

  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
}
