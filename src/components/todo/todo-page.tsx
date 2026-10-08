import { prisma } from "@/lib/db";
import { addUTCDays, getAmsterdamToday, toDateKey } from "@/lib/dates";
import { materializePermanentTodos } from "@/lib/permanent-todos";
import { fetchTodoBoardItems } from "@/lib/todo-queries";
import { TodoBoard } from "./todo-board";

const WEEKS_STEP = 2;
const WEEKS_MAX = 52;

/** Gedeelde inhoud van To do vaste kracht (forStaff = false) en To do medewerkers
 * (forStaff = true): de komende to do's met datum, plus de algemene to do's. */
export async function TodoPageContent({
  forStaff,
  basePath,
  weeksParam,
}: {
  forStaff: boolean;
  basePath: string;
  weeksParam?: string;
}) {
  const parsedWeeks = Number(weeksParam);
  const weeks =
    Number.isInteger(parsedWeeks) && parsedWeeks >= WEEKS_STEP
      ? Math.min(parsedWeeks, WEEKS_MAX)
      : WEEKS_STEP;

  const today = getAmsterdamToday();
  const to = addUTCDays(today, weeks * 7 - 1);

  await materializePermanentTodos(today, to);

  const [todos, staff] = await Promise.all([
    fetchTodoBoardItems({ from: today, to, forStaff }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TodoBoard
      todos={todos}
      staff={staff.map((s) => ({ id: s.id, name: s.name }))}
      forStaff={forStaff}
      todayKey={toDateKey(today)}
      basePath={basePath}
      weeks={weeks}
      moreWeeks={Math.min(weeks + WEEKS_STEP, WEEKS_MAX)}
    />
  );
}
