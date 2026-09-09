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
    <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
          Recuperação de Acesso
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Esqueceu sua senha?<br />
          <span className="text-fuchsia-400">Nós te ajudamos.</span>
        </h1>
        <p className="mt-3 text-sm text-white/65 leading-relaxed">
          Informe seu e-mail e enviaremos as instruções para você recuperar o controle do seu portfólio.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
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
          className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300"
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
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-2"
            >
              E-mail cadastrado
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full group relative flex items-center justify-center gap-2 rounded-full bg-fuchsia-500 py-3.5 px-6 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-ink"
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
            className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 px-6 text-sm font-semibold text-white transition hover:border-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o login</span>
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lembrou da senha? Entrar</span>
        </Link>
      </div>
    </div>
  );
}
