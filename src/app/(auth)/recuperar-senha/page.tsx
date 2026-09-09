"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import {
  recuperarSenhaSchema,
  type RecuperarSenhaFormData,
} from "@/lib/validators/auth";
import { recuperarSenhaAction } from "@/lib/auth/actions";

export default function RecuperarSenhaPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarSenhaFormData>({
    resolver: zodResolver(recuperarSenhaSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: RecuperarSenhaFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await recuperarSenhaAction(data);
      if (result.success) {
        setSuccessMessage(
          result.message ||
            "Instruções para redefinição enviadas para o seu e-mail.",
        );
      } else {
        setErrorMessage(
          result.error || "Ocorreu um erro ao solicitar a recuperação de senha.",
        );
      }
    });
  };

  return (
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-8 shadow-2xl backdrop-blur-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
          Recuperar senha
        </h1>
        <p className="text-sm text-zinc-400">
          Informe seu e-mail cadastrado e enviaremos um link para você redefinir
          sua senha.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-200">E-mail enviado!</p>
            <p className="mt-1 text-xs text-emerald-300/90">{successMessage}</p>
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

      {!successMessage ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
            >
              E-mail cadastrado
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full group relative flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando link...</span>
              </>
            ) : (
              <>
                <span>Enviar link de recuperação</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 py-2.5 px-4 text-sm font-medium text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o login</span>
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o login</span>
        </Link>
      </div>
    </div>
  );
}
