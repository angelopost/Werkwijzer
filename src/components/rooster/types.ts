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
  permanentShiftId: string | null;
};

export type LeavePeriod = {
  id: string;
  userId: string;
  type: "VERLOF" | "ZIEK";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};
