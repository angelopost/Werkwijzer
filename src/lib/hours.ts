export function shiftHours(startTime: Date, endTime: Date, breakMinutes: number): number {
  const minutes = (endTime.getTime() - startTime.getTime()) / 60000 - breakMinutes;
  return Math.max(0, minutes) / 60;
}

export function formatHours(hours: number): string {
  return hours.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function durationHours(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}
