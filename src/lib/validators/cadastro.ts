import { z } from "zod";

export const cadastroSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(80, "Nome deve ter no máximo 80 caracteres")
    .transform((v) => v.trim()),
  username: z
    .string()
    .min(1, "Username é obrigatório")
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(30, "Username deve ter no máximo 30 caracteres")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/,
      "Use apenas letras minúsculas, números e hífen (não pode começar/terminar com hífen)",
    )
    .transform((v) => v.toLowerCase().trim()),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(255, "E-mail muito longo")
    .transform((v) => v.toLowerCase().trim()),
  senha: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"),
  aceiteLgpd: z.boolean().refine((v) => v === true, {
    message: "Você precisa aceitar os Termos e a Política de Privacidade",
  }),
});

export type CadastroFormData = z.infer<typeof cadastroSchema>;
