"use client"; // diretiva client — precisa useSearchParams, useState, useEffect, createClient (browser)

// src/app/verificar-email/verificar-client.tsx — Client que consome magic link Supabase
// RF: Resend verificação Alternativa A — /verificar-email?token_hash=xxx&type=signup&email=&next=
// Por que existe: Supabase só verifica token via supabase.auth.verifyOtp no browser (PKCE flow)
// Pirâmide: topo E2E — estados idle/verifying/success/error + expirado/ja_verificado + reenvio 60s
// Orquestra: dry/haxixe/skank/ice — LGPD mask não necessário aqui, mas não loga token

import { useEffect, useState } from "react"; // estados + efeito colateral verifyOtp
import Link from "next/link"; // navegação client-side Next
import { useRouter, useSearchParams } from "next/navigation"; // router para redirect + searchParams para token_hash/type/next/email
import { createClient } from "@/lib/supabase/client"; // client browser — createBrowserClient com anon key

// Estados da verificação — idle (sem token), verifying (chamando verifyOtp), success, error, expirado, ja_verificado
type State = "idle" | "verifying" | "success" | "error" | "expired" | "already_verified";

// Componente principal — lê query via useSearchParams, chama verifyOtp, renderiza por estado
export function VerificarEmailClient() {
  const router = useRouter(); // para redirect após sucesso (ex: /login?verified=1 ou ?next=)
  const searchParams = useSearchParams(); // lê ?token_hash&type&email&next&reason
  const tokenHash = searchParams.get("token_hash"); // hash gerado por Supabase hook (email_data.token_hash)
  const type = searchParams.get("type"); // tipo Supabase — esperado "signup" (confirm cadastro)
  const next = searchParams.get("next"); // destino opcional pós-verificação (ex: /painel) — sanitizado
  const email = searchParams.get("email"); // email do usuário — para reenvio e exibição
  const reason = searchParams.get("reason"); // motivo vindo do middleware (unverified)

  const [state, setState] = useState<State>("idle"); // estado atual da verificação
  const [msg, setMsg] = useState(""); // mensagem detalhada para erro/expirado

  // Efeito — verifica OTP assim que token_hash disponível
  useEffect(() => {
    // Se veio do middleware por não verificado → mostra idle com instrução de reenvio (não tenta verify)
    if (reason === "unverified") {
      setState("idle"); // idle com msg de bloqueado
      setMsg(
        email
          ? `Seu email ${email} ainda não foi verificado. Clique no link do email ou reenvie.`
          : "Seu email ainda não foi verificado. Verifique sua caixa de entrada.",
      );
      return;
    }

    // Sem token_hash ou type !== signup → sem verificação automática, mostra instrução + reenvio
    if (!tokenHash || type !== "signup") {
      setState("idle"); // idle — usuário abriu /verificar-email direto ou link inválido
      setMsg(
        email
          ? `Enviamos email para ${email}. Clique no link ou reenvie abaixo.`
          : "Link inválido ou expirado. Verifique seu email ou solicite reenvio.",
      );
      return;
    }

    // Tem token → inicia verificação
    setState("verifying"); // feedback visual "Verificando..."
    const supabase = createClient(); // cria client browser (precisa NEXT_PUBLIC_ env)
    // verifyOtp — Supabase valida token_hash single-use + expira 1h (3600s)
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: "signup" as const })
      .then(({ error }) => {
        if (!error) {
          setState("success"); // sucesso — email_confirmed_at preenchido
          // Redirect automático após 1.5s para login com flag verified=1 (ou next se fornecido)
          const dest = next && next.startsWith("/") ? next : "/login?verified=1";
          setTimeout(() => router.push(dest), 1500);
          return;
        }
        // Trata erro — mapeia mensagens Supabase para estados UX
        const m = error.message.toLowerCase(); // normaliza para match case-insensitive
        if (m.includes("expired") || m.includes("invalid") || m.includes("token")) {
          setState("expired"); // link expirou (1h) ou token inválido (já usado)
          setMsg(error.message); // exibe msg original para debug
        } else if (m.includes("already") || m.includes("confirmed") || m.includes("verified")) {
          setState("already_verified"); // já verificado — idempotente, permite login
        } else {
          setState("error"); // erro genérico (ex: network)
          setMsg(error.message);
        }
      });
  }, [tokenHash, type, email, next, reason, router]); // deps — reexecuta se query mudar

  // Estado verifying — spinner/texto simples (evita layout shift)
  if (state === "verifying")
    return <p className="text-white text-center text-sm animate-pulse">Verificando seu email...</p>;

  // Estado success — email confirmado, redirect para /login?verified=1
  if (state === "success")
    return (
      <div className="text-center">
        {/* Título sucesso — verde suave + ícone implícito */}
        <h1 className="text-xl font-semibold text-white">Email verificado!</h1>
        <p className="text-white/60 text-sm mt-2">Agora você pode acessar o painel.</p>
        {/* CTA — fuchsia-600 consistente com Button do design-system */}
        <Link
          href={next && next.startsWith("/") ? next : "/login?verified=1"}
          className="mt-4 inline-flex bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
        >
          Ir para login
        </Link>
        <p className="text-white/40 text-xs mt-3">Redirecionando automaticamente...</p>
      </div>
    );

  // Estado already_verified — idempotente, usuário já confirmou antes
  if (state === "already_verified")
    return (
      <div className="text-center">
        <h1 className="text-white font-semibold">Já verificado</h1>
        <p className="text-white/60 text-sm mt-2">Seu email já foi confirmado. Faça login.</p>
        <Link href="/login" className="mt-4 inline-flex bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-full font-medium text-sm">
          Fazer login
        </Link>
      </div>
    );

  // Estado expired — link de 1h expirou, oferece reenvio
  if (state === "expired")
    return (
      <div className="text-center">
        <h1 className="text-white font-semibold">Link expirado</h1>
        <p className="text-white/60 text-sm mt-2">{msg || "O link expirou (1 hora). Solicite um novo."}</p>
        <ReenviarForm email={email || undefined} />
        <Link href="/login" className="text-fuchsia-300 text-sm mt-4 inline-block hover:text-fuchsia-200">
          Voltar ao login
        </Link>
      </div>
    );

  // Estado error — erro genérico Supabase
  if (state === "error")
    return (
      <div className="text-center">
        <h1 className="text-white font-semibold">Erro na verificação</h1>
        <p className="text-white/60 text-sm mt-2">{msg || "Não foi possível verificar. Tente novamente."}</p>
        <ReenviarForm email={email || undefined} />
        <Link href="/login" className="text-fuchsia-300 text-sm mt-4 inline-block hover:text-fuchsia-200">
          Voltar ao login
        </Link>
      </div>
    );

  // Estado idle — sem token ou reason=unverified → mostra instrução + reenvio
  return (
    <div className="text-center">
      <h1 className="text-white font-semibold">Verifique seu email</h1>
      <p className="text-white/60 text-sm mt-2">{msg || "Enviamos um link para seu email. Clique para confirmar."}</p>
      <ReenviarForm email={email || undefined} />
      <Link href="/login" className="text-fuchsia-300 text-sm mt-4 inline-block hover:text-fuchsia-200">
        Voltar ao login
      </Link>
    </div>
  );
}

// Subcomponente ReenviarForm — botão com cooldown 60s, chama POST /api/auth/resend
function ReenviarForm({ email }: { email?: string }) {
  const [cooldown, setCooldown] = useState(0); // segundos restantes até liberar novo envio
  const [status, setStatus] = useState(""); // mensagem toast inline (sucesso/erro)
  const [inputEmail, setInputEmail] = useState(email || ""); // email editável se não veio na query

  // Sincroniza input quando email da query muda (ex: middleware injeta ?email=)
  useEffect(() => {
    if (email) setInputEmail(email);
  }, [email]);

  // Timer — decrementa cooldown a cada 1s
  useEffect(() => {
    if (cooldown <= 0) return; // sem cooldown, não cria timer
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000); // tick 1s
    return () => clearTimeout(t); // cleanup evita leak se desmontar
  }, [cooldown]);

  // Handler reenvio — POST /api/auth/resend com cooldown local + rate 5/dia no server
  async function handleReenviar() {
    if (!inputEmail) {
      setStatus("Informe o email usado no cadastro"); // validação client mínima
      return;
    }
    setStatus("Enviando..."); // feedback otimista
    try {
      const r = await fetch("/api/auth/resend", {
        method: "POST", // POST JSON { email }
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail.trim().toLowerCase() }), // normaliza
      });
      const j = await r.json(); // parse resposta (sempre JSON)
      if (r.ok) {
        // Sucesso — 200 { ok:true } ou alreadyVerified
        if (j.alreadyVerified) {
          setStatus("Email já verificado! Faça login."); // idempotente — não assusta
        } else {
          setStatus("Email reenviado! Verifique sua caixa e spam."); // sucesso padrão
        }
        setCooldown(60); // cooldown local 60s — evita flood clique (espelha server COOLDOWN_MS)
      } else {
        // Erro — 400/429 com { error, retryAfter }
        setStatus(j.error || "Erro ao reenviar. Tente novamente."); // msg server
        if (j.retryAfter) setCooldown(j.retryAfter); // server informa segundos restantes (rate limit)
      }
    } catch {
      setStatus("Erro de rede. Tente novamente."); // fetch throw (offline)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Input email — só mostra se não veio pre-preenchido ou permite editar */}
      {!email && (
        <input
          type="email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
          aria-label="Email para reenvio"
        />
      )}
      {/* Botão reenviar — desabilita durante cooldown */}
      <button
        onClick={handleReenviar}
        disabled={cooldown > 0}
        className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-full font-medium text-sm transition-colors"
      >
        {cooldown > 0 ? `Aguarde ${cooldown}s` : "Reenviar email"}
      </button>
      {/* Status toast inline — aria-live para leitores de tela */}
      {status && (
        <p role="status" aria-live="polite" className="text-sm text-white/60 text-center">
          {status}
        </p>
      )}
    </div>
  );
}
