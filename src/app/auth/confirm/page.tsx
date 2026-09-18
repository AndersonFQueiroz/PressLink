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
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-xl font-bold tracking-tight">
          <span className="text-white">Press</span>
          <span className="text-fuchsia-400">Link</span>
        </p>

        {state === "loading" && (
          <div className="mt-6 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
            <p className="text-sm text-white/70">Confirmando seu e-mail...</p>
          </div>
        )}

        {state === "success" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <h1 className="text-lg font-semibold text-white">E-mail confirmado!</h1>
            <p className="text-sm text-white/60">Pode voltar pro seu PressLink, sua conta já está liberada.</p>
            <Link
              href="/painel"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-fuchsia-600 px-4 text-sm font-medium text-white hover:bg-fuchsia-500"
            >
              Ir para o painel
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <XCircle className="h-12 w-12 text-rose-400" />
            <h1 className="text-lg font-semibold text-white">Link inválido ou expirado</h1>
            <p className="text-sm text-white/60">Peça um novo e-mail de confirmação ou tente fazer login.</p>
            <Link
              href="/login"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/15"
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
          <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
