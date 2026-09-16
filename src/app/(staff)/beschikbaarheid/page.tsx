import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDayLabel, formatWeekRangeLabel, getWeekDays, getWeekStart, parseDateKey, shiftWeek, toDateKey } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { AvailabilityWeekForm } from "./availability-week-form";

export default async function BeschikbaarheidPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;

  const params = await searchParams;
  const weekStart = params.week ? parseDateKey(params.week) : getWeekStart(new Date());
  const weekStartKey = toDateKey(weekStart);
  const days = getWeekDays(weekStart);
  const from = days[0];
  const to = days[6];

  const records = await prisma.availability.findMany({
    where: { userId, date: { gte: from, lte: to } },
  });
  const byDate = new Map(records.map((r) => [toDateKey(r.date), r]));

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
          render={<Link href={`/beschikbaarheid?week=${prevWeekKey}`}>&larr;</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/beschikbaarheid?week=${todayWeekKey}`}>Deze week</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/beschikbaarheid?week=${nextWeekKey}`}>&rarr;</Link>}
        />
        <span className="ml-2 text-sm font-medium">{formatWeekRangeLabel(weekStart)}</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Geef per dag aan of je beschikbaar bent. De beheerder ziet dit als hulp bij het inplannen, maar kan
        altijd zelf een dienst inplannen.
      </p>

      <AvailabilityWeekForm
        key={weekStartKey}
        initialDays={days.map((day) => {
          const key = toDateKey(day);
          const record = byDate.get(key);
          return {
            dateKey: key,
            label: formatDayLabel(day),
            status: record?.status ?? null,
            note: record?.note ?? "",
          };
        })}
      />
    </div>
  );
}
