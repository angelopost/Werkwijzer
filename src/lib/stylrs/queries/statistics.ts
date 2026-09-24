import "server-only";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { WEEKDAY_LABELS, weekdayFromDate } from "@/lib/stylrs/constants";

const LOOKBACK_DAYS = 180;

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function getStatistics(salonId: string) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lookbackStart = subDays(now, LOOKBACK_DAYS);

  const [appointmentsThisWeek, appointmentsThisMonth, newCustomersThisMonth, cancelledThisMonth, noShowThisMonth, recentAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: { salonId, startTime: { gte: weekStart, lte: weekEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),
      prisma.appointment.count({
        where: { salonId, startTime: { gte: monthStart, lte: monthEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      }),
      prisma.customer.count({ where: { salonId, createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { salonId, status: "CANCELLED", startTime: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.count({ where: { salonId, status: "NO_SHOW", startTime: { gte: monthStart, lte: monthEnd } } }),
      prisma.appointment.findMany({
        where: {
          salonId,
          status: { in: ["CONFIRMED", "COMPLETED"] },
          startTime: { gte: lookbackStart, lte: now },
        },
        include: { service: true, employee: true },
      }),
    ]);

  // Terugkerende klanten deze maand: klanten met een afspraak deze maand die ook al
  // eerder (vóór deze maand) een afspraak hadden.
  const appointmentsAll = await prisma.appointment.findMany({
    where: { salonId, status: { in: ["CONFIRMED", "COMPLETED"] } },
    select: { customerId: true, startTime: true },
  });
  const firstVisitByCustomer = new Map<string, Date>();
  for (const a of appointmentsAll) {
    const existing = firstVisitByCustomer.get(a.customerId);
    if (!existing || a.startTime < existing) firstVisitByCustomer.set(a.customerId, a.startTime);
  }
  const customersThisMonth = new Set(
    appointmentsAll.filter((a) => a.startTime >= monthStart && a.startTime <= monthEnd).map((a) => a.customerId)
  );
  let returningCustomersThisMonth = 0;
  for (const customerId of customersThisMonth) {
    const firstVisit = firstVisitByCustomer.get(customerId);
    if (firstVisit && firstVisit < monthStart) returningCustomersThisMonth += 1;
  }

  // Populairste behandeling & drukste medewerker & drukste dag (laatste 180 dagen)
  const serviceCounts = new Map<string, { name: string; count: number }>();
  const employeeCounts = new Map<string, { name: string; count: number }>();
  const weekdayCounts = new Array(7).fill(0);
  let totalValue = 0;

  for (const a of recentAppointments) {
    const s = serviceCounts.get(a.serviceId) ?? { name: a.service.name, count: 0 };
    s.count += 1;
    serviceCounts.set(a.serviceId, s);

    const e = employeeCounts.get(a.employeeId) ?? { name: `${a.employee.firstName} ${a.employee.lastName}`, count: 0 };
    e.count += 1;
    employeeCounts.set(a.employeeId, e);

    weekdayCounts[weekdayFromDate(a.startTime)] += 1;
    totalValue += Number(a.price);
  }

  const favoriteService = [...serviceCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ?? null;
  const busiestEmployee = [...employeeCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ?? null;
  const busiestWeekdayIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const busiestDay = recentAppointments.length > 0 ? WEEKDAY_LABELS[busiestWeekdayIndex] : null;
  const averageValue = recentAppointments.length > 0 ? totalValue / recentAppointments.length : 0;

  // Bezettingsgraad deze week: geboekte minuten / beschikbare medewerker-minuten.
  const employees = await prisma.employee.findMany({
    where: { salonId, active: true },
    include: { availability: true, timeOff: true },
  });

  let availableMinutes = 0;
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + d);
    for (const employee of employees) {
      const onLeave = employee.timeOff.some((t) => t.startDate <= date && date <= t.endDate);
      if (onLeave) continue;
      const day = employee.availability.find((av) => av.weekday === d);
      if (!day) continue;
      let minutes = timeToMinutes(day.endTime) - timeToMinutes(day.startTime);
      if (day.breakStartTime && day.breakEndTime) {
        minutes -= timeToMinutes(day.breakEndTime) - timeToMinutes(day.breakStartTime);
      }
      availableMinutes += Math.max(minutes, 0);
    }
  }

  const weekAppointmentsWithDuration = await prisma.appointment.findMany({
    where: { salonId, startTime: { gte: weekStart, lte: weekEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    select: { startTime: true, endTime: true },
  });
  const bookedMinutes = weekAppointmentsWithDuration.reduce(
    (sum, a) => sum + (a.endTime.getTime() - a.startTime.getTime()) / 60_000,
    0
  );
  const occupancyRate = availableMinutes > 0 ? Math.min(bookedMinutes / availableMinutes, 1) : 0;

  return {
    appointmentsThisWeek,
    appointmentsThisMonth,
    newCustomersThisMonth,
    returningCustomersThisMonth,
    favoriteService,
    busiestDay,
    busiestEmployee,
    averageValue,
    occupancyRate,
    cancelledThisMonth,
    noShowThisMonth,
    weekdayCounts,
  };
}
