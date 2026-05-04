import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z
    .string()
    .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" }),
  email: z.email({ error: "Email inválido" }),
  password: z
    .string()
    .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
