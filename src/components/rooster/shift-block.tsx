"use client";

import { Repeat } from "lucide-react";
import { formatTime } from "@/lib/dates";
import { formatDurationShort, shiftHours } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { staffPalette } from "./staff-colors";
import type { LeavePeriod, ShiftItem } from "./types";

const LEAVE_LABEL: Record<LeavePeriod["type"], string> = { VERLOF: "Verlof", ZIEK: "Ziek" };
const LEAVE_COLOR: Record<LeavePeriod["type"], string> = { VERLOF: "#d97706", ZIEK: "#ea580c" };

/** Eén dienst als blok in de kleur van de medewerker: tijd bovenaan, duur eronder. */
export function ShiftBlock({
  shift,
  colorIndex,
  onClick,
  className,
}: {
  shift: ShiftItem;
  colorIndex: number;
  onClick: () => void;
  className?: string;
}) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);
  const draft = shift.status === "DRAFT";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-md border-l-4 px-2 py-1.5 text-left shadow-xs transition-shadow hover:shadow-md",
        staffPalette(colorIndex).block,
        draft && "opacity-65",
        className
      )}
    >
      <span className="text-xs leading-tight font-semibold whitespace-nowrap">
        {formatTime(start)} - {formatTime(end)}
      </span>
      <span className="flex items-center gap-1 text-[11px] leading-tight whitespace-nowrap opacity-70">
        {formatDurationShort(shiftHours(start, end, shift.breakMinutes))}
        {draft && " · Concept"}
        {shift.permanentShiftId && (
          <Repeat className="ml-auto size-3 shrink-0" strokeWidth={2.5} aria-label="Vast patroon" />
        )}
      </span>
    </button>
  );
}

/** Verlof of ziekmelding als oranje blok. Zonder onClick is het alleen-lezen (medewerkers). */
export function LeaveBlock({
  leave,
  onClick,
  className,
}: {
  leave: LeavePeriod;
  onClick?: () => void;
  className?: string;
}) {
  const classes = cn(
    "flex w-full flex-col gap-0.5 rounded-md px-2 py-1.5 text-left text-white shadow-xs",
    onClick && "transition-shadow hover:shadow-md",
    className
  );
  const content = (
    <>
      <span className="text-xs leading-tight font-semibold">{LEAVE_LABEL[leave.type]}</span>
      <span className="text-[11px] leading-tight opacity-85">
        {leave.startTime && leave.endTime ? `${leave.startTime} - ${leave.endTime}` : "Hele dag"}
      </span>
    </>
  );
  const style = { backgroundColor: LEAVE_COLOR[leave.type] };

  return onClick ? (
    <button type="button" onClick={onClick} className={classes} style={style}>
      {content}
    </button>
  ) : (
    <div className={classes} style={style}>
      {content}
    </div>
  );
}
