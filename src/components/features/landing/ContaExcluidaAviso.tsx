"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

/**
 * Aviso de conta excluída na landing (issue #29).
 *
 * Lê `?conta=excluida` (destino do redirect de DELETE /api/conta) e precisa
 * ficar dentro de um `<Suspense>` na página para a `/` continuar estática/ISR.
 */
export function ContaExcluidaAviso() {
  const searchParams = useSearchParams();

  if (searchParams.get("conta") !== "excluida") return null;

  return (
    <div
      role="status"
      className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
      <div>
        <p className="font-semibold text-emerald-100">Sua conta foi excluída.</p>
        <p className="mt-1 text-emerald-200/85">
          Removemos seu perfil, suas fotos e todo o conteúdo do PressLink. Se quiser
          voltar um dia, é só criar uma conta nova.
        </p>
      </div>
    </div>
  );
}
