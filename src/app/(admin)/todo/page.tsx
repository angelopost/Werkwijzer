import { prisma } from "@/lib/db";
import { addUTCDays, toDateKey } from "@/lib/dates";
import { materializePermanentTodos } from "@/lib/permanent-todos";
import { TodoBoard } from "@/components/todo/todo-board";

export default async function TodoPage() {
  const today = new Date();
  const from = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const to = addUTCDays(from, 6);

  await materializePermanentTodos(from, to);

  const [todos, staff] = await Promise.all([
    prisma.todo.findMany({
      where: { date: { gte: from, lte: to } },
      include: { assignee: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <TodoBoard
        todos={todos.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          date: toDateKey(t.date),
          priority: t.priority,
          completed: t.completed,
          assigneeId: t.assigneeId,
          assigneeName: t.assignee?.name ?? null,
          permanentTodoId: t.permanentTodoId,
        }))}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
