"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ConfirmState = "loading" | "success" | "error";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmState>("loading");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    let active = true;
    (async () => {
      const code = searchParams.get("code");
      if (!code) {
        if (active) setState("error");
        return;
      }
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          if (active) setState("success");
          return;
        }
        // Código de uso único pode ter sido consumido antes (pré-visualização
        // do app de e-mail confirma no Supabase mas gasta o código): se já
        // existe sessão, trata como sucesso.
        const { data } = await supabase.auth.getSession();
        if (active) setState(data.session ? "success" : "error");
      } catch {
        if (active) setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-md rounded-xl border border-panel-line bg-panel-surface p-8 text-center">
        <p className="font-serif font-bold text-[22px] leading-tight">
          <span className="text-panel-text">press</span>
          <span className="text-signal-soft">link</span>
        </p>

        {state === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-signal-soft" />
            <p className="text-[13px] text-panel-muted">Confirmando seu e-mail...</p>
          </div>
        )}

        {state === "success" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-ok" />
            <h1 className="font-serif font-bold text-[22px] leading-tight text-panel-text">
              E-mail confirmado
            </h1>
            <p className="text-[13px] text-panel-muted">
              Sua conta já está liberada. Pode voltar para o seu painel.
            </p>
            <Link
              href="/painel"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-signal px-4 text-sm font-semibold text-ink transition-colors hover:bg-signal-hover"
            >
              Ir para o painel
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <XCircle className="h-8 w-8 text-danger" />
            <h1 className="font-serif font-bold text-[22px] leading-tight text-panel-text">
              Link inválido ou expirado
            </h1>
            <p className="text-[13px] text-panel-muted">
              Peça um novo e-mail de confirmação ou tente fazer login.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-panel-line px-4 text-sm font-medium text-panel-text transition-colors hover:bg-white/[0.05] hover:text-panel-text"
            >
              Fazer login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink p-4">
          <Loader2 className="h-10 w-10 animate-spin text-signal-soft" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
