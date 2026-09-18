import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWeekDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/dates";
import { materializePermanentTodos } from "@/lib/permanent-todos";
import { fetchTodoBoardItems } from "@/lib/todo-queries";
import { StaffTodoBoard } from "@/components/todo/staff-todo-board";
import { TodoViewToggle } from "@/components/todo/todo-view-toggle";
import { WeekNav } from "@/components/layout/week-nav";

export default async function MijnTodoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; week?: string }>;
}) {
  const session = await auth();
  const currentUserId = session!.user.id;

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
    fetchTodoBoardItems({ from, to, forStaff: true }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <TodoViewToggle basePath="/mijn-to-do" isToday={isToday} />
        {!isToday && <WeekNav basePath="/mijn-to-do" weekStart={weekStart} />}
      </div>

      <StaffTodoBoard
        days={days.map(toDateKey)}
        todos={todos}
        staff={staff.map((s) => ({ id: s.id, name: s.name }))}
        currentUserId={currentUserId}
      />
    </div>
  );
}
