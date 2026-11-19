import type { ReactNode } from "react";

/**
 * Cabeçalho único das telas do painel: título + explicação curta + no máximo
 * uma ação primária. A borda inferior separa o contexto do conteúdo sem
 * transformar a página inteira num card.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-panel-line pb-5">
      <div className="min-w-0">
        <h1 className="font-serif text-[27px] leading-tight tracking-tight text-panel-text sm:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-panel-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
