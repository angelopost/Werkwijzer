import { CalendarCheck, Users, UserPlus, Euro, XCircle, AlarmClockOff, Clock } from "lucide-react";
import { requireSalonUser } from "@/lib/stylrs/permissions";
import { getDashboardData } from "@/lib/stylrs/queries/dashboard";
import { PageHeader } from "@/components/stylrs/page-header";
import { StatCard } from "@/components/stylrs/stat-card";
import { EmptyState } from "@/components/stylrs/empty-state";
import { formatCurrency, formatTime } from "@/lib/stylrs/format";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function DashboardPage() {
  const user = await requireSalonUser();
  const data = await getDashboardData(user.salonId);

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader title={`Welkom terug, ${user.name.split(" ")[0]}`} description="Zo staat de salon er vandaag voor." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Afspraken vandaag" value={data.appointmentsToday} icon={CalendarCheck} />
        <StatCard label="Klanten vandaag" value={data.customersToday} icon={Users} />
        <StatCard label="Nieuwe klanten" value={data.newCustomersToday} icon={UserPlus} tone="positive" />
        <StatCard
          label="Verwachte omzet"
          value={formatCurrency(data.expectedRevenueToday)}
          icon={Euro}
          hint="Op basis van geplande behandelingen"
        />
        <StatCard label="Annuleringen" value={data.cancellationsToday} icon={XCircle} tone="warning" />
        <StatCard label="No-shows" value={data.noShowsToday} icon={AlarmClockOff} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4" /> Eerstvolgende afspraak
          </h3>
          {data.nextAppointment ? (
            <div>
              <p className="text-lg font-semibold text-foreground">
                {formatTime(data.nextAppointment.startTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.nextAppointment.service.name} — {data.nextAppointment.customer.firstName}{" "}
                {data.nextAppointment.customer.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                bij {data.nextAppointment.employee.firstName}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Geen aankomende afspraken.</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-foreground">Afspraken vandaag</h3>
          {data.todayAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="Nog geen afspraken vandaag"
              description="Nieuwe afspraken die je zelf inplant of die klanten online boeken, verschijnen hier."
            />
          ) : (
            <ul className="divide-y">
              {data.todayAppointments.map((appointment) => (
                <li key={appointment.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: appointment.employee.color }}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service.name} · {appointment.employee.firstName}
                      </p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-muted-foreground">
                    {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </StylrsAppShellGuard>
  );
}
