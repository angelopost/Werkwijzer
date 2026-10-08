import Link from "next/link";
import { ChevronRight, PartyPopper } from "lucide-react";
import { addUTCDays, formatDayLabel, toDateKey } from "@/lib/dates";
import { formatWorkshopTime } from "./types";

type BannerWorkshop = {
  id: string;
  name: string;
  date: Date;
  startTime: string | null;
  endTime: string | null;
};

function relativeLabel(date: Date, today: Date): string {
  const key = toDateKey(date);
  if (key === toDateKey(today)) return "vandaag";
  if (key === toDateKey(addUTCDays(today, 1))) return "morgen";
  return formatDayLabel(date);
}

/** Meldingen bovenaan het rooster (alleen voor beheerders): welke workshops er zijn,
 * met een link naar de volledige workshop. */
export function WorkshopBanner({ workshops, today }: { workshops: BannerWorkshop[]; today: Date }) {
  if (workshops.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {workshops.map((workshop) => (
        <Link
          key={workshop.id}
          href={`/workshops/${workshop.id}`}
          className="group flex items-center gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-3 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
            <PartyPopper className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
              Workshop {relativeLabel(workshop.date, today)}
            </span>
            <span className="truncate text-sm font-semibold">
              {workshop.name}
              {formatWorkshopTime(workshop.startTime, workshop.endTime) && (
                <span className="font-normal text-amber-900/70 dark:text-amber-200/70">
                  {" · "}
                  {formatWorkshopTime(workshop.startTime, workshop.endTime)}
                </span>
              )}
            </span>
          </div>
          <ChevronRight className="size-4 shrink-0 text-amber-800/70 transition-transform group-hover:translate-x-0.5 dark:text-amber-300/70" />
        </Link>
      ))}
    </div>
  );
}
