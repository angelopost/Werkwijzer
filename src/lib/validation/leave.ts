import { z } from "zod";

export const leaveFormSchema = z
  .object({
    type: z.enum(["VERLOF", "ZIEK"]),
    startDate: z.string().min(1, { error: "Startdatum is verplicht" }),
    endDate: z.string().min(1, { error: "Einddatum is verplicht" }),
    reason: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    error: "Einddatum moet op of na de startdatum liggen",
    path: ["endDate"],
  });
