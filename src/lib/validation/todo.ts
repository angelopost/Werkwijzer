import { z } from "zod";

export const todoFormSchema = z.object({
  title: z.string().min(1, { error: "Titel is verplicht" }).max(200),
  description: z.string().max(2000).optional(),
  date: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["DRINGEND", "NORMAAL", "NIET_DRINGEND"]),
  permanent: z.coerce.boolean().optional().default(false),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
