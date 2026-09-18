export type TodoPriority = "DRINGEND" | "NORMAAL" | "NIET_DRINGEND";

export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  priority: TodoPriority;
  completed: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  completedById: string | null;
  completedByName: string | null;
  permanentTodoId: string | null;
};

export type TodoStaffOption = {
  id: string;
  name: string;
};

export const PRIORITY_LABEL: Record<TodoPriority, string> = {
  DRINGEND: "Dringend",
  NORMAAL: "Normaal",
  NIET_DRINGEND: "Niet dringend",
};
