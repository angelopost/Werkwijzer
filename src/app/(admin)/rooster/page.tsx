import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatWeekRangeLabel, getWeekDays, getWeekStart, parseDateKey, shiftWeek, toDateKey } from "@/lib/dates";
import { RoosterGrid } from "@/components/rooster/rooster-grid";
import { Button } from "@/components/ui/button";
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

  const [staff, functies, shifts, leaveRequests, availability] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
      include: { functies: { include: { functie: true } } },
    }),
    prisma.functie.findMany({ orderBy: { name: "asc" } }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to } },
      include: { functie: true, assignedUser: true },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { lte: to }, endDate: { gte: from } },
    }),
    prisma.availability.findMany({ where: { date: { gte: from, lte: to } } }),
  ]);

  const hasDraft = shifts.some((s) => s.status === "DRAFT");
  const prevWeekKey = toDateKey(shiftWeek(weekStart, -1));
  const nextWeekKey = toDateKey(shiftWeek(weekStart, 1));
  const todayWeekKey = toDateKey(getWeekStart(new Date()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/rooster?week=${prevWeekKey}`}>&larr;</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/rooster?week=${todayWeekKey}`}>Deze week</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/rooster?week=${nextWeekKey}`}>&rarr;</Link>}
          />
          <span className="ml-2 text-sm font-medium">{formatWeekRangeLabel(weekStart)}</span>
        </div>
        <form action={publishWeek.bind(null, weekStartKey)}>
          <Button type="submit" disabled={!hasDraft}>
            {hasDraft ? "Publiceren" : "Gepubliceerd"}
          </Button>
        </form>
      </div>

      <RoosterGrid
        weekStartKey={weekStartKey}
        staff={staff.map((s) => ({
          id: s.id,
          name: s.name,
          functieIds: s.functies.map((f) => f.functieId),
        }))}
        functies={functies}
        shifts={shifts.map((s) => ({
          id: s.id,
          date: toDateKey(s.date),
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          breakMinutes: s.breakMinutes,
          notes: s.notes,
          status: s.status,
          assignedUserId: s.assignedUserId,
          functieId: s.functieId,
          functieName: s.functie?.name ?? null,
          functieColor: s.functie?.color ?? null,
        }))}
        leavePeriods={leaveRequests.map((l) => ({
          userId: l.userId,
          type: l.type,
          startDate: toDateKey(l.startDate),
          endDate: toDateKey(l.endDate),
        }))}
        availability={availability.map((a) => ({
          userId: a.userId,
          date: toDateKey(a.date),
          status: a.status,
        }))}
      />
    </div>
  );
}
