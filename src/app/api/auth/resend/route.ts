// src/app/api/auth/resend/route.ts — reenvio verificação, cooldown 60s, rate 5/dia (mem)
// Alternativa A: reenvia via supabase.auth.resend (gera novo token) → hook re-dispara Resend
// Fallback se sem service_role: usa anon resend com email (precisa NEXT_PUBLIC_APP_URL)
// Por que existe: UX — usuário não recebeu email ou link expirou (1h) precisa reenviar sem recriar conta
// LGPD: valida email via Zod, não expõe se email existe (retorna ok idempotente quando already confirmed)
// Pirâmide: topo — API com rate limit em memória (suficiente TCC, prod migra para Upstash Redis)

import { NextRequest, NextResponse } from "next/server"; // Next.js 15 — handler tipado
import { createClient } from "@/lib/supabase/server"; // client server que lê cookies (SSR) — anon key
import { resendBodySchema } from "@/lib/validators/verificacao"; // validação Zod email max 255

// Rate limit em memória — Map<email, {count, resetAt, lastAt}>
// Por que memória: TCC sem Redis; trade: perde estado em restart, mas 5/dia é tolerante
// Prod: trocar por Upstash Redis ou Supabase table com TTL
const mem = new Map<string, { count: number; resetAt: number; lastAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000; // janela 24h — 5 envios por dia
const MAX_PER_DAY = 5; // limite dia — evita abuse/spam
const COOLDOWN_MS = 60 * 1000; // cooldown 60s — evita flood clique

// Verifica e atualiza rate limit — retorna allowed + retryAfter em segundos
function checkRate(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now(); // timestamp atual
  const key = email.toLowerCase(); // normaliza para case-insensitive
  const entry = mem.get(key); // busca histórico do email
  if (!entry || now > entry.resetAt) {
    // sem histórico ou janela expirou — reseta contador
    mem.set(key, { count: 1, resetAt: now + WINDOW_MS, lastAt: now }); // inicia nova janela
    return { allowed: true }; // permite 1º envio da janela
  }
  if (now - entry.lastAt < COOLDOWN_MS) {
    // dentro do cooldown — bloqueia
    return { allowed: false, retryAfter: Math.ceil((COOLDOWN_MS - (now - entry.lastAt)) / 1000) }; // segundos restantes
  }
  if (entry.count >= MAX_PER_DAY) {
    // limite diário atingido — bloqueia até resetAt
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }; // segundos até liberar
  }
  entry.count += 1; // incrementa contador dentro da janela
  entry.lastAt = now; // atualiza último envio
  return { allowed: true }; // permite
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
  const rate = checkRate(email); // verifica cooldown e limite diário
  if (!rate.allowed) {
    return NextResponse.json({ error: `Aguarde ${rate.retryAfter}s antes de reenviar`, retryAfter: rate.retryAfter }, { status: 429 }); // 429 Too Many Requests
  }

  // 2. Chama Supabase resend — gera novo token_hash e dispara hook novamente (que chama Resend)
  const supabase = await createClient(); // client com cookies — usa sessão anon, não precisa service_role
  // supabase.auth.resend gera novo email (dispara hook novamente se configurado)
  const { error } = await supabase.auth.resend({
    type: "signup", // tipo deve ser signup para hook interceptar (ver supabase-hook route)
    email, // email destino — normalizado
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verificar-email` }, // redirect que hook usa como base da URL
  });

  // 3. Trata resposta Supabase
  if (error) {
    // Se já confirmado, Supabase retorna "already confirmed" ou "already verified" — tratar como sucesso idempotente
    // Por que idempotente: evita enumerar existência de conta (LGPD) e UX melhor (não assusta usuário)
    const msg = error.message.toLowerCase(); // case-insensitive match
    if (msg.includes("already confirmed") || msg.includes("already verified")) {
      return NextResponse.json({ ok: true, alreadyVerified: true }); // 200 — já verificado, não erro
    }
    return NextResponse.json({ error: error.message }, { status: 400 }); // 400 — outro erro (ex: email inválido Supabase)
  }

  return NextResponse.json({ ok: true }); // 200 — reenvio ok, hook vai enviar via Resend (ou SMTP fallback)
}
