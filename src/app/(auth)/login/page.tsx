"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validators/auth";
import { loginAction } from "@/lib/auth/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const registeredSuccess = searchParams.get("registered") === "true";
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "auth-callback-failed"
      ? "O link de autenticação expirou ou é inválido. Tente novamente."
      : null,
  );
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
    startTransition(async () => {
      const result = await loginAction(data);
      if (result && !result.success) {
        setErrorMessage(result.error || "Ocorreu um erro ao realizar login.");
      }
    });
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
          Acesso ao Painel
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          A pista é sua.<br />
          <span className="text-fuchsia-400">Entre na sua conta.</span>
        </h1>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Gerencie seu portfólio, links e shows em um só lugar.
        </p>
      </div>

      {resetSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <span>Sua senha foi redefinida com sucesso! Faça login com a nova senha.</span>
        </div>
      )}

      {registeredSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <span>Conta criada com sucesso! Faça login para começar a montar seu portfólio.</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2"
          >
            E-mail
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              placeholder="dj@exemplo.com"
              {...register("email")}
              className={`w-full rounded-2xl bg-white/[0.04] border pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${
                errors.email
                  ? "border-rose-500/70 focus:border-rose-500"
                  : "border-white/10 hover:border-white/20 focus:border-fuchsia-400"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70"
            >
              Senha
            </label>
            <Link
              href="/recuperar-senha"
              className="text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300 transition"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-2xl bg-white/[0.04] border pl-11 pr-12 py-3 text-sm text-white placeholder-white/25 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${
                errors.password
                  ? "border-rose-500/70 focus:border-rose-500"
                  : "border-white/10 hover:border-white/20 focus:border-fuchsia-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white transition focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full group relative flex items-center justify-center gap-2 rounded-full bg-fuchsia-500 py-3.5 px-6 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-ink"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer link to register */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-white/60 mb-3">Ainda não tem um portfólio?</p>
        <Link
          href="/cadastro"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/50"
        >
          Criar meu PressLink
        </Link>
      </div>

      {/* Highlights */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/45">
        <span>✦ Portfólio em minutos</span>
        <span>✦ Links e agenda</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
