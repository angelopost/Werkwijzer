export type FunctieOption = { id: string; name: string; color: string };

export type StaffRow = { id: string; name: string; functieIds: string[] };

export type ShiftItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
  status: "DRAFT" | "PUBLISHED";
  assignedUserId: string | null;
  functieId: string | null;
  functieName: string | null;
  functieColor: string | null;
};
