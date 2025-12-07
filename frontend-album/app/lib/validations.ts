import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").max(150, "El usuario no puede exceder 150 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  passwordConfirm: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

export const profileSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").max(150, "El usuario no puede exceder 150 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Formato de email invalido"),
  bio: z.string().max(500, "La biografía no puede exceder 500 caracteres").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;