import Link from "next/link";
import type { ReactNode } from "react";

import { PressLinkLogo } from "@/components/brand/PressLinkLogo";
import { LEGAL_ATUALIZADO_EM, LEGAL_ATUALIZADO_ISO } from "@/lib/legal";

/**
 * Moldura das páginas legais (Termos de Uso e Política de Privacidade).
 *
 * Texto longo, leitura confortável e a mesma linguagem visual do produto:
 * fundo `ink`, títulos na fonte da marca e corpo em `panel-muted` (9,6:1).
 */
export function LegalPage({
  titulo,
  resumo,
  children,
}: {
  titulo: string;
  resumo: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-panel-text">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-panel-raised focus:px-3 focus:py-2 focus:text-[13px]"
      >
        Ir para o conteúdo
      </a>

      <header className="border-b border-panel-line">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="PressLink — início" className="shrink-0">
            <PressLinkLogo size={16} />
          </Link>
          <Link
            href="/"
            className="text-[12px] text-panel-muted transition-colors hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
          >
            Voltar ao site
          </Link>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-panel-muted">
          Atualizado em{" "}
          <time dateTime={LEGAL_ATUALIZADO_ISO}>{LEGAL_ATUALIZADO_EM}</time>
        </p>
        <h1 className="mt-2 font-serif text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">
          {titulo}
        </h1>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-panel-muted">{resumo}</p>

        <div
          className="mt-9 flex flex-col gap-5 text-[13.5px] leading-relaxed text-panel-muted
            [&_a]:text-signal-soft [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-signal-soft/80
            [&_h2]:mt-3 [&_h2]:font-serif [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-panel-text
            [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-panel-text
            [&_ul]:list-disc [&_ul]:pl-5"
        >
          {children}
        </div>
      </main>

      <footer className="border-t border-panel-line">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-5 py-6 text-[12px] text-panel-muted sm:flex-row sm:items-center sm:justify-between">
          <span>PressLink — press kit digital para DJs.</span>
          <nav aria-label="Documentos legais" className="flex items-center gap-4">
            <Link href="/termos" className="transition-colors hover:text-panel-text">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="transition-colors hover:text-panel-text">
              Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
