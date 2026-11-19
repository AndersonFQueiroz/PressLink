"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { loginAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";

/**
 * Só esta parte depende de `useSearchParams` (mensagens vindas por querystring).
 * Fica isolada no Suspense para o resto da página — título, formulário e links —
 * sair no HTML estático e aparecer no primeiro paint (LCP baixo no Lighthouse).
 */
function MensagensDaUrl() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const registeredSuccess = searchParams.get("registered") === "true";
  const confirmPending = searchParams.get("confirm") === "pending";
  const callbackFailed = searchParams.get("error") === "auth-callback-failed";

  if (!resetSuccess && !registeredSuccess && !confirmPending && !callbackFailed) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2">
      {callbackFailed && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.08] p-3 text-[13px] text-[#ff9a9a]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>O link de autenticação expirou ou é inválido. Tente novamente.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#7ce38b]/25 bg-[#7ce38b]/[0.08] p-3 text-[13px] text-[#a4edaf]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Sua senha foi redefinida com sucesso! Faça login com a nova senha.</span>
        </div>
      )}

      {registeredSuccess && (
        <div className="flex items-start gap-2.5 rounded-lg border border-[#7ce38b]/25 bg-[#7ce38b]/[0.08] p-3 text-[13px] text-[#a4edaf]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Conta criada com sucesso! Faça login para começar a montar seu portfólio.</span>
        </div>
      )}

      {confirmPending && (
        <div className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-[13px] text-white/70">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" aria-hidden="true" />
          <span>Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login.</span>
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMessage(null);
    // Lido no submit: manter `useSearchParams` aqui tiraria o formulário do HTML
    // estático e ele só apareceria depois da hidratação.
    const redirectTo =
      new URLSearchParams(window.location.search).get("redirectTo") || undefined;

    startTransition(async () => {
      const result = await loginAction(data, redirectTo);
      if (result && !result.success) {
        setErrorMessage(result.error || "Ocorreu um erro ao realizar login.");
      }
    });
  };

  return (
    <>
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.08] p-3 text-[13px] text-[#ff9a9a]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          placeholder="dj@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium tracking-wide text-white/60">
              Senha
            </label>
            <Link
              href="/recuperar-senha"
              className="text-[12px] font-medium text-white/50 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isPending}
            placeholder="••••••••"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                className="rounded text-white/40 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Entrando...</span>
            </>
          ) : (
            <span>Entrar no painel</span>
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-panel-line bg-panel-surface p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
          Entrar na sua conta
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
          Seu portfólio, links e shows continuam onde você deixou.
        </p>
      </div>

      <Suspense fallback={null}>
        <MensagensDaUrl />
      </Suspense>

      <LoginForm />

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-[13px]">
        <span className="text-white/40">Ainda não tem conta?</span>
        <Link
          href="/cadastro"
          className="font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
