"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { getWeekdayIndex, parseDateKey } from "@/lib/dates";
import { createPermanentTodo, deletePermanentTodo as deletePermanentTodoLib } from "@/lib/permanent-todos";
import { todoFormSchema } from "@/lib/validation/todo";

export type TodoActionState = { error?: string; success?: boolean } | undefined;

function resolveAssigneeId(value: string | undefined): string | null {
  return value && value !== "algemeen" ? value : null;
}

/** Alleen de schermen verversen die de gewijzigde to do daadwerkelijk kunnen tonen,
 * in plaats van altijd alle drie — scheelt onnodig herladen bij elke actie. */
function revalidateTodoPaths(forStaff: boolean) {
  if (forStaff) {
    revalidatePath("/todo-medewerkers");
    revalidatePath("/mijn-to-do");
  } else {
    revalidatePath("/todo");
  }
}

export async function createTodo(
  forStaff: boolean,
  _prevState: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  const admin = await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
    permanent: formData.get("permanent") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;
  const date = data.date ? parseDateKey(data.date) : null;

  const todo = await prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      date,
      assigneeId: resolveAssigneeId(data.assigneeId),
      priority: data.priority,
      forStaff,
      permanentGeneral: date === null && forStaff ? data.permanent : false,
      createdById: admin.id,
    },
  });

  if (data.permanent && date) {
    await createPermanentTodo({
      title: data.title,
      description: data.description || null,
      weekday: getWeekdayIndex(date),
      priority: data.priority,
      assigneeId: resolveAssigneeId(data.assigneeId),
      forStaff,
      activeFrom: date,
      createdById: admin.id,
      anchorTodoId: todo.id,
    });
  }

  revalidateTodoPaths(forStaff);
  return { success: true };
}

export async function updateTodo(
  todoId: string,
  forStaff: boolean,
  _prevState: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  const admin = await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
    permanent: formData.get("permanent") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;
  const date = data.date ? parseDateKey(data.date) : null;

  await prisma.todo.update({
    where: { id: todoId },
    data: {
      title: data.title,
      description: data.description || null,
      date,
      assigneeId: resolveAssigneeId(data.assigneeId),
      priority: data.priority,
      permanentGeneral: date === null && forStaff ? data.permanent : false,
    },
  });

  if (data.permanent && date) {
    await createPermanentTodo({
      title: data.title,
      description: data.description || null,
      weekday: getWeekdayIndex(date),
      priority: data.priority,
      assigneeId: resolveAssigneeId(data.assigneeId),
      forStaff,
      activeFrom: date,
      createdById: admin.id,
      anchorTodoId: todoId,
    });
  }

  revalidateTodoPaths(forStaff);
  return { success: true };
}

export async function toggleTodoCompleted(todoId: string) {
  await requireAdmin();
  const todo = await prisma.todo.findUniqueOrThrow({ where: { id: todoId } });
  const completed = !todo.completed;
  await prisma.todo.update({
    where: { id: todoId },
    data: {
      completed,
      completedById: completed ? todo.completedById : null,
      completedAt: completed ? new Date() : null,
    },
  });
  revalidateTodoPaths(todo.forStaff);
}

/** Verwijdert één losse to do. Hoort deze bij een vast patroon, dan wordt de datum
 * uitgesloten zodat 'm niet opnieuw wordt aangemaakt bij het aanvullen. */
export async function deleteTodo(todoId: string) {
  await requireAdmin();
  const todo = await prisma.todo.delete({ where: { id: todoId } });

  if (todo.permanentTodoId && todo.date) {
    await prisma.permanentTodoException.upsert({
      where: {
        permanentTodoId_date: { permanentTodoId: todo.permanentTodoId, date: todo.date },
      },
      create: { permanentTodoId: todo.permanentTodoId, date: todo.date },
      update: {},
    });
  }

  revalidateTodoPaths(todo.forStaff);
}

export async function deleteAllPermanentTodos(permanentTodoId: string) {
  await requireAdmin();
  const { forStaff } = await deletePermanentTodoLib(permanentTodoId);
  revalidateTodoPaths(forStaff);
}
