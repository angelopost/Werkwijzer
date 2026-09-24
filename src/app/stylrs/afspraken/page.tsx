import { prisma } from "@/lib/db";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { PageHeader } from "@/components/stylrs/page-header";
import { EmptyState } from "@/components/stylrs/empty-state";
import { AppointmentsTable } from "@/components/stylrs/afspraken/appointments-table";
import { CalendarX } from "lucide-react";
import type { AgendaAppointment } from "@/components/stylrs/agenda/agenda-grid";
import Link from "next/link";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

const FILTERS = {
  aankomend: "Aankomend",
  alles: "Alles",
  afgerond: "Afgerond",
  geannuleerd: "Geannuleerd",
} as const;

export default async function AfsprakenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireSalonUser();
  const { status } = await searchParams;
  const filter = status && status in FILTERS ? (status as keyof typeof FILTERS) : "aankomend";

  const where =
    filter === "aankomend"
      ? { salonId: user.salonId, status: "CONFIRMED" as const, startTime: { gte: new Date() } }
      : filter === "afgerond"
        ? { salonId: user.salonId, status: "COMPLETED" as const }
        : filter === "geannuleerd"
          ? { salonId: user.salonId, status: "CANCELLED" as const }
          : { salonId: user.salonId };

  const [appointments, employees] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { customer: true, employee: true, service: true },
      orderBy: { startTime: filter === "aankomend" ? "asc" : "desc" },
      take: 200,
    }),
    prisma.employee.findMany({ where: { salonId: user.salonId }, orderBy: { firstName: "asc" } }),
  ]);

  const rows: AgendaAppointment[] = appointments.map((a) => ({
    id: a.id,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    note: a.note,
    price: Number(a.price),
    customer: { firstName: a.customer.firstName, lastName: a.customer.lastName },
    employee: {
      id: a.employee.id,
      firstName: a.employee.firstName,
      lastName: a.employee.lastName,
      color: a.employee.color,
    },
    service: { name: a.service.name },
  }));

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader title="Afspraken" description="Alle afspraken van jouw salon op een rij." />

      <div className="mb-4 flex gap-1 overflow-x-auto">
        {Object.entries(FILTERS).map(([key, label]) => (
          <Link
            key={key}
            href={`?status=${key}`}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={CalendarX} title="Geen afspraken" description="Er zijn geen afspraken in dit overzicht." />
      ) : (
        <AppointmentsTable appointments={rows} employees={employees} />
      )}
    </div>
    </StylrsAppShellGuard>
  );
}
