import { prisma } from "@/lib/db";
import { getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { StaffWeekGrid } from "@/components/rooster/staff-week-grid";
import { WeekNav } from "@/components/layout/week-nav";

export default async function MijnRoosterPage({
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

  const [staff, shifts, leaveRequests] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: [{ contractType: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to }, status: "PUBLISHED" },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { lte: to }, endDate: { gte: from } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <WeekNav basePath="/mijn-rooster" weekStart={weekStart} />

      <StaffWeekGrid
        weekStartKey={weekStartKey}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
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
