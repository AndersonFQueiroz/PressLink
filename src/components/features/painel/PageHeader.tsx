import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Cabeçalho único das telas do painel: rótulo curto, título na fonte do logo e
 * uma linha de contexto. Sem régua inferior — a separação vem do espaço e dos
 * cards abaixo, não de mais uma linha.
 */
export function PageHeader({
  label,
  title,
  description,
  actions,
  className,
}: {
  /** Rótulo pequeno acima do título (ex.: "Conteúdo", "Resultados"). */
  label?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pl-rise mb-7 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {label && (
          <p className="mb-1.5 text-[11px] font-medium leading-none text-panel-muted">
            {label}
          </p>
        )}
        <h1 className="font-display font-bold text-[28px] leading-[1.08] tracking-[-0.02em] text-panel-text sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-panel-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
