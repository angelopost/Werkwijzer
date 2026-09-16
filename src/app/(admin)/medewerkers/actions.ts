"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { staffFormSchema } from "@/lib/validation/staff";

export type StaffActionState = { error?: string; invitePath?: string } | undefined;

const INVITE_TTL_DAYS = 7;

export async function createStaffMember(
  _prevState: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requireAdmin();

  const parsed = staffFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    contractHoursPerWeek: formData.get("contractHoursPerWeek") || undefined,
    contractType: formData.get("contractType") || undefined,
    functieIds: formData.getAll("functieIds"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "Er bestaat al een account met dit e-mailadres" };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "STAFF",
      contractHoursPerWeek: data.contractHoursPerWeek ?? null,
      contractType: data.contractType ?? null,
      functies: { create: data.functieIds.map((functieId) => ({ functieId })) },
      invite: { create: { token, expiresAt } },
    },
  });

  revalidatePath("/medewerkers");
  return { invitePath: `/uitnodiging/${token}` };
}

export async function setContractType(userId: string, contractType: "VAST" | "NUL_UREN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { contractType } });
  revalidatePath("/medewerkers");
}

export async function toggleStaffActive(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/medewerkers");
}

export async function regenerateInvite(userId: string): Promise<StaffActionState> {
  await requireAdmin();
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.invite.upsert({
    where: { userId },
    update: { token, expiresAt, acceptedAt: null },
    create: { userId, token, expiresAt },
  });

  revalidatePath("/medewerkers");
  return { invitePath: `/uitnodiging/${token}` };
}
