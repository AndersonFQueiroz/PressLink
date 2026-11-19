"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Send } from "lucide-react";
import {
  recuperarSenhaSchema,
  type RecuperarSenhaFormData,
} from "@/lib/validators/auth";
import { recuperarSenhaAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";

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
    <div className="rounded-lg border border-panel-line bg-panel-surface p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-[30px] leading-tight text-panel-text">
          Esqueceu a senha?
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-panel-muted">
          Informe o e-mail da conta e enviamos um link para você criar uma nova.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-ok/25 bg-ok/[0.08] p-3 text-[13px] text-ok"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">E-mail enviado</p>
            <p className="mt-0.5 text-[12px] text-ok/80">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/25 bg-danger/[0.08] p-3 text-[13px] text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!successMessage ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="E-mail cadastrado"
            id="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            placeholder="dj@exemplo.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-signal px-5 text-sm font-semibold text-ink transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Enviando link...</span>
              </>
            ) : (
              <>
                <span>Enviar link de recuperação</span>
                <Send className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-panel-line px-5 text-sm font-medium text-panel-text transition-colors hover:bg-white/[0.05] hover:text-panel-text"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar para o login</span>
        </Link>
      )}

      <div className="mt-6 border-t border-panel-line pt-5 text-center text-[13px]">
        <Link
          href="/login"
          className="text-panel-muted underline-offset-4 transition-colors hover:text-panel-text hover:underline"
        >
          Lembrou da senha? Entrar
        </Link>
      </div>
    </div>
  );
}
