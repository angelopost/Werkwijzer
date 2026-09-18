"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { approveTimeEntry } from "@/lib/time-entries";

function revalidateAll() {
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/verlof");
  revalidatePath("/uren");
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
}

export async function approveLeave(leaveId: string) {
  const admin = await requireAdmin();
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  revalidateAll();
}

export async function rejectLeave(leaveId: string) {
  const admin = await requireAdmin();
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  revalidateAll();
}

export async function approveTimeEntryRequest(
  entryId: string,
  correctionMinutes: number,
  reviewNote: string | null
) {
  const admin = await requireAdmin();
  const result = await approveTimeEntry(entryId, admin.id, correctionMinutes, reviewNote);
  revalidateAll();
  return result;
}
