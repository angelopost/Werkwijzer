import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRangeLabel, getWeekStart, shiftWeek, toDateKey } from "@/lib/dates";

export function WeekNav({ basePath, weekStart }: { basePath: string; weekStart: Date }) {
  const prevWeekKey = toDateKey(shiftWeek(weekStart, -1));
  const nextWeekKey = toDateKey(shiftWeek(weekStart, 1));
  const todayWeekKey = toDateKey(getWeekStart(new Date()));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={
            <Link href={`${basePath}?week=${prevWeekKey}`} aria-label="Vorige week">
              <ChevronLeft className="size-4" />
            </Link>
          }
        />
        <span className="flex items-center gap-1.5 px-2 text-sm font-medium whitespace-nowrap">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {formatWeekRangeLabel(weekStart)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={
            <Link href={`${basePath}?week=${nextWeekKey}`} aria-label="Volgende week">
              <ChevronRight className="size-4" />
            </Link>
          }
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`${basePath}?week=${todayWeekKey}`}>Deze week</Link>}
      />
    </div>
  );
}
