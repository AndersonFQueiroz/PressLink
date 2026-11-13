// src/lib/validators/verificacao.ts — schemas Zod para verificação de email e reenvio
// RF: Resend verificação (Alternativa A Hook) — valida payloads do hook e da API /api/auth/resend
// Por que existe: evita 400/500 por dado malformado; centraliza mensagens e limites (LGPD max 255)
// Pirâmide: base — validação pura, sem I/O, cobre borda da API (teste unitário fácil)

import { z } from "zod"; // zod já é dep do projeto (usado em cadastro.ts) — reuso, custo zero

// Valida query ?token ou payload hook — garante token mínimo 32 chars (token_hash Supabase) e máximo 512 (evita overflow)
export const tokenQuerySchema = z.object({
  token: z.string().min(32, "Token inválido").max(512), // token_hash do Supabase (hex/base64) — nunca logar completo
  type: z.enum(["signup", "recovery", "email_change"]).optional(), // tipo OTP — só signup é interceptado no hook
});

// Valida body do reenvio POST /api/auth/resend — só email é necessário (cooldown/rate em memória)
// Por que simples: reenvio usa supabase.auth.resend que exige só email; token será regenerado pelo Supabase Hook
export const resendBodySchema = z.object({
  email: z.string().email("E-mail inválido").max(255), // max 255 = limite RFC 5321, evita DoS por string gigante
});

// Tipos inferidos para uso tipado nas rotas
export type TokenQuery = z.infer<typeof tokenQuerySchema>;
export type ResendBody = z.infer<typeof resendBodySchema>;
