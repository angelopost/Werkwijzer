export function shiftHours(startTime: Date, endTime: Date, breakMinutes: number): number {
  const minutes = (endTime.getTime() - startTime.getTime()) / 60000 - breakMinutes;
  return Math.max(0, minutes) / 60;
}

export function formatHours(hours: number): string {
  return hours.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
