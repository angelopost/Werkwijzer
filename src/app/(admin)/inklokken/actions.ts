"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";

function revalidateInklok() {
  revalidatePath("/inklokken");
  revalidatePath("/mijn-inklok");
}

export async function updateTimeEntry(entryId: string, clockInIso: string, clockOutIso: string | null) {
  await requireAdmin();

  const clockInDate = new Date(clockInIso);
  const clockOutDate = clockOutIso ? new Date(clockOutIso) : null;

  if (Number.isNaN(clockInDate.getTime()) || (clockOutDate && Number.isNaN(clockOutDate.getTime()))) {
    return { error: "Ongeldige datum/tijd" };
  }
  if (clockOutDate && clockOutDate <= clockInDate) {
    return { error: "Uitkloktijd moet na de inkloktijd liggen" };
  }

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: { clockIn: clockInDate, clockOut: clockOutDate },
  });

  revalidateInklok();
  return { success: true };
}

export async function deleteTimeEntry(entryId: string) {
  await requireAdmin();
  await prisma.timeEntry.delete({ where: { id: entryId } });
  revalidateInklok();
}
