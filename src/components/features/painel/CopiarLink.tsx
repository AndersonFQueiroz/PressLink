"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopiarLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copie o link da sua página:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
    >
      {copiado ? (
        <>
          <Check className="h-3.5 w-3.5 text-brand-soft" aria-hidden="true" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Copiar link
        </>
      )}
    </button>
  );
}
