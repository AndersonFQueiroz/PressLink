"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  Images,
  LayoutDashboard,
  Mail,
  Music,
  Palette,
  Search,
  Settings,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Evento para o botão da topbar abrir a paleta sem compartilhar estado. */
export const OPEN_PALETTE_EVENT = "pl:open-palette";

type Comando = {
  id: string;
  rotulo: string;
  dica?: string;
  grupo: "Ir para" | "Ações";
  icone: typeof LayoutDashboard;
  rodar: () => void;
};

function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function CommandPalette({ username }: { username: string | null }) {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const origemRef = useRef<Element | null>(null);

  const fechar = useCallback(() => {
    setAberta(false);
    setBusca("");
    setAtivo(0);
    if (origemRef.current instanceof HTMLElement) origemRef.current.focus();
  }, []);

  const abrir = useCallback(() => {
    origemRef.current = document.activeElement;
    setAberta(true);
  }, []);

  const comando = useCallback(
    (rodar: () => void) => () => {
      fechar();
      rodar();
    },
    [fechar],
  );

  const urlPublica = useCallback(() => {
    if (!username || typeof window === "undefined") return "";
    return `${window.location.origin}/${username}`;
  }, [username]);

  const comandos = useMemo<Comando[]>(() => {
    const navegar = (href: string) => comando(() => router.push(href));
    const lista: Comando[] = [
      { id: "painel", rotulo: "Visão geral", grupo: "Ir para", icone: LayoutDashboard, rodar: navegar("/painel"), dica: "Painel" },
      { id: "perfil", rotulo: "Perfil", grupo: "Ir para", icone: User, rodar: navegar("/painel/perfil"), dica: "Conteúdo" },
      { id: "galeria", rotulo: "Galeria", grupo: "Ir para", icone: Images, rodar: navegar("/painel/galeria"), dica: "Conteúdo" },
      { id: "musica", rotulo: "Mídia", grupo: "Ir para", icone: Music, rodar: navegar("/painel/musica"), dica: "Conteúdo" },
      { id: "agenda", rotulo: "Agenda", grupo: "Ir para", icone: Calendar, rodar: navegar("/painel/agenda"), dica: "Conteúdo" },
      { id: "template", rotulo: "Aparência", grupo: "Ir para", icone: Palette, rodar: navegar("/painel/template"), dica: "Página" },
      { id: "contato", rotulo: "Contato público", grupo: "Ir para", icone: Mail, rodar: navegar("/painel/contato"), dica: "Página" },
      { id: "estatisticas", rotulo: "Estatísticas", grupo: "Ir para", icone: BarChart3, rodar: navegar("/painel/estatisticas"), dica: "Resultados" },
      { id: "conta", rotulo: "Conta e configurações", grupo: "Ir para", icone: Settings, rodar: navegar("/painel/configuracoes"), dica: "Conta" },
    ];

    if (username) {
      lista.push(
        {
          id: "abrir",
          rotulo: "Abrir página pública",
          grupo: "Ações",
          icone: ExternalLink,
          rodar: comando(() => window.open(`/${username}`, "_blank", "noopener,noreferrer")),
        },
        {
          id: "copiar",
          rotulo: "Copiar link da página",
          grupo: "Ações",
          icone: Copy,
          rodar: comando(() => {
            void navigator.clipboard.writeText(urlPublica());
          }),
        },
      );
    }

    return lista;
  }, [comando, router, urlPublica, username]);

  const filtrados = useMemo(() => {
    const termo = semAcento(busca.trim());
    if (!termo) return comandos;
    return comandos.filter(
      (item) => semAcento(item.rotulo).includes(termo) || semAcento(item.dica ?? "").includes(termo),
    );
  }, [busca, comandos]);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if ((evento.metaKey || evento.ctrlKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        setAberta((atual) => {
          if (atual) return false;
          origemRef.current = document.activeElement;
          return true;
        });
      }
    }

    function aoAbrir() {
      abrir();
    }

    window.addEventListener("keydown", aoTeclar);
    window.addEventListener(OPEN_PALETTE_EVENT, aoAbrir);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener(OPEN_PALETTE_EVENT, aoAbrir);
    };
  }, [abrir]);

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = anterior;
      window.clearTimeout(timer);
    };
  }, [aberta]);

  useEffect(() => {
    setAtivo(0);
  }, [busca]);

  if (!aberta) return null;

  const grupos: Comando["grupo"][] = ["Ir para", "Ações"];

  function aoTeclarNaPaleta(evento: ReactKeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      fechar();
    } else if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setAtivo((atual) => (filtrados.length === 0 ? 0 : (atual + 1) % filtrados.length));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setAtivo((atual) =>
        filtrados.length === 0 ? 0 : (atual - 1 + filtrados.length) % filtrados.length,
      );
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      filtrados[ativo]?.rodar();
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="presentation" onKeyDown={aoTeclarNaPaleta}>
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={fechar}
        className="pl-fade absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca e comandos"
        className="pl-pop relative mx-auto mt-[12vh] w-[min(92vw,560px)] overflow-hidden rounded-xl border border-white/10 bg-[#0b0910]/95 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-4">
          <Search className="h-4 w-4 shrink-0 text-panel-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Ir para uma tela ou executar uma ação…"
            aria-label="Buscar telas e ações"
            className="h-12 flex-1 bg-transparent text-[14px] text-panel-text placeholder:text-panel-muted/70 focus:outline-none"
          />
          <span className="pl-kbd">Esc</span>
        </div>

        <div className="max-h-[min(48vh,340px)] overflow-y-auto p-2">
          {filtrados.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12px] text-panel-muted">
              Nada encontrado para “{busca}”.
            </p>
          ) : (
            grupos.map((grupo) => {
              const itens = filtrados.filter((item) => item.grupo === grupo);
              if (itens.length === 0) return null;
              return (
                <div key={grupo} className="mb-1 last:mb-0">
                  <p className="px-2.5 pb-1 pt-2 text-[10px] font-medium text-panel-muted/80">
                    {grupo}
                  </p>
                  <ul>
                    {itens.map((item) => {
                      const indice = filtrados.indexOf(item);
                      const selecionado = indice === ativo;
                      const Icone = item.icone;
                      return (
                        <li
                          key={item.id}
                          className="pl-pop-item"
                          style={{ "--pl-i": indice } as CSSProperties}
                        >
                          <button
                            type="button"
                            onClick={item.rodar}
                            onMouseEnter={() => setAtivo(indice)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                              selecionado ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                                selecionado
                                  ? "border-signal/30 bg-signal/10 text-signal-soft"
                                  : "border-white/[0.06] bg-white/[0.03] text-panel-muted",
                              )}
                            >
                              <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <span className="flex-1 text-[13px] text-panel-text">
                              {item.rotulo}
                            </span>
                            {item.dica && (
                              <span className="text-[10px] text-panel-muted/70">{item.dica}</span>
                            )}
                            <ArrowRight
                              className={cn(
                                "h-3.5 w-3.5 text-panel-muted transition-opacity",
                                selecionado ? "opacity-100" : "opacity-0",
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-4 py-2 text-[10px] text-panel-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="pl-kbd">↑</span>
            <span className="pl-kbd">↓</span>
            navegar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="pl-kbd">Enter</span>
            abrir
          </span>
        </div>
      </div>
    </div>
  );
}
