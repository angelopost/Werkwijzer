import { format } from "date-fns";

export function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}
