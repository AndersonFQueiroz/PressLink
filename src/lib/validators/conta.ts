import { z } from "zod";

/**
 * Corpo do DELETE /api/conta (issue #29).
 *
 * A senha é a confirmação explícita exigida pelo critério de aceite: sem ela o
 * servidor não apaga nada. O limite de 72 caracteres é o máximo que o bcrypt
 * do Supabase Auth considera (o restante é ignorado).
 */
export const excluirContaSchema = z.object({
  senha: z
    .string({ message: "Informe sua senha para confirmar" })
    .min(1, "Informe sua senha para confirmar")
    .max(72, "Senha muito longa"),
});

export type ExcluirContaInput = z.infer<typeof excluirContaSchema>;
