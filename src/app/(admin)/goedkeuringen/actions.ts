"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";

function revalidateAll() {
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/verlof");
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
