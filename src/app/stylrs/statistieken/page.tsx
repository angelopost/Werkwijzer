import {
  CalendarDays,
  CalendarRange,
  UserPlus,
  Repeat,
  Heart,
  Flame,
  Users2,
  Euro,
  Gauge,
  XCircle,
  AlarmClockOff,
} from "lucide-react";
import { requireOwner } from "@/lib/stylrs/permissions";
import { getStatistics } from "@/lib/stylrs/queries/statistics";
import { PageHeader } from "@/components/stylrs/page-header";
import { StatCard } from "@/components/stylrs/stat-card";
import { WeekdayBarChart } from "@/components/stylrs/statistieken/weekday-bar-chart";
import { formatCurrency } from "@/lib/stylrs/format";
import { StylrsAppShellGuard } from "@/components/stylrs/layout/app-shell-guard";

export default async function StatistiekenPage() {
  const user = await requireOwner();
  const stats = await getStatistics(user.salonId);

  return (
    <StylrsAppShellGuard>
    <div>
      <PageHeader title="Statistieken" description="Zo presteert jouw salon." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Afspraken deze week" value={stats.appointmentsThisWeek} icon={CalendarDays} />
        <StatCard label="Afspraken deze maand" value={stats.appointmentsThisMonth} icon={CalendarRange} />
        <StatCard label="Nieuwe klanten" value={stats.newCustomersThisMonth} icon={UserPlus} tone="positive" />
        <StatCard label="Terugkerende klanten" value={stats.returningCustomersThisMonth} icon={Repeat} />
        <StatCard label="Populairste behandeling" value={stats.favoriteService ?? "—"} icon={Heart} />
        <StatCard label="Drukste dag" value={stats.busiestDay ?? "—"} icon={Flame} />
        <StatCard label="Drukste medewerker" value={stats.busiestEmployee ?? "—"} icon={Users2} />
        <StatCard label="Gem. afspraakwaarde" value={formatCurrency(stats.averageValue)} icon={Euro} />
        <StatCard
          label="Bezettingsgraad deze week"
          value={`${Math.round(stats.occupancyRate * 100)}%`}
          icon={Gauge}
        />
        <StatCard label="Annuleringen deze maand" value={stats.cancelledThisMonth} icon={XCircle} tone="warning" />
        <StatCard label="No-shows deze maand" value={stats.noShowThisMonth} icon={AlarmClockOff} tone="warning" />
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-foreground">Afspraken per weekdag (laatste 180 dagen)</h3>
        <WeekdayBarChart counts={stats.weekdayCounts} />
      </div>
    </div>
    </StylrsAppShellGuard>
  );
}
