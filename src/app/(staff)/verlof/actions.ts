"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import { leaveFormSchema } from "@/lib/validation/leave";

export type LeaveActionState = { error?: string; success?: boolean } | undefined;

export async function requestLeave(_prevState: LeaveActionState, formData: FormData): Promise<LeaveActionState> {
  const user = await requireStaff();

  const parsed = leaveFormSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      type: data.type,
      startDate: parseDateKey(data.startDate),
      endDate: parseDateKey(data.endDate),
      reason: data.reason ?? null,
      // Ziekmelding heeft direct effect en hoeft niet goedgekeurd te worden.
      status: data.type === "ZIEK" ? "APPROVED" : "PENDING",
    },
  });

  revalidatePath("/verlof");
  revalidatePath("/goedkeuringen");
  revalidatePath("/rooster");
  revalidatePath("/mijn-rooster");
  return { success: true };
}

export async function cancelLeave(leaveId: string) {
  const user = await requireStaff();
  await prisma.leaveRequest.deleteMany({
    where: { id: leaveId, userId: user.id, status: "PENDING" },
  });
  revalidatePath("/verlof");
  revalidatePath("/goedkeuringen");
}
