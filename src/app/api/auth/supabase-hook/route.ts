// src/app/api/auth/supabase-hook/route.ts — Supabase Auth Hook → Resend
// Alternativa A: Supabase gera token/url, nós só renderizamos email via Resend.
// Fallback: se RESEND_API_KEY ausente, retorna 200 skipped (Supabase envia nativo) — cadastro não quebra.
// Por que existe: customiza email de verificação com branding PressLink + React Email, mantendo auth.users.email_confirmed_at
// LGPD ice: não loga email completo (maskEmail), não loga token_hash, usa SUPABASE_HOOK_SECRET para autenticar hook
// Pirâmide: topo — integração Supabase->Resend, validado via curl + tsc/eslint (sem DB novo)

import { NextRequest, NextResponse } from "next/server"; // Next.js 15 App Router — request/response tipados
import { getResend, getResendFrom, maskEmail } from "@/lib/resend"; // singleton Resend + helpers server-only
import { VerificationEmail } from "@/emails/VerificationEmail"; // template React Email ink/fuchsia
import { render } from "@react-email/render"; // renderiza JSX para HTML string (compatível com resend.emails.send html)

export const runtime = "nodejs"; // Resend SDK precisa Node runtime, não Edge (crypto/fetch Node)

// Payload que Supabase Hook envia em POST /api/auth/supabase-hook
// Docs Supabase: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
type HookPayload = {
  user: { id: string; email: string; user_metadata?: { nome?: string } }; // dados usuário que acabou de signUp
  email_data: {
    token: string; // token cru (não usar em URL, prefer token_hash)
    token_hash: string; // hash que verifyOtp espera — single-use, expira 1h
    redirect_to: string; // ex: https://app.vercel.app/verificar-email — configurado em Supabase Dashboard
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change"; // tipo de ação — só signup interceptamos
    site_url: string; // NEXT_PUBLIC_APP_URL espelhado
  };
};

// POST — endpoint que Supabase chama a cada email transacional
export async function POST(req: NextRequest) {
  // 1. Verifica secret — Supabase envia header Authorization: Bearer <SUPABASE_HOOK_SECRET>
  // Se secret não configurado (dev sem hook), pula verificação para facilitar teste local
  const secret = process.env.SUPABASE_HOOK_SECRET; // server-only, gerado via openssl rand -hex 32
  if (secret) {
    const auth = req.headers.get("authorization"); // header case-insensitive, Next normaliza
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // 401 sem expor motivo
    }
  }

  // 2. Parse JSON com try/catch — hook pode enviar payload malformado em retry
  let payload: HookPayload;
  try {
    payload = (await req.json()) as HookPayload; // cast após parse, validação leve abaixo
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); // 400 — Supabase não retenta indefinidamente
  }

  // 3. Extrai campos com fallback seguro — evita crash se Supabase mudar shape
  const email = payload?.user?.email; // email destino — obrigatório para Resend
  const tokenHash = payload?.email_data?.token_hash; // hash que /verificar-email consome via verifyOtp
  const redirectTo = payload?.email_data?.redirect_to || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verificar-email`; // base para log/debug, não usada direto na URL final
  void redirectTo; // suprime unused var — mantido para debug futuro (log mask)
  const actionType = payload?.email_data?.email_action_type; // decide se intercepta ou deixa Supabase nativo

  // 4. Só intercepta signup (verificação cadastro) — outros tipos (recovery/email_change) deixam Supabase nativo
  // Por que: Alternativa A foca cadastro; recovery usa fluxo próprio /recuperar-senha já existente
  if (actionType !== "signup") {
    return NextResponse.json({ skipped: true, reason: "not_signup" }); // 200 skipped — não erro, Supabase envia nativo
  }
  if (!email || !tokenHash) {
    return NextResponse.json({ error: "Missing email/token_hash" }, { status: 400 }); // 400 — payload incompleto
  }

  // 5. Monta magic link — /verificar-email?token_hash=xxx&type=signup&email=yyy
  // Por que token_hash: Supabase verifyOtp({token_hash, type}) consome hash, não token cru — single-use + expira 1h
  // Por que incluir email: facilita UX em /verificar-email (mostra destino + reenvio sem digitar)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // base URL — prod Vercel ou localhost
  // Supabase espera que email contenha link com token_hash — geramos URL que /verificar-email consome client-side
  const verificationUrl = `${appUrl}/verificar-email?token_hash=${encodeURIComponent(tokenHash)}&type=signup&email=${encodeURIComponent(email)}`;

  // 6. Fallback Resend — se sem API key, não quebra cadastro, loga warn mascarado e retorna skipped
  // Ice LGPD: maskEmail evita PII em logs Vercel (só ***@dominio)
  const resend = getResend(); // null se RESEND_API_KEY ausente
  if (!resend) {
    console.warn(`[resend] RESEND_API_KEY ausente — fallback SMTP para ${maskEmail(email)}`); // warn, não error
    return NextResponse.json({ skipped: true, reason: "no_api_key" }); // 200 — Supabase tenta SMTP nativo
  }

  // 7. Resolve nome para personalização — user_metadata.nome (definido em CadastroForm) ou prefixo do email
  const nome = payload.user.user_metadata?.nome || email.split("@")[0]; // fallback amigável

  // 8. Renderiza e envia via Resend
  try {
    const html = await render(VerificationEmail({ nome, url: verificationUrl, expiresIn: "1 hora" })); // JSX -> HTML email-safe
    const text = `Olá ${nome}, confirme seu email: ${verificationUrl} (expira em 1 hora). Se não criou conta, ignore.`; // fallback plain text para clients sem HTML

    const { error } = await resend.emails.send({
      from: getResendFrom(), // "PressLink <onboarding@resend.dev>" dev ou domínio verificado prod
      to: email, // destinatário — em dev só dono da conta Resend recebe (limite Resend)
      subject: "Confirme seu email — PressLink", // assunto claro, evita spam filter
      html, // corpo HTML renderizado
      text, // alternativa plain
    });

    // 9. Trata erro Resend — loga e retorna 500 para observabilidade (Supabase pode retentar)
    // Não retorna 200 aqui para não mascarar falha de entrega em prod
    if (error) {
      console.error("[resend] send error", error); // error contém message, não PII
      return NextResponse.json({ error: error.message }, { status: 500 }); // 500 — indica falha transitória
    }

    return NextResponse.json({ ok: true }); // 200 — sucesso, Supabase considera hook entregue
  } catch (e) {
    console.error("[resend] exception", e); // catch para render ou network throw
    return NextResponse.json({ error: "Send failed" }, { status: 500 }); // 500 genérico, sem expor stack
  }
}
