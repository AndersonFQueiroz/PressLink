"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/lib/validators/auth";
import { redefinirSenhaAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";

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
    <div className="rounded-lg border border-panel-line bg-panel-surface p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-[30px] leading-tight text-panel-text">
          Criar nova senha
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-panel-muted">
          Escolha uma senha nova para voltar a acessar o painel.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-ok/25 bg-ok/[0.08] p-3 text-[13px] text-ok"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">{successMessage}</p>
            <p className="mt-0.5 text-[12px] text-ok/80">
              Redirecionando para o login...
            </p>
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

      {!successMessage && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Nova senha"
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isPending}
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                className="rounded text-panel-muted transition-colors hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />

          <Input
            label="Confirmar nova senha"
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isPending}
            placeholder="Repita a nova senha"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-signal px-5 text-sm font-semibold text-ink transition-colors hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Atualizando senha...</span>
              </>
            ) : (
              <>
                <span>Redefinir senha</span>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
