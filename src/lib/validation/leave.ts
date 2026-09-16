import { z } from "zod";

const optionalTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, { error: "Ongeldige tijd" })
  .optional()
  .or(z.literal(""));

export const leaveFormSchema = z
  .object({
    type: z.enum(["VERLOF", "ZIEK"]),
    startDate: z.string().min(1, { error: "Startdatum is verplicht" }),
    endDate: z.string().min(1, { error: "Einddatum is verplicht" }),
    startTime: optionalTime,
    endTime: optionalTime,
    reason: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    error: "Einddatum moet op of na de startdatum liggen",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.startDate !== data.endDate || !data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    { error: "Eindtijd moet na starttijd liggen", path: ["endTime"] }
  );
