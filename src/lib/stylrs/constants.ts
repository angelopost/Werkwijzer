/// Weekdag-index 0 = maandag … 6 = zondag, consistent overal in STYLRS.
export const WEEKDAY_LABELS = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

export const WEEKDAY_LABELS_SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

export const DEFAULT_OPENING_HOURS = [
  { weekday: 0, isClosed: false, openTime: "09:00", closeTime: "18:00" },
  { weekday: 1, isClosed: false, openTime: "09:00", closeTime: "18:00" },
  { weekday: 2, isClosed: false, openTime: "09:00", closeTime: "18:00" },
  { weekday: 3, isClosed: false, openTime: "09:00", closeTime: "20:00" },
  { weekday: 4, isClosed: false, openTime: "09:00", closeTime: "18:00" },
  { weekday: 5, isClosed: false, openTime: "09:00", closeTime: "16:00" },
  { weekday: 6, isClosed: true, openTime: null, closeTime: null },
];

export const EMPLOYEE_COLORS = [
  "#7C5CFC",
  "#2563EB",
  "#16A34A",
  "#DB2777",
  "#EA580C",
  "#0D9488",
  "#CA8A04",
  "#9333EA",
];

export function weekdayFromDate(date: Date) {
  // JS: 0 = zondag … 6 = zaterdag. STYLRS: 0 = maandag … 6 = zondag.
  const jsDay = date.getDay();
  return (jsDay + 6) % 7;
}
