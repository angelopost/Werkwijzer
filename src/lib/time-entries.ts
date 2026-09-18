import { prisma } from "@/lib/db";

export async function getOpenTimeEntry(userId: string) {
  return prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
}

export async function clockInUser(userId: string) {
  const open = await getOpenTimeEntry(userId);
  if (open) return { error: "Je bent al ingeklokt." as const };

  const entry = await prisma.timeEntry.create({
    data: { userId, clockIn: new Date() },
  });
  return { entry };
}

export async function clockOutUser(userId: string) {
  const open = await getOpenTimeEntry(userId);
  if (!open) return { error: "Je bent niet ingeklokt." as const };

  const entry = await prisma.timeEntry.update({
    where: { id: open.id },
    data: { clockOut: new Date() },
  });
  return { entry };
}
