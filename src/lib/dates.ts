import { parseISO } from "date-fns";

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const MONTH_LABELS = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function addUTCDays(date: Date, amount: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

/** Calendar dates (Shift.date, week boundaries, …) are represented as UTC-midnight
 * Date objects so they round-trip correctly through Postgres `@db.Date` columns
 * regardless of the server's local timezone. */
export function getWeekStart(reference: Date): Date {
  const localDay = reference.getDay(); // 0 = Sunday
  const mondayOffset = (localDay + 6) % 7; // days since most recent Monday
  return new Date(
    Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate() - mondayOffset)
  );
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addUTCDays(weekStart, i));
}

export function shiftWeek(weekStart: Date, deltaWeeks: number): Date {
  return addUTCDays(weekStart, deltaWeeks * 7);
}

export function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDayLabel(date: Date): string {
  const weekday = WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7];
  return `${weekday} ${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()]}`;
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addUTCDays(weekStart, 6);
  const sameMonth = weekStart.getUTCMonth() === weekEnd.getUTCMonth();
  const start = sameMonth
    ? `${weekStart.getUTCDate()}`
    : `${weekStart.getUTCDate()} ${MONTH_LABELS[weekStart.getUTCMonth()]}`;
  return `${start} - ${weekEnd.getUTCDate()} ${MONTH_LABELS[weekEnd.getUTCMonth()]} ${weekEnd.getUTCFullYear()}`;
}

/** Shift start/end times are stored as the intended local wall-clock instant
 * (no timezone conversion) so they always display as entered. */
export function formatTime(date: Date): string {
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function combineDateAndTime(dateKey: string, time: string): Date {
  return parseISO(`${dateKey}T${time}:00Z`);
}
