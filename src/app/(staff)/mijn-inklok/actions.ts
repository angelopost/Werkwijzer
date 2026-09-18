"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/permissions";
import { clockInUser, clockOutUser } from "@/lib/time-entries";

export async function clockIn() {
  const user = await requireStaff();
  const result = await clockInUser(user.id);
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
  return result?.error
    ? { error: result.error }
    : { entry: { clockIn: result.entry!.clockIn.toISOString(), clockOut: null } };
}

export async function clockOut() {
  const user = await requireStaff();
  const result = await clockOutUser(user.id);
  revalidatePath("/mijn-inklok");
  revalidatePath("/inklokken");
  return result?.error
    ? { error: result.error }
    : {
        entry: {
          clockIn: result.entry!.clockIn.toISOString(),
          clockOut: result.entry!.clockOut!.toISOString(),
        },
      };
}
