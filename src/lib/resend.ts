// src/lib/resend.ts — client Resend singleton, server-only, fallback se sem key
// RF: Resend verificação email (Alternativa A Hook) — mantém Supabase SMTP se RESEND_API_KEY ausente
// Por que existe: centraliza acesso ao Resend para hook e reenvio; evita criar múltiplos clients; aplica LGPD (maskEmail)
// Pirâmide de testes: base — util puro, sem I/O externo, testável via tsc/eslint

import { Resend } from "resend"; // SDK oficial Resend — server-only, precisa Node runtime (não Edge)

// Cache singleton em memória (server) — evita recriar Resend a cada request (economia + idempotência)
let _resend: Resend | null = null;

// Retorna client Resend ou null se sem key (fallback SMTP do Supabase, não quebra cadastro)
// Por que null: Alternativa A exige que hook retorne 200 skipped quando RESEND_API_KEY ausente (dev / fallback prod)
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY; // server-only env — nunca expor ao client (NEXT_PUBLIC_ proibido)
  if (!key) return null; // fallback: não quebra, caller loga warn com maskEmail (ice LGPD)
  if (!_resend) _resend = new Resend(key); // lazy init — só cria quando primeira chamada com key válida
  return _resend;
}

// Retorna remetente configurado ou fallback dev (onboarding@resend.dev só envia para dono da conta)
// Por que função: permite trocar RESEND_FROM sem rebuild de template; prod usa domínio verificado presslink.app
export function getResendFrom(): string {
  return process.env.RESEND_FROM || "PressLink <onboarding@resend.dev>"; // fallback dev seguro
}

// Mascara email para logs (LGPD ice) — evita PII em Vercel/Node logs
// Ex: "dimife@example.com" -> "di***@example.com" ; sem @ -> "***" (dado inválido)
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@"); // separa local e domínio
  if (!domain) return "***"; // sem domínio não expõe nada
  return `${user.slice(0, 2)}***@${domain}`; // expõe só 2 chars iniciais, suficiente para debug sem vazar PII
}
