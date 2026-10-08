"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/permissions";
import { prisma } from "@/lib/db";

/** Medewerker zet zichzelf (of niemand) als uitvoerder van een medewerkers-to do.
 * Alleen to do's die daadwerkelijk voor medewerkers bedoeld zijn (forStaff) mogen
 * op deze manier worden bijgewerkt, en alleen met een geldige, actieve medewerker. */
export async function markTodoCompletedBy(todoId: string, completedById: string | null) {
  await requireStaff();

  const todo = await prisma.todo.findUniqueOrThrow({ where: { id: todoId } });
  if (!todo.forStaff) return;

  if (completedById) {
    const validStaff = await prisma.user.findFirst({
      where: { id: completedById, role: "STAFF", isActive: true },
    });
    if (!validStaff) return;
  }

  const completed = completedById !== null;
  await prisma.todo.update({
    where: { id: todoId },
    data: { completedById, completed, completedAt: completed ? new Date() : null },
  });

  revalidatePath("/mijn-to-do");
  revalidatePath("/todo-medewerkers");
}
