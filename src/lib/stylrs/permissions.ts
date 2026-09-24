import "server-only";
import { redirect } from "next/navigation";
import { auth, type StylrsAuthUser } from "@/lib/stylrs/auth";

export async function requireSalonUser(): Promise<StylrsAuthUser> {
  const session = await auth();
  if (!session?.user?.salonId) {
    redirect("/stylrs/login");
  }
  return session.user as unknown as StylrsAuthUser;
}

export async function requireOwner(): Promise<StylrsAuthUser> {
  const user = await requireSalonUser();
  if (user.salonRole !== "OWNER") {
    redirect("/stylrs/dashboard");
  }
  return user;
}

export async function getOptionalSalonUser(): Promise<StylrsAuthUser | null> {
  const session = await auth();
  if (!session?.user?.salonId) return null;
  return session.user as unknown as StylrsAuthUser;
}
