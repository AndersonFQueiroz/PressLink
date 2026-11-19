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
        <p className="font-display text-lg font-semibold tracking-tight">
          <span className="text-white">press</span>
          <span className="text-brand-soft">link</span>
        </p>

        {state === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-brand-soft" />
            <p className="text-[13px] text-white/50">Confirmando seu e-mail...</p>
          </div>
        )}

        {state === "success" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-[#7ce38b]" />
            <h1 className="font-display text-lg font-semibold tracking-tight text-white">
              E-mail confirmado
            </h1>
            <p className="text-[13px] text-white/45">
              Sua conta já está liberada. Pode voltar para o seu painel.
            </p>
            <Link
              href="/painel"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Ir para o painel
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <XCircle className="h-8 w-8 text-[#ff9a9a]" />
            <h1 className="font-display text-lg font-semibold tracking-tight text-white">
              Link inválido ou expirado
            </h1>
            <p className="text-[13px] text-white/45">
              Peça um novo e-mail de confirmação ou tente fazer login.
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white"
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
          <Loader2 className="h-10 w-10 animate-spin text-brand-soft" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
