---
titulo: "PressLink — Plano Resend Verificação Email (Alternativa A Hook)"
tipo: plano
status: pronto-para-execucao
tags: [presslink, resend, verificacao-email, superpowers, writing-plans]
criado: 2026-09-18
fonte: "raw/presslink-resend-verificacao.md:45 (Alternativa A Rank1) + 02-projetos/PressLink.md:1 + src/components/features/auth/CadastroForm.tsx:33"
conexoes: ["[[02-projetos/PressLink]]", "[[wiki/entities/presslink]]", "[[wiki/log]]"]
resumo: "Plano writing-plans 10 tasks (2-5min) Alternativa A Supabase Hook + Resend — magic link, middleware, React Email ink/fuchsia, fallback SMTP, paralelo com #13"
orquestra: "dry orquestra + haxixe (vault) + skank (codebase) + ice (LGPD) — conjunto"
decisoes_dimi: "A Hook (sem tabela nova), resend.dev dev / RESEND_FROM env, magic link Supabase 1h, cooldown 60s rate 5/dia mem, bloqueia /painel/* middleware, React Email, fallback SMTP, paralelo #13"
---

# Plano — Resend Verificação Email (PressLink) — 2026-09-18

> **Método:** `superpowers/writing-plans` — tasks 2-5min, paths exatos, código completo esperado, verificação `eslint + tsc + build`
> **Orquestra conjunta:** `dry` coordena + `haxixe` wiki + `skank` codebase + `ice` LGPD — todos colaboram
> **Escolha Dimi (AUTORIZO implícito):** Alternativa A — Supabase Hook + Resend (menor risco TCC, mantém `auth.users.email_confirmed_at`)

---

## Contexto rápido (ler antes de codar)

- Hoje `src/components/features/auth/CadastroForm.tsx:33` faz `supabase.auth.signUp` → se `session==null` mostra "Verifique seu email" (Supabase nativo). Quer customizar via Resend.
- Alternativa A: Supabase continua gerando `confirmation_token/url` → Hook `POST /api/auth/supabase-hook` recebe payload, chama `resend.emails.send`, retorna 200. Zero migration.
- Rotas públicas hoje: `/`, `/login`, `/cadastro`, `/recuperar-senha`, `/[username]` (`02-projetos/PressLink.md:23`). Nova: `/verificar-email`.
- Sem `middleware.ts` hoje (confirmado). Criar `src/middleware.ts:1` na raiz `src/` (Next 15 App Router exige `src/middleware.ts` ou root `middleware.ts`).
- ENV: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` já em `.env.example:6`. Novos: `RESEND_API_KEY` (server-only), `RESEND_FROM`, `SUPABASE_HOOK_SECRET` (opcional), `SUPABASE_SERVICE_ROLE_KEY` só se usar reenvio via admin.
- Deps novas: `resend`, `@react-email/components` (para template). `zod` já existe.

---

## ENV & Supabase Hook Config (configurar antes de Task 3)

### `.env.example` esperado (commitável)
```env
# Supabase — valores públicos
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-apenas-server
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend — verificação email (Alternativa A Hook)
RESEND_API_KEY=re_xxx
RESEND_FROM="PressLink <onboarding@resend.dev>"
SUPABASE_HOOK_SECRET=gerado-com-openssl-rand-hex-32
```

### `.env.local` (gitignore, nunca commitar)
```
RESEND_API_KEY=re_xxx_real
RESEND_FROM="PressLink <onboarding@resend.dev>" # dev; prod = "PressLink <noreply@presslink.app>" após verificar domínio
SUPABASE_HOOK_SECRET=xxx
```

### Supabase Dashboard — Hook
1. **Auth > Email Templates** — manter habilitado mas Hook sobrepõe: `Auth > Hooks > Send Email Hook` → Enable → URL: `https://SEU_APP.vercel.app/api/auth/supabase-hook` (local teste: `npx supabase` + webhook tunel ou `ngrok 3000`)
2. **Hook Secret:** gerar `openssl rand -hex 32` → colar em `SUPABASE_HOOK_SECRET` + no dashboard `HTTP Header: Authorization: Bearer <secret>` (Supabase envia header `authorization`)
3. **Email Redirect:** `Auth > URL Configuration > Site URL = NEXT_PUBLIC_APP_URL`, `Redirect URLs` adicionar `http://localhost:3000/verificar-email`, `https://presslink.app/verificar-email`
4. **Expiração:** `Auth > Email > Confirm email > Secure email change` usa 1h por padrão (OTP expiry 3600s). Mantém.
5. **Domínio Resend:** dev usar `onboarding@resend.dev` (só envia para email do dono da conta Resend). Prod verificar `presslink.app` em `resend.com/domains` (SPF `send.presslink.app` + DKIM).

### Fallback
Se `RESEND_API_KEY` ausente/vazia → hook loga `warn [resend] RESEND_API_KEY ausente — fallback Supabase SMTP` e retorna `200 { skipped: true }` (não quebra cadastro, Supabase envia email nativo). Ice LGPD: não logar email completo, só `***@dominio`.

---

## Deps

```bash
npm install resend @react-email/components
# opcional dev para preview email
npm install -D @react-email/render
```

`package.json` scripts permanecem `lint`, `typecheck`, `build`.

---

## Tasks — 10 tasks (total ~35min) — Max 12 respeitado

### Chunk API (Tasks 1-4)

#### Task 1 — Deps + ENV [2min]

**Arquivos:**
- `F:/Projetos/meu-projeto/PressLink/package.json:12` (add deps)
- `F:/Projetos/meu-projeto/PressLink/.env.example:1` (add 3 linhas)
- `F:/Projetos/meu-projeto/PressLink/.env.local` (criar se não existe, gitignore já cobre)

**Código esperado `.env.example` diff:**
```diff
 # Aplicação
 NEXT_PUBLIC_APP_URL=http://localhost:3000
+
+# Resend — verificação email (Alternativa A Hook, fallback SMTP se ausente)
+RESEND_API_KEY=re_xxx
+RESEND_FROM="PressLink <onboarding@resend.dev>"
+SUPABASE_HOOK_SECRET=seu-hook-secret-aleatorio
+SUPABASE_SERVICE_ROLE_KEY=sua-service-role-apenas-server-reenvio
```

**Código `package.json` deps diff:**
```json
"resend": "^4.0.1",
"@react-email/components": "^0.0.32"
```

**Verificação:**
```bash
npm install; if ($?) { npx tsc --noEmit; npx eslint . }
# espera: tsc 0, eslint 0, package-lock atualizado
```

---

#### Task 2 — `src/lib/resend.ts` + `src/lib/validators/verificacao.ts` [3min]

**Arquivos:**
- `F:/Projetos/meu-projeto/PressLink/src/lib/resend.ts` (novo)
- `F:/Projetos/meu-projeto/PressLink/src/lib/validators/verificacao.ts` (novo)

**Código `src/lib/resend.ts:1` (singleton + fallback):**
```ts
// src/lib/resend.ts — client Resend singleton, server-only, fallback se sem key
// RF: Resend verificação (Alternativa A Hook) — mantém Supabase SMTP se RESEND_API_KEY ausente
import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // fallback: não quebra, loga warn no caller
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export function getResendFrom(): string {
  return process.env.RESEND_FROM || "PressLink <onboarding@resend.dev>";
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}
```

**Código `src/lib/validators/verificacao.ts:1`:**
```ts
import { z } from "zod";

// valida query ?token ou payload hook
export const tokenQuerySchema = z.object({
  token: z.string().min(32, "Token inválido").max(512),
  type: z.enum(["signup", "recovery", "email_change"]).optional(),
});

export const resendBodySchema = z.object({
  email: z.string().email("E-mail inválido").max(255),
});
```

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/lib/resend.ts src/lib/validators/verificacao.ts
# espera: 0 erros
```

---

#### Task 3 — `src/app/api/auth/supabase-hook/route.ts` (core Hook) [5min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/app/api/auth/supabase-hook/route.ts` (novo)

**Código completo esperado:**
```ts
// src/app/api/auth/supabase-hook/route.ts — Supabase Auth Hook → Resend
// Alternativa A: Supabase gera token/url, nós só renderizamos email via Resend.
// Fallback: se RESEND_API_KEY ausente, retorna 200 skipped (Supabase envia nativo).
import { NextRequest, NextResponse } from "next/server";
import { getResend, getResendFrom, maskEmail } from "@/lib/resend";
import { VerificationEmail } from "@/emails/VerificationEmail";
import { render } from "@react-email/render";

export const runtime = "nodejs"; // Resend precisa Node, não Edge

type HookPayload = {
  user: { id: string; email: string; user_metadata?: { nome?: string } };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string; // ex: https://app.vercel.app/verificar-email
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change";
    site_url: string;
  };
};

export async function POST(req: NextRequest) {
  // 1. Verifica secret (Supabase envia Authorization: Bearer <HOOK_SECRET>)
  const secret = process.env.SUPABASE_HOOK_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: HookPayload;
  try {
    payload = (await req.json()) as HookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = payload?.user?.email;
  const tokenHash = payload?.email_data?.token_hash;
  const redirectTo = payload?.email_data?.redirect_to || process.env.NEXT_PUBLIC_APP_URL + "/verificar-email";
  const actionType = payload?.email_data?.email_action_type;

  // Só intercepta signup (verificação cadastro). Outros tipos deixam Supabase nativo.
  if (actionType !== "signup") {
    return NextResponse.json({ skipped: true, reason: "not_signup" });
  }
  if (!email || !tokenHash) {
    return NextResponse.json({ error: "Missing email/token_hash" }, { status: 400 });
  }

  // Monta magic link Supabase: redirect_to já contém token_hash? Supabase Hook envia token_hash, mas confirmation_url é montado pelo Supabase.
  // Usamos redirect_to como base + token_hash para /verificar-email?token_hash=xxx&type=signup
  // Alternativa: usar supabase.auth.verifyOtp no client com token_hash.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Supabase espera que o email contenha link com token_hash — vamos gerar URL que /verificar-email consome
  const verificationUrl = `${appUrl}/verificar-email?token_hash=${encodeURIComponent(tokenHash)}&type=signup&email=${encodeURIComponent(email)}`;

  const resend = getResend();
  if (!resend) {
    console.warn(`[resend] RESEND_API_KEY ausente — fallback SMTP para ${maskEmail(email)}`);
    return NextResponse.json({ skipped: true, reason: "no_api_key" });
  }

  const nome = payload.user.user_metadata?.nome || email.split("@")[0];

  try {
    const html = await render(VerificationEmail({ nome, url: verificationUrl, expiresIn: "1 hora" }));
    const text = `Olá ${nome}, confirme seu email: ${verificationUrl} (expira em 1 hora). Se não criou conta, ignore.`;

    const { error } = await resend.emails.send({
      from: getResendFrom(),
      to: email,
      subject: "Confirme seu email — PressLink",
      html,
      text,
    });

    if (error) {
      console.error("[resend] send error", error);
      // Não bloqueia cadastro — retorna 500 para Supabase tentar fallback? Mas preferimos 200 para não quebrar, loga erro.
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[resend] exception", e);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
```

**Notas ice LGPD:** não loga email completo, usa `maskEmail`. Token hash não é PII sensível mas não logar.

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/app/api/auth/supabase-hook/route.ts
curl -X POST http://localhost:3000/api/auth/supabase-hook -H "Content-Type: application/json" -H "Authorization: Bearer $SUPABASE_HOOK_SECRET" -d "{\"user\":{\"id\":\"uuid\",\"email\":\"test@exemplo.com\"},\"email_data\":{\"token\":\"x\",\"token_hash\":\"abc123\",\"redirect_to\":\"http://localhost:3000/verificar-email\",\"email_action_type\":\"signup\",\"site_url\":\"http://localhost:3000\"}}"
# espera 200 {ok:true} se RESEND_API_KEY setada, ou {skipped:true} se não. Checar resend.com/emails
```

---

#### Task 4 — `src/app/api/auth/resend/route.ts` (reenvio com cooldown 60s + rate 5/dia) [5min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/app/api/auth/resend/route.ts` (novo)

**Código:**
```ts
// src/app/api/auth/resend/route.ts — reenvio verificação, cooldown 60s, rate 5/dia (mem)
// Alternativa A: reenvia via supabase.auth.resend (gera novo token) → hook re-dispara Resend
// Fallback se sem service_role: usa anon resend com email
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resendBodySchema } from "@/lib/validators/verificacao";

const mem = new Map<string, { count: number; resetAt: number; lastAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_DAY = 5;
const COOLDOWN_MS = 60 * 1000;

function checkRate(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = email.toLowerCase();
  const entry = mem.get(key);
  if (!entry || now > entry.resetAt) {
    mem.set(key, { count: 1, resetAt: now + WINDOW_MS, lastAt: now });
    return { allowed: true };
  }
  if (now - entry.lastAt < COOLDOWN_MS) {
    return { allowed: false, retryAfter: Math.ceil((COOLDOWN_MS - (now - entry.lastAt)) / 1000) };
  }
  if (entry.count >= MAX_PER_DAY) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  entry.lastAt = now;
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const parsed = resendBodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const rate = checkRate(email);
  if (!rate.allowed) {
    return NextResponse.json({ error: `Aguarde ${rate.retryAfter}s antes de reenviar`, retryAfter: rate.retryAfter }, { status: 429 });
  }

  const supabase = await createClient();
  // supabase.auth.resend gera novo email (dispara hook novamente)
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email` },
  });

  if (error) {
    // Se já confirmado, Supabase retorna "already confirmed" → tratar como sucesso idempotente
    const msg = error.message.toLowerCase();
    if (msg.includes("already confirmed") || msg.includes("already verified")) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
```

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/app/api/auth/resend/route.ts
curl -X POST http://localhost:3000/api/auth/resend -H "Content-Type: application/json" -d "{\"email\":\"test@exemplo.com\"}"
# 1º 200, 2º imediato 429 retryAfter ~60, após 60s 200
```

---

### Chunk Email (Task 5)

#### Task 5 — `src/emails/VerificationEmail.tsx` (React Email ink/fuchsia) [4min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/emails/VerificationEmail.tsx` (novo)

**Código:**
```tsx
// src/emails/VerificationEmail.tsx — template verificação, branding ink/fuchsia, LGPD footer
// Reuso cadastro/page.tsx:12 ink + fuchsia-400/600
import { Html, Head, Body, Container, Section, Text, Button, Link, Hr } from "@react-email/components";

type Props = { nome: string; url: string; expiresIn?: string };

export function VerificationEmail({ nome, url, expiresIn = "1 hora" }: Props) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={{ backgroundColor: "#0a0a0f", margin: 0, padding: 0, fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
          <Section style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, backdropFilter: "blur(8px)" }}>
            <Text style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Press<span style={{ color: "#e879f9" }}>Link</span>
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "16px 0 8px" }}>Confirme seu email, {nome}!</Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: "20px", margin: "0 0 20px" }}>
              Clique no botão abaixo para verificar seu email e liberar o acesso ao painel. Link expira em {expiresIn}.
            </Text>
            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Button href={url} style={{ backgroundColor: "#c026d3", color: "#fff", padding: "12px 24px", borderRadius: 9999, fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
                Confirmar email
              </Button>
            </Section>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>Se o botão não funcionar, copie e cole:</Text>
            <Link href={url} style={{ fontSize: 12, color: "#e879f9", wordBreak: "break-all" }}>{url}</Link>
            <Hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" }} />
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: "16px", margin: 0 }}>
              Você recebeu porque criou conta em presslink.app. Se não foi você, ignore. Dúvidas?{" "}
              <Link href="https://presslink.app/privacidade" style={{ color: "#e879f9" }}>Política de Privacidade</Link> ·{" "}
              <Link href="https://presslink.app/termos" style={{ color: "#e879f9" }}>Termos</Link>
            </Text>
          </Section>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 16 }}>PressLink — EPK para DJs · LGPD compliant</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default VerificationEmail;
```

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/emails/VerificationEmail.tsx
# preview: npx react-email dev --dir src/emails (ou render manual)
```

---

### Chunk UI (Tasks 6-8)

#### Task 6 — `src/app/verificar-email/page.tsx` (estados: verificando/sucesso/expirado/já verificado) [5min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/app/verificar-email/page.tsx` (novo)

**Código (Server Component + Client verify):**
```tsx
// src/app/verificar-email/page.tsx — magic link Supabase: ?token_hash & type=signup & email
// Alternativa A usa supabase.auth.verifyOtp({token_hash, type}) client-side
import type { Metadata } from "next";
import { VerificarEmailClient } from "./verificar-client";

export const metadata: Metadata = { title: "Verificar email | PressLink" };

type Props = { searchParams: Promise<{ token_hash?: string; type?: string; email?: string }> };

export default async function VerificarEmailPage({ searchParams }: Props) {
  const { token_hash, type, email } = await searchParams;
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 sm:p-8 shadow-xl">
        <VerificarEmailClient tokenHash={token_hash} type={type} email={email} />
      </div>
    </main>
  );
}
```

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/app/verificar-email/verificar-client.tsx` (novo)
```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "verificando" | "sucesso" | "expirado" | "ja_verificado" | "erro";

export function VerificarEmailClient({ tokenHash, type, email }: { tokenHash?: string; type?: string; email?: string }) {
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!tokenHash || type !== "signup") {
      setState("erro");
      setMsg(email ? `Enviamos email para ${email}. Clique no link ou reenvie.` : "Link inválido. Verifique seu email ou solicite reenvio.");
      return;
    }
    setState("verificando");
    const supabase = createClient();
    supabase.auth.verifyOtp({ token_hash: tokenHash, type: "signup" }).then(({ error }) => {
      if (!error) { setState("sucesso"); return; }
      const m = error.message.toLowerCase();
      if (m.includes("expired") || m.includes("invalid")) { setState("expirado"); setMsg(error.message); }
      else if (m.includes("already")) { setState("ja_verificado"); }
      else { setState("erro"); setMsg(error.message); }
    });
  }, [tokenHash, type, email]);

  if (state === "verificando") return <p className="text-white text-center">Verificando...</p>;
  if (state === "sucesso") return (
    <div className="text-center">
      <h1 className="text-xl font-semibold text-white">Email verificado!</h1>
      <p className="text-white/60 text-sm mt-2">Agora você pode acessar o painel.</p>
      <Link href="/login" className="mt-4 inline-flex bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-full font-medium">Ir para login</Link>
    </div>
  );
  if (state === "ja_verificado") return (
    <div className="text-center"><h1 className="text-white font-semibold">Já verificado</h1><Link href="/login" className="text-fuchsia-300">Fazer login</Link></div>
  );
  if (state === "expirado") return (
    <div className="text-center">
      <h1 className="text-white font-semibold">Link expirado</h1><p className="text-white/60 text-sm">{msg}</p>
      <ReenviarForm email={email} />
    </div>
  );
  return (
    <div className="text-center">
      <h1 className="text-white font-semibold">Verifique seu email</h1><p className="text-white/60 text-sm mt-2">{msg}</p>
      <ReenviarForm email={email} />
      <Link href="/login" className="text-fuchsia-300 text-sm mt-4 inline-block">Voltar ao login</Link>
    </div>
  );
}

function ReenviarForm({ email }: { email?: string }) {
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState("");
  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown(c => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);
  async function handle() {
    if (!email) { setStatus("Informe o email usado no cadastro"); return; }
    const r = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const j = await r.json();
    if (r.ok) { setStatus("Email reenviado! Verifique spam."); setCooldown(60); }
    else { setStatus(j.error || "Erro ao reenviar"); if (j.retryAfter) setCooldown(j.retryAfter); }
  }
  return (
    <div className="mt-4">
      <button onClick={handle} disabled={cooldown > 0} className="w-full bg-fuchsia-600 disabled:opacity-50 text-white py-2.5 rounded-full font-medium">
        {cooldown > 0 ? `Aguarde ${cooldown}s` : "Reenviar email"}
      </button>
      {status && <p className="text-sm text-white/60 mt-2">{status}</p>}
    </div>
  );
}
```

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/app/verificar-email/
npm run build
# testa: /verificar-email sem token → mostra reenvio; com token_hash válido → sucesso
```

---

#### Task 7 — `src/components/features/auth/CadastroForm.tsx:81` update (successMsg + reenvio) [4min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/components/features/auth/CadastroForm.tsx:33` (editar)

**Diff esperado:**
```diff
-      setSuccessMsg("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
+      setSuccessMsg(`Conta criada! Enviamos email para ${data.email} — verifique spam. Link expira em 1h.`);
+      // guarda email para reenvio
```
- Adicionar estado `const [emailEnviado, setEmailEnviado] = useState<string | null>(null);`
- No sucesso sem session: `setEmailEnviado(data.email);`
- Render abaixo de `successMsg`:
```tsx
{emailEnviado && (
  <div className="mt-3 flex flex-col gap-2">
    <button type="button" onClick={async () => { /* fetch /api/auth/resend com cooldown local */ }} className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
      Reenviar email
    </button>
    <Link href={`/verificar-email?email=${encodeURIComponent(emailEnviado)}`} className="text-sm text-white/60 text-center">
      Já recebeu? Verificar status
    </Link>
  </div>
)}
```
- Em `options` do `signUp` adicionar `emailRedirectTo: ${process.env.NEXT_PUBLIC_APP_URL}/verificar-email` (se usa hook, Supabase já envia redirect_to, mas garantir).

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/components/features/auth/CadastroForm.tsx
npm run build
# fluxo: cadastro novo email → vê msg com email + botão reenviar
```

---

#### Task 8 — `src/middleware.ts` (bloqueia /painel/* se !email_confirmed_at) [4min]

**Arquivo:** `F:/Projetos/meu-projeto/PressLink/src/middleware.ts` (novo, na raiz ou src/)

**Código:**
```ts
// src/middleware.ts — protege /painel/* exigindo email verificado (Alternativa A)
// Se user existe mas email_confirmed_at == null → redirect /verificar-email?reason=unverified
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/painel")) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  // Supabase user.email_confirmed_at null → não verificado
  // @ts-ignore — campo existe em User
  if (!user.email_confirmed_at) {
    const url = new URL("/verificar-email", req.url);
    url.searchParams.set("reason", "unverified");
    url.searchParams.set("email", user.email || "");
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = { matcher: ["/painel/:path*"] };
```

> Se usar `src/middleware.ts` (Next 15) funciona igual. Testar ambos paths se build reclamar.

**Verificação:**
```bash
npx tsc --noEmit; npx eslint src/middleware.ts
npm run build
# teste: usuário não verificado tenta /painel → redirect /verificar-email?reason=unverified
# usuário verificado → passa
```

---

### Chunk Testes (Tasks 9-10)

#### Task 9 — Validadores + smoke manual (pirâmide base) [3min]

**Arquivos:** já criados em Task 2, só verifica.

**Testes unitários (opcional, sem vitest ainda):**
- Criar `src/lib/validators/verificacao.test.ts` se quiser vitest (igual Estudos-Automacao), mas aqui smoke manual basta.
- Caso queira instalar: `npm install -D vitest` + `npx vitest run src/lib/validators/verificacao.test.ts`

**Smoke manual:**
```bash
# 1. Hook sem secret (dev sem secret deve passar)
curl -X POST http://localhost:3000/api/auth/supabase-hook -H "Content-Type: application/json" -d "{\"user\":{\"id\":\"1\",\"email\":\"a@b.com\"},\"email_data\":{\"token_hash\":\"abc\",\"redirect_to\":\"http://localhost:3000/verificar-email\",\"email_action_type\":\"signup\",\"site_url\":\"http://localhost:3000\"}}"
# 2. Reenvio rate limit
for i in 1 2 3; do curl -s -X POST http://localhost:3000/api/auth/resend -H "Content-Type: application/json" -d "{\"email\":\"test@exemplo.com\"}" | cat; done
# espera 429 no 2º imediato
```

**Verificação:** `npx tsc --noEmit` 0 erros.

---

#### Task 10 — Build final + docs + wiki/log [3min]

**Verificação final (igual 02-projetos/PressLink.md:61 — 7/7 builds):**
```bash
npx eslint . --max-warnings 0
npx tsc --noEmit
npm run build
# todos devem ser 0/v
```

**Docs:**
- Atualizar `F:/Projetos/meu-projeto/PressLink/README.md` ou `docs/plans/2026-09-18-resend-verificacao.md` já é o plano
- Adicionar entry em `F:/BrainSecondary/wiki/log.md:1`:
```md
## [2026-09-18] PressLink Resend verificação (Alternativa A Hook) — plano 10 tasks
- Hook + Resend + React Email + middleware /painel
```

- Atualizar `F:/BrainSecondary/02-projetos/PressLink.md:74` — adicionar `#33 Resend Verificação` ou `#7.1` como "Em progresso — paralelo #13"

**Critério aceite TCC:**
- `npm run build` ✓
- `npx tsc --noEmit` 0
- `npx eslint .` 0
- Hook testado via curl com `onboarding@resend.dev`
- `/verificar-email?token_hash=xxx` verifica via `verifyOtp` e mostra sucesso
- `/painel` bloqueia não-verificados

---

## Ordem execução (não bloqueia #13)

1. Task 1 → 2 → 5 (deps + template) — pode fazer em paralelo com #13 Galeria
2. Task 3 → 4 (API hooks) — core
3. Task 6 → 7 → 8 (UI + middleware)
4. Task 9 → 10 (testes + build verde)

**Estimativa:** 35min total. PR único `feature/resend-verificacao` ou 2 PRs: `PR-A (Task1-5 API+Email)` + `PR-B (Task6-8 UI+middleware)`.

---

## Riscos e mitigação (ice LGPD)

- **Token replay:** `verifyOtp` é single-use + expira 1h — ok. Não guardar token PII.
- **Resend down:** fallback retorna `skipped: true`, Supabase envia nativo — cadastro não quebra.
- **Logs:** `maskEmail` evita PII em Vercel logs. `ip_hash` não necessário aqui (verificação não é page_view).
- **Rate abuse:** mem 5/dia + 60s cooldown — suficiente TCC. Prod migrar para Upstash Redis se escalar.
- **onboarding@resend.dev limite:** só 1 destinatário teste (dono conta). Para demo banca, adicionar emails dos professores como contatos em Resend.

---

## Próximos passos pós-plano (não parte deste plano)

- [ ] Executar tasks 1→10 (este plano)
- [ ] Ingest `raw/presslink-resend-verificacao-implementado.md` → `wiki/entities/presslink.md`
- [ ] Fase 2 opcional: Alternativa B (custom `verification_tokens`) se banca pedir controle total — só então criar migration `03_verification_tokens.sql`

---

*Plano gerado em conjunto: dry (orquestra) + haxixe (vault) + skank (codebase) + ice (LGPD) — writing-plans — 2026-09-18 — Alternativa A Hook + Resend — AUTORIZO Dimi implícito*
