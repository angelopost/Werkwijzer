import "server-only";
import { prisma } from "@/lib/db";

export async function getCustomerStats(customerId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { customerId },
    include: { service: true, employee: true },
    orderBy: { startTime: "desc" },
  });

  const completed = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED");

  const serviceCounts = new Map<string, { name: string; count: number }>();
  const employeeCounts = new Map<string, { name: string; count: number }>();

  for (const appointment of completed) {
    const s = serviceCounts.get(appointment.serviceId) ?? { name: appointment.service.name, count: 0 };
    s.count += 1;
    serviceCounts.set(appointment.serviceId, s);

    const e = employeeCounts.get(appointment.employeeId) ?? {
      name: `${appointment.employee.firstName} ${appointment.employee.lastName}`,
      count: 0,
    };
    e.count += 1;
    employeeCounts.set(appointment.employeeId, e);
  }

  const favoriteService = [...serviceCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ?? null;
  const preferredEmployee = [...employeeCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ?? null;

  const sortedByDate = [...completed].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return {
    appointments,
    visitCount: completed.length,
    firstVisit: sortedByDate[0]?.startTime ?? null,
    lastVisit: sortedByDate[sortedByDate.length - 1]?.startTime ?? null,
    favoriteService,
    preferredEmployee,
  };
}
