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

export async function createTodo(_prevState: TodoActionState, formData: FormData): Promise<TodoActionState> {
  const admin = await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
    permanent: formData.get("permanent") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;
  const date = parseDateKey(data.date);

  const todo = await prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      date,
      assigneeId: resolveAssigneeId(data.assigneeId),
      priority: data.priority,
      createdById: admin.id,
    },
  });

  if (data.permanent) {
    await createPermanentTodo({
      title: data.title,
      description: data.description || null,
      weekday: getWeekdayIndex(date),
      priority: data.priority,
      assigneeId: resolveAssigneeId(data.assigneeId),
      activeFrom: date,
      createdById: admin.id,
      anchorTodoId: todo.id,
    });
  }

  revalidatePath("/todo");
  return { success: true };
}

export async function updateTodo(
  todoId: string,
  _prevState: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  const admin = await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
    permanent: formData.get("permanent") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;
  const date = parseDateKey(data.date);

  await prisma.todo.update({
    where: { id: todoId },
    data: {
      title: data.title,
      description: data.description || null,
      date,
      assigneeId: resolveAssigneeId(data.assigneeId),
      priority: data.priority,
    },
  });

  if (data.permanent) {
    await createPermanentTodo({
      title: data.title,
      description: data.description || null,
      weekday: getWeekdayIndex(date),
      priority: data.priority,
      assigneeId: resolveAssigneeId(data.assigneeId),
      activeFrom: date,
      createdById: admin.id,
      anchorTodoId: todoId,
    });
  }

  revalidatePath("/todo");
  return { success: true };
}

export async function toggleTodoCompleted(todoId: string) {
  await requireAdmin();
  const todo = await prisma.todo.findUniqueOrThrow({ where: { id: todoId } });
  await prisma.todo.update({ where: { id: todoId }, data: { completed: !todo.completed } });
  revalidatePath("/todo");
}

/** Verwijdert één losse to do. Hoort deze bij een vast patroon, dan wordt de datum
 * uitgesloten zodat 'm niet opnieuw wordt aangemaakt bij het aanvullen. */
export async function deleteTodo(todoId: string) {
  await requireAdmin();
  const todo = await prisma.todo.delete({ where: { id: todoId } });

  if (todo.permanentTodoId) {
    await prisma.permanentTodoException.upsert({
      where: {
        permanentTodoId_date: { permanentTodoId: todo.permanentTodoId, date: todo.date },
      },
      create: { permanentTodoId: todo.permanentTodoId, date: todo.date },
      update: {},
    });
  }

  revalidatePath("/todo");
}

export async function deleteAllPermanentTodos(permanentTodoId: string) {
  await requireAdmin();
  await deletePermanentTodoLib(permanentTodoId);
  revalidatePath("/todo");
}
