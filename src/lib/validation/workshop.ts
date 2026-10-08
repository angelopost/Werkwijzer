import { z } from "zod";

export const workshopCreateSchema = z.object({
  name: z.string().trim().min(1, { error: "Naam is verplicht" }).max(200),
  date: z.string().min(1, { error: "Datum is verplicht" }),
});

export const workshopNotesSchema = z.object({
  notes: z.string().max(2000).optional(),
});

/** De drie opvolgstatussen, die direct worden opgeslagen zodra je ze aanklikt. */
export const workshopStatusSchema = z.object({
  status: z.enum(["OPEN", "REMINDER", "AFGEHANDELD"]).optional(),
  paymentLinkSent: z.boolean().optional(),
  paid: z.boolean().optional(),
});

const timeValue = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]);

/** Begin- en eindtijd (HH:mm) van de workshop; allebei optioneel. */
export const workshopTimeSchema = z.object({
  startTime: timeValue,
  endTime: timeValue,
});

export const workshopActionSchema = z.object({
  date: z.string().min(1, { error: "Datum is verplicht" }),
  description: z.string().trim().min(1, { error: "Omschrijving is verplicht" }).max(1000),
});
