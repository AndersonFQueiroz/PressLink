// src/app/api/auth/resend/route.ts — reenvio verificação, cooldown 60s, rate 5/dia (mem)
// Alternativa A: reenvia via supabase.auth.resend (gera novo token) → hook re-dispara Resend
// Fallback se sem service_role: usa anon resend com email (precisa NEXT_PUBLIC_APP_URL)
// Por que existe: UX — usuário não recebeu email ou link expirou (1h) precisa reenviar sem recriar conta
// LGPD: valida email via Zod, não expõe se email existe (retorna ok idempotente quando already confirmed)
// Pirâmide: topo — API com rate limit em memória (suficiente TCC, prod migra para Upstash Redis)

import { NextRequest, NextResponse } from "next/server"; // Next.js 15 — handler tipado
import { createClient } from "@/lib/supabase/server"; // client server que lê cookies (SSR) — anon key
import { resendBodySchema } from "@/lib/validators/verificacao"; // validação Zod email max 255
import { maskEmail } from "@/lib/resend"; // LGPD: nunca logar email completo
import { resolveAppUrl } from "@/lib/app-url"; // base URL do redirect de verificação

// Rate limit em memória — Map<email, {count, resetAt, lastAt}>
// Por que memória: TCC sem Redis; trade conhecido — em serverless cada instância tem seu Map,
// então o limite real é mais frouxo que o configurado. Prod: Upstash Redis ou tabela com TTL.
const mem = new Map<string, { count: number; resetAt: number; lastAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000; // janela 24h — 5 envios por dia
const MAX_PER_DAY = 5; // limite dia — evita abuse/spam
const COOLDOWN_MS = 60 * 1000; // cooldown 60s — evita flood clique
const MAX_KEYS = 5000; // teto do Map — evita crescimento ilimitado controlado por atacante

// Remove janelas expiradas quando o Map chega no teto
function pruneExpired(now: number): void {
  if (mem.size < MAX_KEYS) return;
  for (const [key, entry] of mem) {
    if (now > entry.resetAt) mem.delete(key);
  }
}

// Só consulta — NÃO consome cota. Consumir antes de enviar fazia o usuário
// perder um dos 5 envios do dia quando o Supabase/Resend falhava.
function peekRate(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = mem.get(email);
  if (!entry || now > entry.resetAt) return { allowed: true }; // sem janela ativa

  // Limite diário primeiro: se a cota acabou, o retryAfter real é em horas, não os 60s do cooldown
  if (entry.count >= MAX_PER_DAY) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  if (now - entry.lastAt < COOLDOWN_MS) {
    return { allowed: false, retryAfter: Math.ceil((COOLDOWN_MS - (now - entry.lastAt)) / 1000) };
  }
  return { allowed: true };
}

// Consome a cota — chamado só depois de um envio bem-sucedido
function commitRate(email: string): void {
  const now = Date.now();
  const entry = mem.get(email);
  if (!entry || now > entry.resetAt) {
    pruneExpired(now);
    mem.set(email, { count: 1, resetAt: now + WINDOW_MS, lastAt: now });
    return;
  }
  entry.count += 1;
  entry.lastAt = now;
}

// POST /api/auth/resend — body { email }
export async function POST(req: NextRequest) {
  // 1. Parse JSON com validação
  let body: unknown;
  try {
    body = await req.json(); // pode throw se body vazio ou não JSON
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); // 400 — client error
  }
  const parsed = resendBodySchema.safeParse(body); // Zod valida email
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 }); // 400 — mensagem amigável

  const email = parsed.data.email.toLowerCase().trim(); // normaliza — evita duplicar rate limit por case
  const rate = peekRate(email); // consulta sem consumir
  if (!rate.allowed) {
    return NextResponse.json({ error: `Aguarde ${rate.retryAfter}s antes de reenviar`, retryAfter: rate.retryAfter }, { status: 429 }); // 429 Too Many Requests
  }

  // 2. Chama Supabase resend — gera novo token_hash e dispara hook novamente (que chama Resend)
  const supabase = await createClient(); // client com cookies — usa sessão anon, não precisa service_role
  // supabase.auth.resend gera novo email (dispara hook novamente se configurado)
  const { error } = await supabase.auth.resend({
    type: "signup", // tipo deve ser signup para hook interceptar (ver supabase-hook route)
    email, // email destino — normalizado
    options: { emailRedirectTo: `${resolveAppUrl()}/verificar-email` }, // redirect que hook usa como base da URL
  });

  // 3. Trata resposta Supabase
  if (error) {
    const msg = error.message.toLowerCase(); // case-insensitive match
    // Se já confirmado, tratar como sucesso idempotente — não assusta o usuário
    if (msg.includes("already confirmed") || msg.includes("already verified")) {
      return NextResponse.json({ ok: true, alreadyVerified: true }); // 200 — já verificado, não erro
    }

    // Qualquer outro erro: loga mascarado e responde igual ao sucesso.
    // Por que: devolver 400 com error.message abre oráculo de existência de conta
    // (enumeração) e vaza mensagem interna do GoTrue. A cota NÃO é consumida.
    console.warn(`[resend] falha no reenvio para ${maskEmail(email)}`); // sem PII
    return NextResponse.json({ ok: true }); // 200 — indistinguível de sucesso
  }

  commitRate(email); // só consome cota quando o envio realmente saiu
  return NextResponse.json({ ok: true }); // 200 — reenvio ok, hook vai enviar via Resend (ou SMTP fallback)
}

