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
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-8 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-zinc-400">
          Entre na sua conta para gerenciar seu portfólio de DJ
        </p>
      </div>

      {resetSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <span>Sua senha foi redefinida com sucesso. Faça login com a nova senha.</span>
        </div>
      )}

      {registeredSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <span>Conta criada com sucesso! Faça login para começar.</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm text-rose-300"
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
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
          >
            E-mail
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              placeholder="dj@exemplo.com"
              {...register("email")}
              className={`w-full rounded-lg bg-zinc-950/70 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-zinc-800 hover:border-zinc-700 focus:border-purple-500"
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
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Senha
            </label>
            <Link
              href="/recuperar-senha"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isPending}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-lg bg-zinc-950/70 border pl-10 pr-11 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-zinc-800 hover:border-zinc-700 focus:border-purple-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
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
          className="w-full group relative flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer link to register */}
      <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-400">
        <span>Não tem uma conta? </span>
        <Link
          href="/cadastro"
          className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Crie seu portfólio grátis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
