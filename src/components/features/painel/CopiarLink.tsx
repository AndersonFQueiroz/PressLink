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
      className="pl-press inline-flex h-8 items-center gap-1.5 rounded border border-panel-line px-3 text-[12px] font-medium text-panel-text transition-[background-color,border-color,transform] hover:border-panel-line-strong hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
    >
      {copiado ? (
        <>
          <Check className="h-3.5 w-3.5 text-signal-soft" aria-hidden="true" />
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
