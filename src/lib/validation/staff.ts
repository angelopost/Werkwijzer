import { z } from "zod";

export const staffFormSchema = z.object({
  name: z.string().min(2, { error: "Naam moet minstens 2 tekens zijn" }),
  email: z.email({ error: "Ongeldig e-mailadres" }),
  contractHoursPerWeek: z.coerce.number().min(0).max(60).optional(),
  contractType: z.enum(["VAST", "NUL_UREN"]).optional(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, { error: "Wachtwoord moet minstens 8 tekens zijn" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });
