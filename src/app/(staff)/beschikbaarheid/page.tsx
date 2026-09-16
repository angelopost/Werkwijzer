import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDayLabel, getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { WeekNav } from "@/components/layout/week-nav";
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

  return (
    <div className="flex flex-col gap-4">
      <WeekNav basePath="/beschikbaarheid" weekStart={weekStart} />

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
