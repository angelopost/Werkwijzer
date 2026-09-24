import { z } from "zod";

export const salonInfoSchema = z.object({
  name: z.string().min(2, { error: "Salonnaam moet minstens 2 tekens zijn" }),
  email: z.email({ error: "Ongeldig e-mailadres" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
});

export const bookingSettingsSchema = z.object({
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
  minNoticeMinutes: z.coerce.number().int().min(0).max(10080),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
  allowEmployeeSelection: z.coerce.boolean().optional(),
  allowNoPreference: z.coerce.boolean().optional(),
  allowCustomerCancel: z.coerce.boolean().optional(),
  cancelDeadlineHours: z.coerce.number().int().min(0).max(720),
  requirePhone: z.coerce.boolean().optional(),
  requireEmail: z.coerce.boolean().optional(),
});

export const emailSettingsSchema = z.object({
  confirmationEnabled: z.coerce.boolean().optional(),
  reminderEnabled: z.coerce.boolean().optional(),
  reminderHoursBefore: z.coerce.number().int().min(1).max(168),
  rescheduledEnabled: z.coerce.boolean().optional(),
  cancelledEnabled: z.coerce.boolean().optional(),
  reviewRequestEnabled: z.coerce.boolean().optional(),
});
