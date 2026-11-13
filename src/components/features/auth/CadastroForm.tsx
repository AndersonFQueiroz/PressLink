"use client"; // diretiva client — usa hooks (useForm, useState, useRouter) e Supabase browser

import { useEffect, useState } from "react"; // useState para erros/sucesso/cooldown, useEffect para timer reenvio
import { useForm } from "react-hook-form"; // hook de formulário — controla inputs sem re-render excessivo
import { zodResolver } from "@hookform/resolvers/zod"; // integra Zod ao react-hook-form (validação declarativa)
import Link from "next/link"; // navegação client-side Next (sem reload)
import { useRouter } from "next/navigation"; // router App Router — push/refresh após signup com sessão
import { Eye, EyeOff } from "lucide-react"; // ícones olho mágico senha (Luiz)
import { createClient } from "@/lib/supabase/client"; // client browser Supabase — createBrowserClient (anon key)
import { cadastroSchema, type CadastroFormData } from "@/lib/validators/cadastro"; // schema Zod + tipo TS (nome/username/email/senha/aceiteLgpd)
import { Input } from "@/components/ui/Input"; // componente UI Input — label/error/helperText
import { Button } from "@/components/ui/Button"; // componente UI Button — isLoading/size

// CadastroForm — formulário de cadastro com verificação por email (Resend Hook) + merge Luiz
// RF: Task7 resend-verificacao — banner + reenvio cooldown 60s + check-username + Eye toggle
export function CadastroForm() {
  const router = useRouter(); // navega para /painel se já logado (session presente) ou /login
  const [formError, setFormError] = useState<string | null>(null); // erro geral do submit (ex: email duplicado)
  const [successMsg, setSuccessMsg] = useState<string | null>(null); // msg sucesso pós-cadastro sem sessão
  const [showSenha, setShowSenha] = useState(false); // toggle olho mágico (Luiz)
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null); // email que recebeu link — para reenvio e link verificar-email
  const [resendCooldown, setResendCooldown] = useState(0); // cooldown local 60s — evita flood clique (espelha server)
  const [resendStatus, setResendStatus] = useState<string | null>(null); // toast inline do reenvio (sucesso/erro)
  const [isResending, setIsResending] = useState(false); // loading do botão reenviar

  // Timer — decrementa cooldown a cada 1s (UX visual)
  useEffect(() => {
    if (resendCooldown <= 0) return; // sem cooldown não cria timer
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000); // tick 1s
    return () => clearTimeout(t); // cleanup evita leak se desmontar
  }, [resendCooldown]);

  const {
    register, // registra inputs no react-hook-form
    handleSubmit, // envolve onSubmit com validação Zod antes de chamar
    formState: { errors, isSubmitting }, // errors por campo + isSubmitting para loading do botão principal
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema), // validação via Zod — mensagens em PT-BR
    defaultValues: {
      nome: "", // nome artístico
      username: "", // slug único para URL presslink.app/username
      email: "", // email para verificação 1h
      senha: "", // mínimo 8 caracteres (Zod)
      aceiteLgpd: false, // obrigatório — LGPD ice
    },
  });

  // Handler reenvio — chama POST /api/auth/resend com cooldown 60s + rate 5/dia server
  async function handleReenviar() {
    if (!emailEnviado) return; // sem email não reenvia (segurança)
    setIsResending(true); // inicia loading
    setResendStatus(null); // limpa status anterior
    try {
      const r = await fetch("/api/auth/resend", {
        method: "POST", // POST JSON { email }
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEnviado.trim().toLowerCase() }), // normaliza
      });
      const j = await r.json(); // resposta sempre JSON { ok } ou { error, retryAfter }
      if (r.ok) {
        if (j.alreadyVerified) {
          setResendStatus("Email já verificado! Faça login."); // idempotente — não assusta
        } else {
          setResendStatus("Email reenviado! Verifique sua caixa e spam."); // sucesso
        }
        setResendCooldown(60); // ativa cooldown local 60s (espelha COOLDOWN_MS server)
      } else {
        setResendStatus(j.error || "Erro ao reenviar. Tente novamente."); // msg server (429 inclui retryAfter)
        if (j.retryAfter) setResendCooldown(j.retryAfter); // server informa segundos restantes
      }
    } catch {
      setResendStatus("Erro de rede. Tente novamente."); // fetch throw offline
    } finally {
      setIsResending(false); // finaliza loading
    }
  }

  const onSubmit = async (data: CadastroFormData) => {
    setFormError(null); // limpa erro anterior
    setSuccessMsg(null); // limpa sucesso anterior
    setEmailEnviado(null); // limpa email anterior (nova tentativa)
    setResendStatus(null); // limpa toast reenvio

    // 0. Check username prévio (Luiz) — evita tentativa signUp com username duplicado
    try {
      const checkRes = await fetch(`/api/perfil/check-username?username=${encodeURIComponent(data.username.toLowerCase().trim())}`);
      const checkData = await checkRes.json();
      if (!checkData.available) {
        setFormError("Username já está em uso. Escolha outro.");
        return;
      }
    } catch {
      // Se a verificação falhar, segue o fluxo e o servidor valida novamente.
    }

    const supabase = createClient(); // client browser — precisa NEXT_PUBLIC_ env setado

    // 1. Cria usuário via Supabase Auth — envia email se confirmação habilitada (merge: window.origin + /verificar-email)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email, // email destino — Supabase gera token_hash 1h
      password: data.senha, // senha — Supabase hashea com bcrypt
      options: {
        data: { nome: data.nome }, // user_metadata — usado no template VerificationEmail
        // Leva o link para /verificar-email no domínio atual (merge Luiz window.origin + Muginski path)
        emailRedirectTo: `${window.location.origin}/verificar-email`,
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase(); // normaliza para match
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
        setFormError("Este e-mail já está cadastrado. Tente fazer login."); // 409 UX amigável
      } else {
        setFormError(signUpError.message); // outro erro Supabase
      }
      return;
    }

    const userId = signUpData.user?.id; // id gerado pelo Supabase
    if (!userId) {
      setFormError("Não foi possível criar a conta. Tente novamente."); // guarda — sem user não cria perfil
      return;
    }

    // 2/3. Pós-cadastro — se tem session (email confirmação desabilitado) cria perfil e vai para painel
    // Sem sessão o RLS impede insert: perfil será criado no primeiro salvamento logado (mas mantemos banner resend)
    if (signUpData.session) {
      const { error: perfilError } = await supabase.from("perfil").insert({
        usuario_id: userId, // FK para auth.users.id
        username: data.username, // slug único — 23505 se duplicado
        nome_artistico: data.nome, // nome exibido no EPK
      });

      if (perfilError) {
        if (perfilError.code === "23505" || perfilError.message.includes("duplicate")) {
          setFormError("Username já está em uso. Escolha outro."); // erro de unicidade
        } else {
          setFormError(`Conta criada, mas erro ao criar perfil: ${perfilError.message}`);
        }
        return;
      }

      router.push("/painel"); // logado direto
      router.refresh(); // força revalidação cookies
    } else {
      // Sem session — email de verificação enviado (hook Resend ou SMTP fallback), mostra banner + reenvio
      setSuccessMsg(`Conta criada! Enviamos email para ${data.email} — verifique sua caixa e spam. Link expira em 1 hora.`);
      setEmailEnviado(data.email); // guarda para botão reenviar e link verificar-email
      setResendCooldown(0); // sem cooldown inicial
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full flex flex-col gap-4">
      <Input
        label="Nome"
        placeholder="Seu nome"
        autoComplete="name"
        error={errors.nome?.message}
        {...register("nome")}
      />
      <Input
        label="Username"
        placeholder="seu-username"
        autoComplete="username"
        helperText="Será sua URL: presslink.app/seu-username"
        error={errors.username?.message}
        {...register("username")}
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Senha"
        type={showSenha ? "text" : "password"}
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        error={errors.senha?.message}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowSenha((v) => !v)}
            aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showSenha}
            className="flex items-center text-white/40 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 rounded"
          >
            {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...register("senha")}
      />

      <label className="flex items-start gap-2.5 text-sm leading-snug cursor-pointer select-none">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.04] text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0"
          {...register("aceiteLgpd")}
        />
        <span className="text-white/70">
          Li e aceito os{" "}
          <Link href="/termos" target="_blank" className="text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-2">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-fuchsia-300 hover:text-fuchsia-200 underline underline-offset-2">
            Política de Privacidade
          </Link>{" "}
          (LGPD).
        </span>
      </label>
      {errors.aceiteLgpd && <p className="text-xs text-rose-400 -mt-2">{errors.aceiteLgpd.message}</p>}

      {formError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3.5 py-2.5 text-sm text-rose-200">
          {formError}
        </div>
      )}
      {successMsg && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2.5 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}
      {/* Banner reenvio — só após sucesso sem sessão (Task7) */}
      {emailEnviado && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleReenviar}
            disabled={resendCooldown > 0 || isResending}
            className="text-sm font-medium text-fuchsia-300 hover:text-fuchsia-200 disabled:opacity-50 disabled:cursor-not-allowed text-center py-2 rounded-full border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition-colors"
          >
            {isResending ? "Enviando..." : resendCooldown > 0 ? `Aguarde ${resendCooldown}s` : "Reenviar email"}
          </button>
          {resendStatus && (
            <p role="status" aria-live="polite" className="text-xs text-white/60 text-center">
              {resendStatus}
            </p>
          )}
          <Link
            href={`/verificar-email?email=${encodeURIComponent(emailEnviado)}`}
            className="text-sm text-white/60 hover:text-white/80 text-center underline underline-offset-2"
          >
            Já recebeu? Verificar status
          </Link>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full mt-1" isLoading={isSubmitting}>
        Criar conta
      </Button>

      <p className="text-center text-sm text-white/60">
        Já tem conta?{" "}
        <Link href="/login" className="text-fuchsia-300 hover:text-fuchsia-200 font-medium">
          Faça login
        </Link>
      </p>
    </form>
  );
}
