import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect("/");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireStaff() {
  return requireRole("STAFF");
}
