import { z } from "zod";

// validações RF-15: nome_evento, data, horario, local, cidade
// cidade/UF formato livre mas 2-100 chars, UF opcional (ex: "São Paulo/SP")
export const showBaseSchema = z.object({
  nome_evento: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres").max(80, "Máximo 80 caracteres"),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)")
    .refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  horario: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || v === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), "Horário inválido (HH:mm)"),
  local: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || v === undefined || (v.length >= 2 && v.length <= 100), "Local deve ter 2-100 caracteres"),
  cidade: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || v === undefined || (v.length >= 2 && v.length <= 100), "Cidade deve ter 2-100 caracteres"),
});

export const showCreateSchema = showBaseSchema;

export const showUpdateSchema = showBaseSchema.extend({
  id: z.string().uuid("ID inválido"),
});

export const showDeleteSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

export type ShowCreateData = z.infer<typeof showCreateSchema>;
export type ShowUpdateData = z.infer<typeof showUpdateSchema>;
export type ShowDeleteData = z.infer<typeof showDeleteSchema>;
