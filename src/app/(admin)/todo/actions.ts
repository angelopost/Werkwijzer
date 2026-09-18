"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import { todoFormSchema } from "@/lib/validation/todo";

export type TodoActionState = { error?: string; success?: boolean } | undefined;

export async function createTodo(_prevState: TodoActionState, formData: FormData): Promise<TodoActionState> {
  const admin = await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  await prisma.todo.create({
    data: {
      title: data.title,
      description: data.description || null,
      date: parseDateKey(data.date),
      assigneeId: data.assigneeId || null,
      priority: data.priority,
      createdById: admin.id,
    },
  });

  revalidatePath("/todo");
  return { success: true };
}

export async function updateTodo(
  todoId: string,
  _prevState: TodoActionState,
  formData: FormData
): Promise<TodoActionState> {
  await requireAdmin();

  const parsed = todoFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    assigneeId: formData.get("assigneeId") || undefined,
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  await prisma.todo.update({
    where: { id: todoId },
    data: {
      title: data.title,
      description: data.description || null,
      date: parseDateKey(data.date),
      assigneeId: data.assigneeId || null,
      priority: data.priority,
    },
  });

  revalidatePath("/todo");
  return { success: true };
}

export async function toggleTodoCompleted(todoId: string) {
  await requireAdmin();
  const todo = await prisma.todo.findUniqueOrThrow({ where: { id: todoId } });
  await prisma.todo.update({ where: { id: todoId }, data: { completed: !todo.completed } });
  revalidatePath("/todo");
}

export async function deleteTodo(todoId: string) {
  await requireAdmin();
  await prisma.todo.delete({ where: { id: todoId } });
  revalidatePath("/todo");
}
