export function shiftHours(startTime: Date, endTime: Date, breakMinutes: number): number {
  const minutes = (endTime.getTime() - startTime.getTime()) / 60000 - breakMinutes;
  return Math.max(0, minutes) / 60;
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
