"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { swapRequestSchema } from "@/lib/validation/swap";

export type SwapActionState = { error?: string; success?: boolean } | undefined;

export async function requestSwap(_prevState: SwapActionState, formData: FormData): Promise<SwapActionState> {
  const user = await requireStaff();

  const parsed = swapRequestSchema.safeParse({
    shiftId: formData.get("shiftId"),
    targetUserId: formData.get("targetUserId") || undefined,
  });
  if (!parsed.success) {
    return { error: "Ongeldige invoer" };
  }
  const { shiftId, targetUserId } = parsed.data;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  if (!shift || shift.assignedUserId !== user.id || shift.status !== "PUBLISHED") {
    return { error: "Deze dienst kan niet geruild worden" };
  }

  const existing = await prisma.shiftSwapRequest.findFirst({
    where: { shiftId, requestingUserId: user.id, status: "PENDING" },
  });
  if (existing) {
    return { error: "Je hebt al een openstaand ruilverzoek voor deze dienst" };
  }

  await prisma.shiftSwapRequest.create({
    data: { shiftId, requestingUserId: user.id, targetUserId: targetUserId || null },
  });

  revalidatePath("/ruilen");
  revalidatePath("/goedkeuringen");
  return { success: true };
}

export async function cancelSwap(swapId: string) {
  const user = await requireStaff();
  await prisma.shiftSwapRequest.updateMany({
    where: { id: swapId, requestingUserId: user.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/ruilen");
  revalidatePath("/goedkeuringen");
}
