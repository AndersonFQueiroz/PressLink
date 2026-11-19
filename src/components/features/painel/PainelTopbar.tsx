"use client";

import { Menu, Search } from "lucide-react";
import { CommandPalette, OPEN_PALETTE_EVENT } from "./CommandPalette";
import { PublicacaoStatus, type RequisitoPublicacao } from "./PublicacaoStatus";
import { PublicPageLink } from "./PublicPageLink";
import type { PainelPerfil } from "./Sidebar";

export function PainelTopbar({
  perfil,
  publicado,
  requisitos,
  onMenuClick,
}: {
  perfil: PainelPerfil;
  publicado: boolean;
  requisitos: RequisitoPublicacao[];
  onMenuClick: () => void;
}) {
  return (
    <header className="pl-fade sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-panel-bg px-4 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-panel-muted transition-colors hover:bg-white/[0.06] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        {perfil.username && (
          <span className="hidden truncate text-[12px] text-panel-muted sm:block">
            @{perfil.username}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          aria-label="Buscar telas e ações"
          className="pl-press pl-sheen inline-flex h-8 items-center gap-1.5 rounded border border-panel-line px-2.5 text-[12px] text-panel-muted transition-[background-color,border-color,color,transform] hover:border-panel-line-strong hover:bg-white/[0.04] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Buscar</span>
          <span className="pl-kbd hidden md:inline-flex">Ctrl K</span>
        </button>
        <PublicPageLink
          username={perfil.username}
          className="pl-press hidden h-8 items-center rounded px-2.5 text-[12px] font-medium text-panel-muted transition-[background-color,color,transform] hover:bg-white/[0.05] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 sm:inline-flex"
        >
          Ver página
        </PublicPageLink>
        <PublicacaoStatus
          initialPublicado={publicado}
          username={perfil.username}
          requisitos={requisitos}
        />
      </div>
      <CommandPalette username={perfil.username} />
    </header>
  );
}
