"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setPasswordSchema } from "@/lib/validation/staff";

export type AcceptInviteState = { error?: string } | undefined;

export async function acceptInvite(
  token: string,
  _prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "Deze uitnodigingslink is ongeldig of verlopen." };
  }

  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: invite.userId }, data: { passwordHash } }),
    prisma.invite.update({ where: { token }, data: { acceptedAt: new Date() } }),
  ]);

  redirect("/login");
}
