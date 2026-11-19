"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { PublicacaoStatus, type RequisitoPublicacao } from "./PublicacaoStatus";
import { PublicPageLink } from "./PublicPageLink";
import type { PainelPerfil } from "./Sidebar";

const SECTION_LABEL: Record<string, string> = {
  "/painel": "Visão geral",
  "/painel/perfil": "Perfil",
  "/painel/galeria": "Galeria",
  "/painel/musica": "Mídia",
  "/painel/agenda": "Agenda",
  "/painel/template": "Aparência",
  "/painel/contato": "Contato público",
  "/painel/estatisticas": "Estatísticas",
  "/painel/configuracoes": "Conta",
};

function rotuloDaRota(pathname: string): string {
  if (SECTION_LABEL[pathname]) return SECTION_LABEL[pathname];
  const chave = Object.keys(SECTION_LABEL)
    .filter((rota) => rota !== "/painel" && pathname.startsWith(rota))
    .sort((a, b) => b.length - a.length)[0];
  return chave ? SECTION_LABEL[chave] : "Painel";
}

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
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-panel-line bg-panel-bg px-4 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="truncate text-[13px] font-medium text-white/45">
          {rotuloDaRota(pathname)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PublicPageLink
          username={perfil.username}
          className="hidden h-8 items-center rounded-md px-2.5 text-[12px] font-medium text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80 sm:inline-flex"
        >
          Ver página
        </PublicPageLink>
        <PublicacaoStatus
          initialPublicado={publicado}
          username={perfil.username}
          requisitos={requisitos}
        />
      </div>
    </header>
  );
}
