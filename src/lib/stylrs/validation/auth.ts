import { z } from "zod";

export const registerSalonSchema = z
  .object({
    salonName: z.string().min(2, { error: "Salonnaam moet minstens 2 tekens zijn" }),
    ownerName: z.string().min(2, { error: "Naam moet minstens 2 tekens zijn" }),
    email: z.email({ error: "Ongeldig e-mailadres" }),
    password: z.string().min(8, { error: "Wachtwoord moet minstens 8 tekens zijn" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

export type RegisterSalonValues = z.infer<typeof registerSalonSchema>;

export const loginSchema = z.object({
  email: z.email({ error: "Ongeldig e-mailadres" }),
  password: z.string().min(1, { error: "Wachtwoord is verplicht" }),
});
