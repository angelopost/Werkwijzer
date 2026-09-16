import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatWeekRangeLabel, getWeekDays, getWeekStart, parseDateKey, shiftWeek, toDateKey } from "@/lib/dates";
import { StaffWeekGrid } from "@/components/rooster/staff-week-grid";
import { Button } from "@/components/ui/button";

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

  const [staff, shifts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to }, status: "PUBLISHED" },
      include: { functie: true },
    }),
  ]);

  const prevWeekKey = toDateKey(shiftWeek(weekStart, -1));
  const nextWeekKey = toDateKey(shiftWeek(weekStart, 1));
  const todayWeekKey = toDateKey(getWeekStart(new Date()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/mijn-rooster?week=${prevWeekKey}`}>&larr;</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/mijn-rooster?week=${todayWeekKey}`}>Deze week</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/mijn-rooster?week=${nextWeekKey}`}>&rarr;</Link>}
        />
        <span className="ml-2 text-sm font-medium">{formatWeekRangeLabel(weekStart)}</span>
      </div>

      <StaffWeekGrid
        weekStartKey={weekStartKey}
        staff={staff.map((s) => ({ id: s.id, name: s.name, functieIds: [] }))}
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
      />
    </div>
  );
}
