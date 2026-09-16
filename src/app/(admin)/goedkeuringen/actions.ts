"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";

function revalidateAll() {
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  revalidatePath("/ruilen");
  revalidatePath("/verlof");
}

export async function approveSwap(swapId: string) {
  const admin = await requireAdmin();

  const request = await prisma.shiftSwapRequest.findUniqueOrThrow({ where: { id: swapId } });

  await prisma.$transaction([
    prisma.shift.update({
      where: { id: request.shiftId },
      data: { assignedUserId: request.targetUserId ?? null },
    }),
    prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
    }),
    prisma.shiftSwapRequest.updateMany({
      where: { shiftId: request.shiftId, status: "PENDING", id: { not: swapId } },
      data: { status: "CANCELLED", reviewedById: admin.id, reviewedAt: new Date() },
    }),
  ]);

  revalidateAll();
}

export async function rejectSwap(swapId: string) {
  const admin = await requireAdmin();
  await prisma.shiftSwapRequest.update({
    where: { id: swapId },
    data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  revalidateAll();
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
