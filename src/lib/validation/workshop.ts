import { z } from "zod";

export const workshopCreateSchema = z.object({
  name: z.string().trim().min(1, { error: "Naam is verplicht" }).max(200),
  date: z.string().min(1, { error: "Datum is verplicht" }),
});

export const workshopUpdateSchema = z.object({
  name: z.string().trim().min(1, { error: "Naam is verplicht" }).max(200),
  date: z.string().min(1, { error: "Datum is verplicht" }),
  status: z.enum(["OPEN", "REMINDER", "AFGEHANDELD"]),
  paymentLinkSent: z.enum(["ja", "nee"]),
  paid: z.enum(["ja", "nee"]),
  notes: z.string().max(2000).optional(),
});

export const workshopActionSchema = z.object({
  date: z.string().min(1, { error: "Datum is verplicht" }),
  description: z.string().trim().min(1, { error: "Omschrijving is verplicht" }).max(1000),
});
