import { z } from "zod";

export const shiftFormSchema = z
  .object({
    date: z.string().min(1, { error: "Datum is verplicht" }),
    assignedUserId: z.string().min(1, { error: "Medewerker is verplicht" }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, { error: "Ongeldige starttijd" }),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, { error: "Ongeldige eindtijd" }),
    breakMinutes: z.coerce.number().int().min(0).max(240).default(0),
    notes: z.string().max(500).optional(),
    permanent: z.coerce.boolean().optional().default(false),
  })
  .refine((data) => data.endTime > data.startTime, {
    error: "Eindtijd moet na starttijd liggen",
    path: ["endTime"],
  });

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;
