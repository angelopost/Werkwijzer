import { z } from "zod";

export const availabilityFormSchema = z.object({
  date: z.string().min(1),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "PREFERRED"]),
  note: z.string().max(300).optional(),
});
