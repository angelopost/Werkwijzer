import { formatTime, getAmsterdamInstant, toDateKey } from "@/lib/dates";

export function shiftHours(startTime: Date, endTime: Date, breakMinutes: number): number {
  const minutes = (endTime.getTime() - startTime.getTime()) / 60000 - breakMinutes;
  return Math.max(0, minutes) / 60;
}

/** Een geplande dienst telt pas mee als gewerkte uren zodra de eindtijd daadwerkelijk
 * voorbij is — een dienst die nog moet plaatsvinden staat wel in het rooster, maar
 * levert nog geen uren op in Mijn uren / Uren totdat de tijd echt verstreken is.
 * Uitzondering: is de dienst tot stand gekomen via een goedgekeurde inkloktijd
 * (correctionMinutes is dan altijd gezet, ook op 0), dan telt hij direct mee — de
 * beheerder heeft de gewerkte tijd dan al expliciet goedgekeurd. */
export function hasShiftEnded(shift: {
  date: Date;
  endTime: Date;
  correctionMinutes: number | null;
}): boolean {
  if (shift.correctionMinutes !== null) return true;
  const endInstant = getAmsterdamInstant(toDateKey(shift.date), formatTime(shift.endTime));
  return endInstant.getTime() <= Date.now();
}

export function formatHours(hours: number): string {
  return hours.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Nette weergave in uren en minuten (bv. "2 uur en 30 minuten", "45 minuten", "16 uur"),
 * zodat alles onder een uur in minuten wordt getoond in plaats van als decimaal getal. */
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const minutesLabel = m === 1 ? "minuut" : "minuten";

  if (h === 0) return `${m} ${minutesLabel}`;
  if (m === 0) return `${h} uur`;
  return `${h} uur en ${m} ${minutesLabel}`;
}

export function durationHours(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}
