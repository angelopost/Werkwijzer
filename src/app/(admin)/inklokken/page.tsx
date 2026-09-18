import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { ClockButton } from "@/components/inklok/clock-button";
import { TeamStatus } from "@/components/inklok/team-status";
import { AdminTimeEntryLog } from "@/components/inklok/admin-time-entry-log";
import { clockIn, clockOut, updateTimeEntry, deleteTimeEntry } from "./actions";

export default async function InklokkenPage() {
  const admin = await requireAdmin();

  const [openEntry, staff, recentEntries] = await Promise.all([
    prisma.timeEntry.findFirst({ where: { userId: admin.id, clockOut: null } }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
      include: { timeEntries: { where: { clockOut: null }, take: 1 } },
    }),
    prisma.timeEntry.findMany({
      orderBy: { clockIn: "desc" },
      take: 30,
      include: { user: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <ClockButton
        initialClockIn={openEntry ? openEntry.clockIn.toISOString() : null}
        onClockIn={clockIn}
        onClockOut={clockOut}
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
        <h2 className="text-sm font-semibold text-muted-foreground">Recente registraties</h2>
        <AdminTimeEntryLog
          entries={recentEntries.map((e) => ({
            id: e.id,
            clockIn: e.clockIn.toISOString(),
            clockOut: e.clockOut ? e.clockOut.toISOString() : null,
            employeeName: e.user.name,
          }))}
          onSave={updateTimeEntry}
          onDelete={deleteTimeEntry}
        />
      </section>
    </div>
  );
}
