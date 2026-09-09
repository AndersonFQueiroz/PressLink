"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/lib/validators/auth";
import { redefinirSenhaAction } from "@/lib/auth/actions";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RedefinirSenhaFormData) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await redefinirSenhaAction(data);
      if (result.success) {
        setSuccessMessage(
          result.message || "Sua senha foi redefinida com sucesso!",
        );
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      } else {
        setErrorMessage(
          result.error || "Ocorreu um erro ao tentar redefinir a senha.",
        );
      }
    });
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
          Segurança da Conta
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Criar nova senha.<br />
          <span className="text-fuchsia-400">Proteja seu som.</span>
        </h1>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Defina uma nova senha forte para acessar seu painel no presslink.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-200">{successMessage}</p>
            <p className="mt-1 text-xs text-emerald-300/90">
              Redirecionando para o login...
            </p>
          </div>
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

      {!successMessage && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2"
            >
              Nova Senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                placeholder="Mínimo 8 caracteres"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                placeholder="Repita a nova senha"
                {...register("confirmPassword")}
                className={`w-full rounded-2xl bg-white/[0.04] border pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 transition focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 ${
                  errors.confirmPassword
                    ? "border-rose-500/70 focus:border-rose-500"
                    : "border-white/10 hover:border-white/20 focus:border-fuchsia-400"
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-rose-400 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full group relative flex items-center justify-center gap-2 rounded-full bg-fuchsia-500 py-3.5 px-6 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-ink"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Atualizando senha...</span>
              </>
            ) : (
              <>
                <span>Redefinir senha</span>
                <KeyRound className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
