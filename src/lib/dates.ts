import { parseISO } from "date-fns";

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const WEEKDAY_FULL_LABELS = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
];
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

export function addUTCDays(date: Date, amount: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

/** 0 = maandag … 6 = zondag (zelfde volgorde als de weekgrid en PermanentShift.weekday). */
export function getWeekdayIndex(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

export function getWeekdayFullLabel(date: Date): string {
  return WEEKDAY_FULL_LABELS[getWeekdayIndex(date)];
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

export function getWeekdayShort(date: Date): string {
  return WEEKDAY_LABELS[(date.getUTCDay() + 6) % 7].toUpperCase();
}

export function getMonthShort(date: Date): string {
  return MONTH_LABELS[date.getUTCMonth()];
}

export function isToday(date: Date): boolean {
  return toDateKey(date) === toDateKey(new Date());
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

const AMSTERDAM_TZ = "Europe/Amsterdam";

/** Formatteert een écht tijdstip (zoals TimeEntry.clockIn/clockOut) als HH:mm in
 * Europe/Amsterdam. In tegenstelling tot formatTime() — dat een wandklok-label
 * zonder tijdzone-conversie leest — is dit voor waarden die daadwerkelijk `new Date()`
 * op het moment van inklokken zijn. */
export function formatClockTime(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: AMSTERDAM_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** UTC-bereik dat overeenkomt met een kalenderdag (00:00–24:00) in Europe/Amsterdam,
 * voor het filteren van échte tijdstippen zoals TimeEntry.clockIn op "die dag". */
export function getAmsterdamDayRangeUtc(dateKey: string): { start: Date; end: Date } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcMidnightGuess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: AMSTERDAM_TZ,
    timeZoneName: "shortOffset",
  })
    .formatToParts(utcMidnightGuess)
    .find((p) => p.type === "timeZoneName")?.value;
  const offsetHours = Number(offsetName?.match(/GMT([+-]\d+)/)?.[1] ?? 1);

  const start = new Date(utcMidnightGuess.getTime() - offsetHours * 3_600_000);
  const end = new Date(start.getTime() + 24 * 3_600_000);
  return { start, end };
}

/** Kalenderdag (YYYY-MM-DD) in Europe/Amsterdam voor een écht tijdstip — het omgekeerde
 * van getAmsterdamDayRangeUtc(), gebruikt om een TimeEntry aan de juiste Shift.date te koppelen. */
export function getAmsterdamDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AMSTERDAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Waarde voor een <input type="datetime-local">, gebaseerd op de lokale tijd van de
 * browser (mag alleen client-side gebruikt worden — de server heeft een andere lokale tijd). */
export function toDatetimeLocalValue(date: Date): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

/** Daglabel (bv. "wo 16 sep") voor een écht tijdstip, tijdzone-bewust berekend. */
export function formatClockDayLabel(date: Date): string {
  const parts = new Intl.DateTimeFormat("nl-NL", {
    timeZone: AMSTERDAM_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday").replace(".", "")} ${get("day")} ${get("month").replace(".", "")}`;
}

/** Nette weergave van een verlof-/ziekteperiode, inclusief tijden als die zijn ingevuld. */
export function formatLeaveRangeLabel(
  startDate: Date,
  endDate: Date,
  startTime: string | null,
  endTime: string | null
): string {
  const sameDay = toDateKey(startDate) === toDateKey(endDate);
  const hasTimes = Boolean(startTime && endTime);

  if (sameDay) {
    return hasTimes ? `${formatDayLabel(startDate)}, ${startTime} - ${endTime}` : formatDayLabel(startDate);
  }

  const startLabel = hasTimes ? `${formatDayLabel(startDate)} ${startTime}` : formatDayLabel(startDate);
  const endLabel = hasTimes ? `${formatDayLabel(endDate)} ${endTime}` : formatDayLabel(endDate);
  return `${startLabel} t/m ${endLabel}`;
}
