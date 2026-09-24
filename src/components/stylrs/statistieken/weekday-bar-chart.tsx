import { WEEKDAY_LABELS_SHORT } from "@/lib/stylrs/constants";

const CHART_HEIGHT = 120;

export function WeekdayBarChart({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);

  return (
    <div className="flex items-end gap-2" style={{ height: CHART_HEIGHT + 40 }}>
      {counts.map((count, i) => {
        const barHeight = count > 0 ? Math.max((count / max) * CHART_HEIGHT, 6) : 2;
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height: CHART_HEIGHT + 40 }}>
            <span className="text-xs text-muted-foreground">{count}</span>
            <div className="w-full rounded-t-md bg-primary/80" style={{ height: barHeight }} />
            <span className="text-xs text-muted-foreground">{WEEKDAY_LABELS_SHORT[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
