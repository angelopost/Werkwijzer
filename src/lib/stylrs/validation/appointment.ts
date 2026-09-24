import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const manualAppointmentSchema = z
  .object({
    customerId: z.string().optional().or(z.literal("")),
    newCustomerFirstName: z.string().optional().or(z.literal("")),
    newCustomerLastName: z.string().optional().or(z.literal("")),
    newCustomerEmail: z.email().optional().or(z.literal("")),
    newCustomerPhone: z.string().optional().or(z.literal("")),
    employeeId: z.string().min(1, { error: "Kies een medewerker" }),
    serviceId: z.string().min(1, { error: "Kies een behandeling" }),
    date: z.string().min(1, { error: "Kies een datum" }),
    startTime: z.string().regex(timePattern, { error: "Ongeldige tijd" }),
    price: z.coerce.number().min(0).optional(),
    note: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.customerId || (data.newCustomerFirstName && data.newCustomerLastName), {
    error: "Kies een klant of vul een nieuwe klant in",
    path: ["customerId"],
  });

export type ManualAppointmentValues = z.infer<typeof manualAppointmentSchema>;
