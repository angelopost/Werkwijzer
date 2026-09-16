export type StaffRow = {
  id: string;
  name: string;
  contractType?: "VAST" | "NUL_UREN" | null;
};

export type ShiftItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
  status: "DRAFT" | "PUBLISHED";
  assignedUserId: string | null;
};

export type LeavePeriod = {
  userId: string;
  type: "VERLOF" | "ZIEK";
  startDate: string;
  endDate: string;
};

export type AvailabilityEntry = {
  userId: string;
  date: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "PREFERRED";
};
