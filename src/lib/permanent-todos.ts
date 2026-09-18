import { prisma } from "@/lib/db";
import { addUTCDays, getWeekdayIndex, toDateKey } from "@/lib/dates";
import type { TodoPriority } from "@/generated/prisma/enums";

/** Hoe ver vooruit to do's direct worden aangemaakt zodra een vast patroon wordt ingesteld. */
const HORIZON_WEEKS = 26;

type TodoCreateInput = {
  title: string;
  description: string | null;
  date: Date;
  priority: TodoPriority;
  assigneeId: string | null;
  createdById: string;
  permanentTodoId: string;
};

function occurrencesInRange(weekday: number, activeFrom: Date, rangeStart: Date, rangeEnd: Date): Date[] {
  const start = activeFrom > rangeStart ? activeFrom : rangeStart;
  if (start > rangeEnd) return [];

  const dates: Date[] = [];
  let cursor = addUTCDays(start, (weekday - getWeekdayIndex(start) + 7) % 7);
  while (cursor <= rangeEnd) {
    dates.push(cursor);
    cursor = addUTCDays(cursor, 7);
  }
  return dates;
}

/** Vult ontbrekende to do's voor actieve vaste patronen binnen [rangeStart, rangeEnd] aan.
 * Een dag die al een instantie van dat patroon heeft (of expliciet is uitgesloten) wordt
 * nooit overschreven, zo blijft een handmatig aangepaste/verwijderde dag gewoon staan. */
export async function materializePermanentTodos(rangeStart: Date, rangeEnd: Date) {
  const templates = await prisma.permanentTodo.findMany({
    where: { activeFrom: { lte: rangeEnd } },
  });
  if (templates.length === 0) return;

  const templateIds = templates.map((t) => t.id);

  const existing = await prisma.todo.findMany({
    where: { permanentTodoId: { in: templateIds }, date: { gte: rangeStart, lte: rangeEnd } },
    select: { permanentTodoId: true, date: true },
  });
  const existingKeys = new Set(existing.map((t) => `${t.permanentTodoId}_${toDateKey(t.date)}`));

  const exceptions = await prisma.permanentTodoException.findMany({
    where: { permanentTodoId: { in: templateIds }, date: { gte: rangeStart, lte: rangeEnd } },
    select: { permanentTodoId: true, date: true },
  });
  const excludedKeys = new Set(exceptions.map((e) => `${e.permanentTodoId}_${toDateKey(e.date)}`));

  const toCreate: TodoCreateInput[] = [];
  for (const template of templates) {
    for (const date of occurrencesInRange(template.weekday, template.activeFrom, rangeStart, rangeEnd)) {
      const key = `${template.id}_${toDateKey(date)}`;
      if (existingKeys.has(key) || excludedKeys.has(key)) continue;

      toCreate.push({
        title: template.title,
        description: template.description,
        date,
        priority: template.priority,
        assigneeId: template.assigneeId,
        createdById: template.createdById,
        permanentTodoId: template.id,
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.todo.createMany({ data: toCreate });
  }
}

export async function createPermanentTodo(input: {
  title: string;
  description: string | null;
  weekday: number;
  priority: TodoPriority;
  assigneeId: string | null;
  activeFrom: Date;
  createdById: string;
  anchorTodoId: string;
}) {
  const template = await prisma.permanentTodo.create({
    data: {
      title: input.title,
      description: input.description,
      weekday: input.weekday,
      priority: input.priority,
      assigneeId: input.assigneeId,
      activeFrom: input.activeFrom,
      createdById: input.createdById,
    },
  });

  // Koppel de to do die net is aangemaakt/bewerkt (op activeFrom zelf) alvast aan het patroon.
  await prisma.todo.update({
    where: { id: input.anchorTodoId },
    data: { permanentTodoId: template.id },
  });

  const horizonEnd = addUTCDays(input.activeFrom, HORIZON_WEEKS * 7);
  await materializePermanentTodos(input.activeFrom, horizonEnd);

  return template;
}

/** Verwijdert een heel vast to-do-patroon (alleen nog komende to do's; voorbije blijven
 * staan) en zorgt dat er niets meer wordt bijgevuld. */
export async function deletePermanentTodo(permanentTodoId: string) {
  const todayKey = toDateKey(new Date());
  const today = new Date(`${todayKey}T00:00:00Z`);

  await prisma.todo.deleteMany({
    where: { permanentTodoId, date: { gte: today } },
  });
  await prisma.permanentTodo.delete({ where: { id: permanentTodoId } });
}
