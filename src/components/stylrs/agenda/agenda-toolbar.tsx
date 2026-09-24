import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateLong } from "@/lib/stylrs/format";
import { addDays, format } from "date-fns";

export function AgendaToolbar({ view, anchor }: { view: "dag" | "week"; anchor: Date }) {
  const step = view === "dag" ? 1 : 7;
  const prev = format(addDays(anchor, -step), "yyyy-MM-dd");
  const next = format(addDays(anchor, step), "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href={`?view=${view}&date=${prev}`} />}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`?view=${view}&date=${today}`} />}>
          Vandaag
        </Button>
        <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href={`?view=${view}&date=${next}`} />}>
          <ChevronRight className="size-4" />
        </Button>
        <span className="ml-2 text-sm font-medium text-foreground">{formatDateLong(anchor)}</span>
      </div>
      <div className="flex overflow-hidden rounded-lg border">
        <Button
          variant={view === "dag" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-none"
          nativeButton={false}
          render={<Link href={`?view=dag&date=${format(anchor, "yyyy-MM-dd")}`} />}
        >
          Dag
        </Button>
        <Button
          variant={view === "week" ? "secondary" : "ghost"}
          size="sm"
          className="rounded-none"
          nativeButton={false}
          render={<Link href={`?view=week&date=${format(anchor, "yyyy-MM-dd")}`} />}
        >
          Week
        </Button>
      </div>
    </div>
  );
}
