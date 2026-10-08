import { prisma } from "@/lib/db";
import {
  addUTCDays,
  getAmsterdamToday,
  getWeekDays,
  getWeekStart,
  parseDateKey,
  toDateKey,
} from "@/lib/dates";
import { materializePermanentShiftsForWeek } from "@/lib/permanent-shifts";
import { getStaffColorIndexes } from "@/lib/staff-colors";
import { RoosterGrid } from "@/components/rooster/rooster-grid";
import { WorkshopBanner } from "@/components/workshops/workshop-banner";
import { Button } from "@/components/ui/button";
import { WeekNav } from "@/components/layout/week-nav";
import { publishWeek } from "./actions";

export default async function RoosterPage({
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

  await materializePermanentShiftsForWeek(weekStart);

  // Workshops van de getoonde week, plus altijd vandaag en morgen als je de huidige week bekijkt
  // (zodat een workshop van maandag al zichtbaar is op zondag).
  const today = getAmsterdamToday();
  const weekContainsToday = today >= from && today <= to;
  const workshopDateFilters = [
    { date: { gte: from, lte: to } },
    ...(weekContainsToday ? [{ date: { gte: today, lte: addUTCDays(today, 1) } }] : []),
  ];

  const [colorIndexes, staff, shifts, leaveRequests, workshops] = await Promise.all([
    getStaffColorIndexes(),
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
    prisma.workshop.findMany({
      where: { OR: workshopDateFilters },
      select: { id: true, name: true, date: true, startTime: true, endTime: true },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const hasDraft = shifts.some((s) => s.status === "DRAFT");

  return (
    <div className="flex flex-col gap-3">
      <WorkshopBanner workshops={workshops} today={today} />

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
          colorIndex: colorIndexes.get(s.id) ?? 0,
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
