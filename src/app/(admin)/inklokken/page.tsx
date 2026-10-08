import { prisma } from "@/lib/db";
import {
  addUTCDays,
  formatWeekRangeLabel,
  getAmsterdamDayRangeUtc,
  getAmsterdamToday,
  getWeekStart,
  parseDateKey,
  shiftWeek,
  toDateKey,
} from "@/lib/dates";
import { TeamStatus } from "@/components/inklok/team-status";
import { AdminTimeEntryLog } from "@/components/inklok/admin-time-entry-log";
import { InklokFilters } from "@/components/inklok/inklok-filters";
import { updateTimeEntry, deleteTimeEntry } from "./actions";

export default async function InklokkenPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; userId?: string; week?: string }>;
}) {
  const params = await searchParams;

  const staff = await prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    orderBy: { name: "asc" },
    include: { timeEntries: { where: { clockOut: null }, take: 1 } },
  });

  const thisWeekStart = getWeekStart(getAmsterdamToday());
  const customRange = Boolean(params.from || params.to);
  const allWeeks = params.week === "alle";
  // Standaard (zonder keuze) toont de lijst de huidige week; een eigen periode (Van/Tot)
  // of "Alle weken" schakelt het weekfilter uit.
  const weekStart =
    customRange || allWeeks
      ? null
      : params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
        ? getWeekStart(parseDateKey(params.week))
        : thisWeekStart;

  const entryWhere: { userId?: string; clockIn?: { gte?: Date; lt?: Date } } = {};
  if (params.userId) entryWhere.userId = params.userId;
  if (weekStart) {
    entryWhere.clockIn = {
      gte: getAmsterdamDayRangeUtc(toDateKey(weekStart)).start,
      lt: getAmsterdamDayRangeUtc(toDateKey(addUTCDays(weekStart, 6))).end,
    };
  } else if (customRange) {
    entryWhere.clockIn = {};
    if (params.from) entryWhere.clockIn.gte = getAmsterdamDayRangeUtc(params.from).start;
    if (params.to) entryWhere.clockIn.lt = getAmsterdamDayRangeUtc(params.to).end;
  }

  const recentEntries = await prisma.timeEntry.findMany({
    where: entryWhere,
    orderBy: { clockIn: "desc" },
    take: 500,
    include: { user: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <InklokFilters
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
        weekStart={weekStart ? toDateKey(weekStart) : null}
        weekLabel={formatWeekRangeLabel(weekStart ?? thisWeekStart)}
        prevWeek={toDateKey(shiftWeek(weekStart ?? thisWeekStart, -1))}
        nextWeek={toDateKey(shiftWeek(weekStart ?? thisWeekStart, 1))}
        thisWeek={toDateKey(thisWeekStart)}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Team</h2>
        <TeamStatus
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            openSince: s.timeEntries[0] ? s.timeEntries[0].clockIn.toISOString() : null,
          }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Registraties</h2>
        <AdminTimeEntryLog
          entries={recentEntries.map((e) => ({
            id: e.id,
            clockIn: e.clockIn.toISOString(),
            clockOut: e.clockOut ? e.clockOut.toISOString() : null,
            employeeName: e.user.name,
            status: e.status,
            correctionMinutes: e.correctionMinutes,
            reviewNote: e.reviewNote,
          }))}
          onSave={updateTimeEntry}
          onDelete={deleteTimeEntry}
        />
      </section>
    </div>
  );
}
