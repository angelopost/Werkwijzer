import { prisma } from "@/lib/db";
import { getAmsterdamToday, getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { getStaffColorIndexes } from "@/lib/staff-colors";
import { StaffWeekGrid } from "@/components/rooster/staff-week-grid";
import { WeekNav } from "@/components/layout/week-nav";
import { CurrentWeekGuard } from "@/components/layout/current-week-guard";

export default async function MijnRoosterPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekStart = params.week ? parseDateKey(params.week) : getWeekStart(getAmsterdamToday());
  const weekStartKey = toDateKey(weekStart);
  const days = getWeekDays(weekStart);
  const from = days[0];
  const to = days[6];

  const [colorIndexes, staff, shifts, leaveRequests] = await Promise.all([
    getStaffColorIndexes(),
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
      <CurrentWeekGuard
        basePath="/mijn-rooster"
        weekKey={weekStartKey}
        todayKey={toDateKey(getAmsterdamToday())}
        explicitWeek={Boolean(params.week)}
      />
      <WeekNav basePath="/mijn-rooster" weekStart={weekStart} />

      <StaffWeekGrid
        weekStartKey={weekStartKey}
        staff={staff.map((s) => ({ id: s.id, name: s.name, colorIndex: colorIndexes.get(s.id) ?? 0 }))}
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
