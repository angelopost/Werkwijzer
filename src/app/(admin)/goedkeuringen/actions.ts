"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { approveTimeEntry, rejectTimeEntry } from "@/lib/time-entries";

/** Alleen de schermen verversen die een verlof-/ziekteperiode kunnen tonen. */
function revalidateLeavePaths() {
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/verlof");
}

/** Alleen de schermen verversen die een inkloktijd of de daaruit voortkomende dienst
 * kunnen tonen. */
function revalidateTimeEntryPaths() {
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/uren");
  revalidatePath("/mijn-uren");
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
}

export async function approveLeave(leaveId: string) {
  const admin = await requireAdmin();
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  revalidateLeavePaths();
}

export async function rejectLeave(leaveId: string) {
  const admin = await requireAdmin();
  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  revalidateLeavePaths();
}

export async function approveTimeEntryRequest(
  entryId: string,
  correctionMinutes: number,
  reviewNote: string | null
) {
  const admin = await requireAdmin();
  const result = await approveTimeEntry(entryId, admin.id, correctionMinutes, reviewNote);
  revalidateTimeEntryPaths();
  return result;
}

export async function rejectTimeEntryRequest(entryId: string) {
  await requireAdmin();
  await rejectTimeEntry(entryId);
  revalidateTimeEntryPaths();
}
