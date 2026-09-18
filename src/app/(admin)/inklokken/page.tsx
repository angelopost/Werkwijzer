import { prisma } from "@/lib/db";
import { getAmsterdamDayRangeUtc } from "@/lib/dates";
import { TeamStatus } from "@/components/inklok/team-status";
import { AdminTimeEntryLog } from "@/components/inklok/admin-time-entry-log";
import { InklokFilters } from "@/components/inklok/inklok-filters";
import { updateTimeEntry, deleteTimeEntry } from "./actions";

export default async function InklokkenPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; userId?: string }>;
}) {
  const params = await searchParams;

  const staff = await prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    orderBy: { name: "asc" },
    include: { timeEntries: { where: { clockOut: null }, take: 1 } },
  });

  const entryWhere: { userId?: string; clockIn?: { gte: Date; lt: Date } } = {};
  if (params.userId) entryWhere.userId = params.userId;
  if (params.date) {
    const { start, end } = getAmsterdamDayRangeUtc(params.date);
    entryWhere.clockIn = { gte: start, lt: end };
  }

  const recentEntries = await prisma.timeEntry.findMany({
    where: entryWhere,
    orderBy: { clockIn: "desc" },
    take: 100,
    include: { user: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <InklokFilters staff={staff.map((s) => ({ id: s.id, name: s.name }))} />

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
