import "server-only";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getDashboardData(salonId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [todayAppointments, newCustomersToday, nextAppointment] = await Promise.all([
    prisma.appointment.findMany({
      where: { salonId, startTime: { gte: dayStart, lte: dayEnd } },
      include: { customer: true, employee: true, service: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.customer.count({
      where: { salonId, createdAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.appointment.findFirst({
      where: {
        salonId,
        status: "CONFIRMED",
        startTime: { gte: now },
      },
      include: { customer: true, employee: true, service: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const active = todayAppointments.filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED");
  const cancelled = todayAppointments.filter((a) => a.status === "CANCELLED");
  const noShows = todayAppointments.filter((a) => a.status === "NO_SHOW");
  const uniqueCustomerIds = new Set(active.map((a) => a.customerId));
  const expectedRevenue = active.reduce((sum, a) => sum + Number(a.price), 0);

  return {
    appointmentsToday: active.length,
    customersToday: uniqueCustomerIds.size,
    newCustomersToday,
    cancellationsToday: cancelled.length,
    noShowsToday: noShows.length,
    expectedRevenueToday: expectedRevenue,
    nextAppointment,
    todayAppointments: active,
  };
}
