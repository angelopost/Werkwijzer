import { prisma } from "@/lib/db";
import { toDateKey } from "@/lib/dates";
import type { TodoItem } from "@/components/todo/types";

/** Haalt de to do's op voor een weekbereik (of enkele dag) plus alle algemene
 * to do's zonder datum, die ongeacht het geselecteerde bereik altijd meetellen. */
export async function fetchTodoBoardItems(params: {
  from: Date;
  to: Date;
  forStaff: boolean;
}): Promise<TodoItem[]> {
  const { from, to, forStaff } = params;

  const [dayTodos, generalTodos] = await Promise.all([
    prisma.todo.findMany({
      where: { date: { gte: from, lte: to }, forStaff },
      include: { assignee: true, completedBy: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    }),
    prisma.todo.findMany({
      where: { date: null, forStaff },
      include: { assignee: true, completedBy: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return [...dayTodos, ...generalTodos].map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    date: t.date ? toDateKey(t.date) : null,
    priority: t.priority,
    completed: t.completed,
    assigneeId: t.assigneeId,
    assigneeName: t.assignee?.name ?? null,
    completedById: t.completedById,
    completedByName: t.completedBy?.name ?? null,
    permanentTodoId: t.permanentTodoId,
  }));
}
