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
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-8 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
          Criar nova senha
        </h1>
        <p className="text-sm text-zinc-400">
          Insira sua nova senha de acesso abaixo.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
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
          className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm text-rose-300"
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
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
            >
              Nova Senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                placeholder="Mínimo 8 caracteres"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isPending}
                placeholder="Repita a nova senha"
                {...register("confirmPassword")}
                className={`w-full rounded-lg bg-zinc-950/70 border pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                  errors.confirmPassword
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-zinc-800 hover:border-zinc-700 focus:border-purple-500"
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
            className="w-full group relative flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
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
