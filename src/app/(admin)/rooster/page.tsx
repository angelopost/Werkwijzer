import { prisma } from "@/lib/db";
import { getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { materializePermanentShiftsForWeek } from "@/lib/permanent-shifts";
import { RoosterGrid } from "@/components/rooster/rooster-grid";
import { Button } from "@/components/ui/button";
import { WeekNav } from "@/components/layout/week-nav";
import { publishWeek } from "./actions";

export default async function RoosterPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekStart = params.week ? parseDateKey(params.week) : getWeekStart(new Date());
  const weekStartKey = toDateKey(weekStart);
  const days = getWeekDays(weekStart);
  const from = days[0];
  const to = days[6];

  await materializePermanentShiftsForWeek(weekStart);

  const [staff, shifts, leaveRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: [{ contractType: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to } },
      include: { assignedUser: true },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { lte: to }, endDate: { gte: from } },
    }),
  ]);

  const hasDraft = shifts.some((s) => s.status === "DRAFT");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <WeekNav basePath="/rooster" weekStart={weekStart} />
        <form action={publishWeek.bind(null, weekStartKey)}>
          <Button type="submit" disabled={!hasDraft} className="w-full sm:w-auto">
            {hasDraft ? "Publiceren" : "Gepubliceerd"}
          </Button>
        </form>
      </div>

      <RoosterGrid
        weekStartKey={weekStartKey}
        staff={staff.map((s) => ({
          id: s.id,
          name: s.name,
          contractType: s.contractType,
        }))}
        shifts={shifts.map((s) => ({
          id: s.id,
          date: toDateKey(s.date),
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          breakMinutes: s.breakMinutes,
          notes: s.notes,
          status: s.status,
          assignedUserId: s.assignedUserId,
          permanentShiftId: s.permanentShiftId,
          correctionMinutes: s.correctionMinutes,
          correctionNote: s.correctionNote,
        }))}
        leavePeriods={leaveRequests.map((l) => ({
          id: l.id,
          userId: l.userId,
          type: l.type,
          startDate: toDateKey(l.startDate),
          endDate: toDateKey(l.endDate),
          startTime: l.startTime,
          endTime: l.endTime,
          reason: l.reason,
        }))}
      />
    </div>
  );
}
