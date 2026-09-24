import { z } from "zod";

export const customerFormSchema = z.object({
  firstName: z.string().min(1, { error: "Voornaam is verplicht" }),
  lastName: z.string().min(1, { error: "Achternaam is verplicht" }),
  email: z.email({ error: "Ongeldig e-mailadres" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerNoteSchema = z.object({
  body: z.string().min(1, { error: "Notitie mag niet leeg zijn" }),
});
