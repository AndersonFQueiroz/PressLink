import { z } from "zod";

const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;

const urlOptional = z
  .string()
  .max(500, "URL muito longa")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v.trim() : ""))
  .refine((v) => !v || /^https?:\/\/.+/.test(v), "Use URL completa com https://");

export const perfilSchema = z.object({
  nome_artistico: z
    .string()
    .min(1, "Nome artístico é obrigatório")
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .transform((v) => v.trim()),
  username: z
    .string()
    .min(1, "Username é obrigatório")
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(usernameRegex, "Apenas letras minúsculas, números e hífen (não iniciar/terminar com hífen)")
    .transform((v) => v.toLowerCase().trim()),
  biografia_pt: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  biografia_en: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
  instagram: urlOptional,
  tiktok: urlOptional,
  twitter_x: urlOptional,
  facebook: urlOptional,
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
