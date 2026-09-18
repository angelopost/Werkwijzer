import { prisma } from "@/lib/db";
import { getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { materializePermanentTodos } from "@/lib/permanent-todos";
import { TodoBoard } from "@/components/todo/todo-board";
import { TodoViewToggle } from "@/components/todo/todo-view-toggle";
import { WeekNav } from "@/components/layout/week-nav";

export default async function TodoMedewerkersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; week?: string }>;
}) {
  const params = await searchParams;
  const isToday = params.view === "vandaag";

  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const weekStart = params.week ? parseDateKey(params.week) : getWeekStart(today);

  const days = isToday ? [todayDate] : getWeekDays(weekStart);
  const from = days[0];
  const to = days[days.length - 1];

  await materializePermanentTodos(from, to);

  const [todos, staff] = await Promise.all([
    prisma.todo.findMany({
      where: { date: { gte: from, lte: to }, forStaff: true },
      include: { assignee: true, completedBy: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TodoViewToggle basePath="/todo-medewerkers" isToday={isToday} />
        {!isToday && <WeekNav basePath="/todo-medewerkers" weekStart={weekStart} />}
      </div>

      <TodoBoard
        forStaff
        days={days.map(toDateKey)}
        todos={todos.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          date: toDateKey(t.date),
          priority: t.priority,
          completed: t.completed,
          assigneeId: t.assigneeId,
          assigneeName: t.assignee?.name ?? null,
          completedById: t.completedById,
          completedByName: t.completedBy?.name ?? null,
          permanentTodoId: t.permanentTodoId,
        }))}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
