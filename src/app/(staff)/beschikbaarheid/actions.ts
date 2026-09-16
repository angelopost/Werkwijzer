"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/dates";
import { availabilityFormSchema } from "@/lib/validation/availability";

export async function setAvailability(formData: FormData) {
  const user = await requireStaff();

  const parsed = availabilityFormSchema.safeParse({
    date: formData.get("date"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return;
  const { date, status, note } = parsed.data;

  await prisma.availability.upsert({
    where: { userId_date: { userId: user.id, date: parseDateKey(date) } },
    update: { status, note: note ?? null },
    create: { userId: user.id, date: parseDateKey(date), status, note: note ?? null },
  });

  revalidatePath("/beschikbaarheid");
  revalidatePath("/rooster");
}
