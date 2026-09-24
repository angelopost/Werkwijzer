"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/stylrs/permissions";
import {
  salonInfoSchema,
  bookingSettingsSchema,
  emailSettingsSchema,
} from "@/lib/stylrs/validation/settings";

export type ActionState = { error?: string } | undefined;

function revalidateSettings() {
  revalidatePath("/stylrs/instellingen");
}

export async function updateSalonInfo(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();

  const parsed = salonInfoSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    city: formData.get("city") ?? "",
    website: formData.get("website") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.salon.update({
    where: { id: user.salonId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      postalCode: parsed.data.postalCode || null,
      city: parsed.data.city || null,
      website: parsed.data.website || null,
      logoUrl: parsed.data.logoUrl || null,
    },
  });

  revalidateSettings();
}

export async function updateOpeningHours(formData: FormData): Promise<ActionState> {
  const user = await requireOwner();

  const days = Array.from({ length: 7 }, (_, weekday) => {
    const isClosed = formData.get(`closed-${weekday}`) !== "on";
    return {
      weekday,
      isClosed,
      openTime: (formData.get(`open-${weekday}`) as string) || undefined,
      closeTime: (formData.get(`close-${weekday}`) as string) || undefined,
    };
  });

  for (const day of days) {
    if (!day.isClosed && (!day.openTime || !day.closeTime || day.openTime >= day.closeTime)) {
      return { error: "Sluitingstijd moet na openingstijd liggen." };
    }
  }

  await prisma.$transaction(
    days.map((day) =>
      prisma.openingHours.upsert({
        where: { salonId_weekday: { salonId: user.salonId, weekday: day.weekday } },
        create: {
          salonId: user.salonId,
          weekday: day.weekday,
          isClosed: day.isClosed,
          openTime: day.isClosed ? null : day.openTime,
          closeTime: day.isClosed ? null : day.closeTime,
        },
        update: {
          isClosed: day.isClosed,
          openTime: day.isClosed ? null : day.openTime,
          closeTime: day.isClosed ? null : day.closeTime,
        },
      })
    )
  );

  revalidateSettings();
}

export async function updateBookingSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();

  const parsed = bookingSettingsSchema.safeParse({
    maxAdvanceDays: formData.get("maxAdvanceDays"),
    minNoticeMinutes: formData.get("minNoticeMinutes"),
    bufferMinutes: formData.get("bufferMinutes"),
    allowEmployeeSelection: formData.get("allowEmployeeSelection") === "on",
    allowNoPreference: formData.get("allowNoPreference") === "on",
    allowCustomerCancel: formData.get("allowCustomerCancel") === "on",
    cancelDeadlineHours: formData.get("cancelDeadlineHours"),
    requirePhone: formData.get("requirePhone") === "on",
    requireEmail: formData.get("requireEmail") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.bookingSettings.update({
    where: { salonId: user.salonId },
    data: {
      maxAdvanceDays: parsed.data.maxAdvanceDays,
      minNoticeMinutes: parsed.data.minNoticeMinutes,
      bufferMinutes: parsed.data.bufferMinutes,
      allowEmployeeSelection: !!parsed.data.allowEmployeeSelection,
      allowNoPreference: !!parsed.data.allowNoPreference,
      allowCustomerCancel: !!parsed.data.allowCustomerCancel,
      cancelDeadlineHours: parsed.data.cancelDeadlineHours,
      requirePhone: !!parsed.data.requirePhone,
      requireEmail: !!parsed.data.requireEmail,
    },
  });

  revalidateSettings();
}

export async function updateEmailSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireOwner();

  const parsed = emailSettingsSchema.safeParse({
    confirmationEnabled: formData.get("confirmationEnabled") === "on",
    reminderEnabled: formData.get("reminderEnabled") === "on",
    reminderHoursBefore: formData.get("reminderHoursBefore"),
    rescheduledEnabled: formData.get("rescheduledEnabled") === "on",
    cancelledEnabled: formData.get("cancelledEnabled") === "on",
    reviewRequestEnabled: formData.get("reviewRequestEnabled") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
  }

  await prisma.emailAutomationSettings.update({
    where: { salonId: user.salonId },
    data: {
      confirmationEnabled: !!parsed.data.confirmationEnabled,
      reminderEnabled: !!parsed.data.reminderEnabled,
      reminderHoursBefore: parsed.data.reminderHoursBefore,
      rescheduledEnabled: !!parsed.data.rescheduledEnabled,
      cancelledEnabled: !!parsed.data.cancelledEnabled,
      reviewRequestEnabled: !!parsed.data.reviewRequestEnabled,
    },
  });

  revalidateSettings();
}
