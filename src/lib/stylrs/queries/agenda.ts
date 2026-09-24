import "server-only";
import { startOfWeek, addDays, startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { weekdayFromDate } from "@/lib/stylrs/constants";

export type AgendaView = "dag" | "week";

export function resolveAgendaRange(view: AgendaView, dateParam?: string) {
  const anchor = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
  if (Number.isNaN(anchor.getTime())) {
    return resolveAgendaRange(view, undefined);
  }

  if (view === "dag") {
    return { days: [startOfDay(anchor)], anchor };
  }

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  return { days, anchor };
}

export async function getAgendaData(salonId: string, days: Date[]) {
  const rangeStart = startOfDay(days[0]);
  const rangeEnd = endOfDay(days[days.length - 1]);

  const [employees, appointments, openingHours] = await Promise.all([
    prisma.employee.findMany({
      where: { salonId, active: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        startTime: { gte: rangeStart, lte: rangeEnd },
        status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] },
      },
      include: { customer: true, employee: true, service: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.openingHours.findMany({ where: { salonId } }),
  ]);

  const relevantHours = days
    .map((d) => openingHours.find((h) => h.weekday === weekdayFromDate(d)))
    .filter((h): h is NonNullable<typeof h> => !!h && !h.isClosed && !!h.openTime && !!h.closeTime);

  const openMinutes = relevantHours.length
    ? Math.min(...relevantHours.map((h) => toMinutes(h.openTime!)))
    : 8 * 60;
  const closeMinutes = relevantHours.length
    ? Math.max(...relevantHours.map((h) => toMinutes(h.closeTime!)))
    : 20 * 60;

  return {
    employees,
    appointments,
    openingHours,
    gridStartMinutes: Math.min(openMinutes, 8 * 60),
    gridEndMinutes: Math.max(closeMinutes, 18 * 60),
  };
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
