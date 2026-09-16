import { prisma } from "@/lib/db";
import { addUTCDays, combineDateAndTime, getWeekDays, getWeekdayIndex, toDateKey } from "@/lib/dates";

/** Hoe ver vooruit shifts direct worden aangemaakt zodra een vast patroon wordt ingesteld. */
const HORIZON_WEEKS = 26;

type ShiftCreateInput = {
  date: Date;
  startTime: Date;
  endTime: Date;
  breakMinutes: number;
  notes: string | null;
  assignedUserId: string;
  createdById: string;
  permanentShiftId: string;
};

function occurrencesInRange(weekday: number, activeFrom: Date, rangeStart: Date, rangeEnd: Date): Date[] {
  const start = activeFrom > rangeStart ? activeFrom : rangeStart;
  if (start > rangeEnd) return [];

  const dates: Date[] = [];
  let cursor = addUTCDays(start, (weekday - getWeekdayIndex(start) + 7) % 7);
  while (cursor <= rangeEnd) {
    dates.push(cursor);
    cursor = addUTCDays(cursor, 7);
  }
  return dates;
}

/** Vult ontbrekende shifts voor actieve vaste patronen binnen [rangeStart, rangeEnd] aan.
 * Bestaande shifts op diezelfde dag worden nooit overschreven (zo blijft een handmatig
 * geruilde/gewijzigde dag gewoon staan zoals de beheerder die heeft aangepast). */
export async function materializePermanentShifts(rangeStart: Date, rangeEnd: Date) {
  const templates = await prisma.permanentShift.findMany({
    where: { activeFrom: { lte: rangeEnd } },
  });
  if (templates.length === 0) return;

  const existing = await prisma.shift.findMany({
    where: {
      date: { gte: rangeStart, lte: rangeEnd },
      assignedUserId: { in: [...new Set(templates.map((t) => t.userId))] },
    },
    select: { assignedUserId: true, date: true },
  });
  const existingKeys = new Set(existing.map((s) => `${s.assignedUserId}_${toDateKey(s.date)}`));

  const toCreate: ShiftCreateInput[] = [];
  for (const template of templates) {
    for (const date of occurrencesInRange(template.weekday, template.activeFrom, rangeStart, rangeEnd)) {
      const key = `${template.userId}_${toDateKey(date)}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);

      const dateKey = toDateKey(date);
      toCreate.push({
        date,
        startTime: combineDateAndTime(dateKey, template.startTime),
        endTime: combineDateAndTime(dateKey, template.endTime),
        breakMinutes: template.breakMinutes,
        notes: template.notes,
        assignedUserId: template.userId,
        createdById: template.createdById,
        permanentShiftId: template.id,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.shift.createMany({ data: toCreate });
  }
}

export async function materializePermanentShiftsForWeek(weekStart: Date) {
  const days = getWeekDays(weekStart);
  await materializePermanentShifts(days[0], days[6]);
}

export async function createPermanentShift(input: {
  userId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
  activeFrom: Date;
  createdById: string;
}) {
  const template = await prisma.permanentShift.create({ data: input });

  // Koppel de shift die net is aangemaakt/bewerkt (op activeFrom zelf) alvast aan het patroon.
  await prisma.shift.updateMany({
    where: { assignedUserId: input.userId, date: input.activeFrom, permanentShiftId: null },
    data: { permanentShiftId: template.id },
  });

  const horizonEnd = addUTCDays(input.activeFrom, HORIZON_WEEKS * 7);
  await materializePermanentShifts(input.activeFrom, horizonEnd);

  return template;
}
