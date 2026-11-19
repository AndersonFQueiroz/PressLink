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
      className="mt-6 flex items-start gap-3 rounded-lg border border-ok/25 bg-ok/[0.06] p-4 text-[13px]"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
      <div>
        <p className="font-medium text-ok">Sua conta foi excluída.</p>
        <p className="mt-1 text-ok/75">
          Removemos seu perfil, suas fotos e todo o conteúdo do PressLink. Se quiser
          voltar um dia, é só criar uma conta nova.
        </p>
      </div>
    </div>
  );
}
