import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(1, { error: "Naam is verplicht" }),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, { error: "Prijs moet 0 of hoger zijn" }),
  durationMinutes: z.coerce.number().int().min(5, { error: "Duur moet minstens 5 minuten zijn" }),
  category: z.string().optional().or(z.literal("")),
  active: z.coerce.boolean().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
