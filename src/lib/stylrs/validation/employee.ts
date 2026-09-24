import { z } from "zod";

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, { error: "Voornaam is verplicht" }),
  lastName: z.string().min(1, { error: "Achternaam is verplicht" }),
  email: z.email({ error: "Ongeldig e-mailadres" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  function: z.string().optional().or(z.literal("")),
  color: z.string().min(1),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const availabilityFormSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    working: z.coerce.boolean(),
    startTime: z.string().regex(timePattern, { error: "Ongeldige tijd" }).optional(),
    endTime: z.string().regex(timePattern, { error: "Ongeldige tijd" }).optional(),
  })
  .refine((data) => !data.working || (data.startTime && data.endTime && data.startTime < data.endTime), {
    error: "Eindtijd moet na begintijd liggen",
    path: ["endTime"],
  });

export const timeOffFormSchema = z
  .object({
    startDate: z.string().min(1, { error: "Startdatum is verplicht" }),
    endDate: z.string().min(1, { error: "Einddatum is verplicht" }),
    reason: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.startDate <= data.endDate, {
    error: "Einddatum moet na startdatum liggen",
    path: ["endDate"],
  });
