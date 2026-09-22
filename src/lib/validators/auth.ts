import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Insira um endereço de e-mail válido." }),
  password: z
    .string()
    .min(1, { message: "A senha é obrigatória." })
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const recuperarSenhaSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Insira um endereço de e-mail válido." }),
});

export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "A nova senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z
      .string()
      .min(1, { message: "A confirmação da senha é obrigatória." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>;
