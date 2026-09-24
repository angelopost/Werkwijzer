export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateLong(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(date);
}
