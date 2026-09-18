import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/permissions";
import { ClockButton } from "@/components/inklok/clock-button";
import { StaffTimeEntryLog } from "@/components/inklok/staff-time-entry-log";
import { clockIn, clockOut, submitTimeEntry } from "./actions";

export default async function MijnInklokPage() {
  const user = await requireStaff();

  const [openEntry, recentEntries] = await Promise.all([
    prisma.timeEntry.findFirst({ where: { userId: user.id, clockOut: null } }),
    prisma.timeEntry.findMany({
      where: { userId: user.id },
      orderBy: { clockIn: "desc" },
      take: 20,
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
        <h2 className="text-sm font-semibold text-muted-foreground">Mijn registraties</h2>
        <StaffTimeEntryLog
          entries={recentEntries.map((e) => ({
            id: e.id,
            clockIn: e.clockIn.toISOString(),
            clockOut: e.clockOut ? e.clockOut.toISOString() : null,
            status: e.status,
            correctionMinutes: e.correctionMinutes,
            reviewNote: e.reviewNote,
          }))}
          onSubmit={submitTimeEntry}
        />
      </section>
    </div>
  );
}
