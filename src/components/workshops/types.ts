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

export type WorkshopDetailData = {
  id: string;
  name: string;
  dateKey: string;
  dateLabel: string;
  notes: string | null;
  paymentLinkSent: boolean;
  paid: boolean;
  status: WorkshopStatus;
  updatedAt: string;
  actions: WorkshopActionItem[];
};
