import { cn } from "@/lib/utils";
import { WORKSHOP_STATUS_LABEL, type WorkshopStatus } from "./types";

type Tone = "green" | "amber" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  neutral: "bg-muted text-muted-foreground",
};

const DOT_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  neutral: "bg-muted-foreground/50",
};

export const STATUS_TONE: Record<WorkshopStatus, Tone> = {
  OPEN: "neutral",
  REMINDER: "amber",
  AFGEHANDELD: "green",
};

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone]
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASSES[tone])} />
      {children}
    </span>
  );
}

/** De drie opvolgstatussen van een workshop in één oogopslag: groen = gedaan. */
export function WorkshopStatusBadges({
  status,
  paymentLinkSent,
  paid,
}: {
  status: WorkshopStatus;
  paymentLinkSent: boolean;
  paid: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill tone={STATUS_TONE[status]}>{WORKSHOP_STATUS_LABEL[status]}</Pill>
      <Pill tone={paymentLinkSent ? "green" : "neutral"}>
        {paymentLinkSent ? "Betaallink verstuurd" : "Betaallink niet verstuurd"}
      </Pill>
      <Pill tone={paid ? "green" : "neutral"}>{paid ? "Betaald" : "Nog niet betaald"}</Pill>
    </div>
  );
}
