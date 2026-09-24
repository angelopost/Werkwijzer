import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const publicBookingSchema = z.object({
  serviceId: z.string().min(1),
  employeeId: z.string().optional().or(z.literal("")),
  date: z.string().min(1),
  time: z.string().regex(timePattern),
  firstName: z.string().min(1, { error: "Voornaam is verplicht" }),
  lastName: z.string().min(1, { error: "Achternaam is verplicht" }),
  email: z.email({ error: "Ongeldig e-mailadres" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type PublicBookingValues = z.infer<typeof publicBookingSchema>;
