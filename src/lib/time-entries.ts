import { prisma } from "@/lib/db";
import { combineDateAndTime, formatClockTime, getAmsterdamDateKey } from "@/lib/dates";

export async function getOpenTimeEntry(userId: string) {
  return prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
}

export async function clockInUser(userId: string) {
  const open = await getOpenTimeEntry(userId);
  if (open) return { error: "Je bent al ingeklokt." as const };

  const entry = await prisma.timeEntry.create({
    data: { userId, clockIn: new Date() },
  });
  return { entry };
}

export async function clockOutUser(userId: string) {
  const open = await getOpenTimeEntry(userId);
  if (!open) return { error: "Je bent niet ingeklokt." as const };

  const entry = await prisma.timeEntry.update({
    where: { id: open.id },
    data: { clockOut: new Date() },
  });
  return { entry };
}

export async function submitTimeEntry(userId: string, entryId: string) {
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) return { error: "Registratie niet gevonden." as const };
  if (!entry.clockOut) return { error: "Deze registratie is nog niet uitgeklokt." as const };
  if (entry.status) return { error: "Deze registratie is al ingediend." as const };

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: { status: "PENDING", submittedAt: new Date() },
  });
  return { success: true as const };
}

/** Keurt een ingediende registratie goed. `correctionMinutes` wordt toegepast op de
 * uitkloktijd (positief = later, negatief = eerder); de inkloktijd blijft ongewijzigd.
 * Zoekt de geplande Shift van deze medewerker op die dag en werkt die automatisch bij. */
export async function approveTimeEntry(
  entryId: string,
  adminId: string,
  correctionMinutes: number,
  reviewNote: string | null
) {
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });
  if (!entry || !entry.clockOut) return { error: "Registratie is niet compleet." as const };

  const adjustedClockOut = new Date(entry.clockOut.getTime() + correctionMinutes * 60_000);
  if (adjustedClockOut <= entry.clockIn) {
    return { error: "De aangepaste eindtijd moet na de inkloktijd liggen." as const };
  }

  const dateKey = getAmsterdamDateKey(entry.clockIn);
  const newStartTime = combineDateAndTime(dateKey, formatClockTime(entry.clockIn));
  const newEndTime = combineDateAndTime(dateKey, formatClockTime(adjustedClockOut));
  const shiftDate = new Date(`${dateKey}T00:00:00Z`);

  const existingShift = await prisma.shift.findFirst({
    where: { assignedUserId: entry.userId, date: shiftDate },
  });

  let shiftId: string;
  if (existingShift) {
    shiftId = existingShift.id;
    await prisma.shift.update({
      where: { id: existingShift.id },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        correctionMinutes,
        correctionNote: reviewNote,
      },
    });
  } else {
    // Geen geplande dienst die dag: de goedgekeurde inkloktijd wordt zelf de dienst,
    // direct gepubliceerd zodat 'm ook meteen zichtbaar en meegeteld wordt.
    const created = await prisma.shift.create({
      data: {
        date: shiftDate,
        startTime: newStartTime,
        endTime: newEndTime,
        breakMinutes: 0,
        status: "PUBLISHED",
        assignedUserId: entry.userId,
        createdById: adminId,
        correctionMinutes,
        correctionNote: reviewNote,
      },
    });
    shiftId = created.id;
  }

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      status: "APPROVED",
      correctionMinutes,
      reviewNote,
      reviewedById: adminId,
      reviewedAt: new Date(),
      shiftId,
    },
  });

  return { success: true as const };
}

/** Wijst een ingediende registratie af: de registratie wordt volledig verwijderd, zodat
 * 'm ook direct verdwijnt uit het overzicht van de medewerker bij Inklokken. */
export async function rejectTimeEntry(entryId: string) {
  await prisma.timeEntry.delete({ where: { id: entryId } });
}
