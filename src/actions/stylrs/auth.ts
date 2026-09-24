"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/stylrs/auth";
import { registerSalonSchema } from "@/lib/stylrs/validation/auth";
import { generateUniqueSalonSlug } from "@/lib/stylrs/slug";
import { DEFAULT_OPENING_HOURS } from "@/lib/stylrs/constants";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/stylrs/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Onjuist e-mailadres of wachtwoord." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/stylrs/login" });
}

export type RegisterState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function registerSalon(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSalonSchema.safeParse({
    salonName: formData.get("salonName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Controleer de ingevulde gegevens.", fieldErrors };
  }

  const { salonName, ownerName, email, password } = parsed.data;

  const existing = await prisma.salonUser.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "Dit e-mailadres is al in gebruik." } };
  }

  const slug = await generateUniqueSalonSlug(salonName);
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const salon = await tx.salon.create({
      data: {
        name: salonName,
        slug,
        email,
      },
    });

    await tx.salonUser.create({
      data: {
        salonId: salon.id,
        name: ownerName,
        email,
        passwordHash,
        role: "OWNER",
      },
    });

    await tx.openingHours.createMany({
      data: DEFAULT_OPENING_HOURS.map((day) => ({ ...day, salonId: salon.id })),
    });

    await tx.bookingSettings.create({ data: { salonId: salon.id } });
    await tx.emailAutomationSettings.create({ data: { salonId: salon.id } });
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/stylrs/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account is aangemaakt, maar inloggen is mislukt. Probeer opnieuw in te loggen." };
    }
    throw error;
  }
}
