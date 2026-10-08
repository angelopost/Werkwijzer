export type WorkshopStatus = "OPEN" | "REMINDER" | "AFGEHANDELD";

export const WORKSHOP_STATUS_LABEL: Record<WorkshopStatus, string> = {
  OPEN: "Open",
  REMINDER: "Reminder sturen",
  AFGEHANDELD: "Afgehandeld",
};

export type WorkshopActionItem = {
  id: string;
  dateKey: string;
  dateLabel: string;
  description: string;
};

/** Tijd van de workshop als tekst, bv. "11:00 - 13:00"; null als er geen tijd is ingevuld. */
export function formatWorkshopTime(startTime: string | null, endTime: string | null): string | null {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  if (startTime) return `vanaf ${startTime}`;
  if (endTime) return `tot ${endTime}`;
  return null;
}

export type WorkshopDetailData = {
  id: string;
  name: string;
  dateKey: string;
  dateLabel: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  paymentLinkSent: boolean;
  paid: boolean;
  status: WorkshopStatus;
  updatedAt: string;
  actions: WorkshopActionItem[];
};
