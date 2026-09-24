import { format, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { resolveAgendaRange, getAgendaData, type AgendaView } from "@/lib/stylrs/queries/agenda";
import { PageHeader } from "@/components/stylrs/page-header";
import { AgendaToolbar } from "@/components/stylrs/agenda/agenda-toolbar";
import { AgendaGrid, type AgendaAppointment, type AgendaColumn } from "@/components/stylrs/agenda/agenda-grid";
import { dayKey } from "@/lib/stylrs/agenda-utils";
import { NewAppointmentDialog } from "@/components/stylrs/agenda/new-appointment-dialog";
import { EmptyState } from "@/components/stylrs/empty-state";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const user = await requireSalonUser();
  const { view: viewParam, date } = await searchParams;
  const view: AgendaView = viewParam === "dag" ? "dag" : "week";
  const { days, anchor } = resolveAgendaRange(view, date);

  const { employees, appointments, gridStartMinutes, gridEndMinutes } = await getAgendaData(user.salonId, days);

  const [customers, services] = await Promise.all([
    prisma.customer.findMany({ where: { salonId: user.salonId }, orderBy: { lastName: "asc" } }),
    prisma.service.findMany({
      where: { salonId: user.salonId, active: true },
      include: { employees: { select: { employeeId: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const agendaAppointments: AgendaAppointment[] = appointments.map((a) => ({
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

  let columns: AgendaColumn[];
  const appointmentsByColumn = new Map<string, AgendaAppointment[]>();

  if (view === "dag") {
    columns = employees.map((e) => ({ key: e.id, label: `${e.firstName} ${e.lastName}` }));
    for (const employee of employees) {
      appointmentsByColumn.set(
        employee.id,
        agendaAppointments.filter((a) => a.employee.id === employee.id)
      );
    }
  } else {
    columns = days.map((d) => ({
      key: dayKey(d),
      label: format(d, "EEE d MMM", { locale: nl }),
      isToday: isSameDay(d, new Date()),
    }));
    for (const d of days) {
      appointmentsByColumn.set(
        dayKey(d),
        agendaAppointments.filter((a) => isSameDay(a.startTime, d))
      );
    }
  }

  const servicesForDialog = services.map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    durationMinutes: s.durationMinutes,
    employeeIds: s.employees.map((e) => e.employeeId),
  }));

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader
        title="Agenda"
        action={
          <NewAppointmentDialog
            customers={customers}
            employees={employees}
            services={servicesForDialog}
            defaultDate={format(anchor, "yyyy-MM-dd")}
            trigger={<Button>+ Nieuwe afspraak</Button>}
          />
        }
      />
      <AgendaToolbar view={view} anchor={anchor} />

      {employees.length === 0 || services.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nog niet klaar om afspraken in te plannen"
          description="Voeg eerst een medewerker en een behandeling toe voordat je afspraken kunt inplannen."
        />
      ) : (
        <AgendaGrid
          columns={columns}
          appointmentsByColumn={appointmentsByColumn}
          gridStartMinutes={gridStartMinutes}
          gridEndMinutes={gridEndMinutes}
          employees={employees}
        />
      )}
    </div>
    </StylrsAppShellGuard>
  );
}
