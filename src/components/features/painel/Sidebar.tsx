"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { PressLinkLogo } from "@/components/brand/PressLinkLogo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Images,
  Music,
  Calendar,
  Mail,
  Palette,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive } from "@/lib/nav";
import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { AVATAR_UPDATED_EVENT } from "@/components/features/painel/AvatarUpload";

export type PainelPerfil = {
  nome: string;
  username: string | null;
  fotoUrl: string | null;
  email: string | null;
};

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
  perfil: PainelPerfil;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

// Três grupos em vez de nove itens soltos: o DJ pensa em "o que o público vê"
// (Conteúdo/Página) e "o que eu ganho com isso" (Resultados).
const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/painel", label: "Visão geral", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/painel/perfil", label: "Perfil", icon: User },
      { href: "/painel/galeria", label: "Galeria", icon: Images },
      { href: "/painel/musica", label: "Mídia", icon: Music },
      { href: "/painel/agenda", label: "Agenda", icon: Calendar },
    ],
  },
  {
    label: "Página",
    items: [
      { href: "/painel/template", label: "Aparência", icon: Palette },
      { href: "/painel/contato", label: "Contato público", icon: Mail },
    ],
  },
  {
    label: "Resultados",
    items: [{ href: "/painel/estatisticas", label: "Estatísticas", icon: BarChart3 }],
  },
];

export function Sidebar({ open, onClose, perfil }: SidebarProps) {
  const pathname = usePathname();
  const [fotoUrl, setFotoUrl] = useState<string | null>(perfil.fotoUrl);

  useEffect(() => {
    setFotoUrl(perfil.fotoUrl);
  }, [perfil.fotoUrl]);

  useEffect(() => {
    const onAvatar = (e: Event) => {
      const detail = (e as CustomEvent<{ foto_url: string }>).detail;
      setFotoUrl(detail?.foto_url || null);
    };
    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatar);
    return () => window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatar);
  }, []);

  const initials = (perfil.nome || perfil.email || "P").slice(0, 2).toUpperCase();
  const subtitle = perfil.username ? `@${perfil.username}` : perfil.email ?? "Sem @username";

  return (
    <>
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-panel-bg transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <Link
            href="/painel"
            onClick={onClose}
            aria-label="PressLink — Visão geral"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 focus-visible:ring-offset-4 focus-visible:ring-offset-panel-bg"
          >
            <PressLinkLogo size={21} />
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-panel-muted transition-colors hover:bg-white/[0.06] hover:text-panel-text md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Navegação do painel">
          {NAV_GROUPS.map((grupo, indice) => (
            <div key={grupo.label ?? `grupo-${indice}`} className={cn(indice > 0 && "mt-5")}>
              {grupo.label && (
                <p className="px-2.5 pb-1.5 text-[11px] font-normal text-panel-muted">
                  {grupo.label}
                </p>
              )}
              <ul className="pl-stagger flex flex-col gap-0.5">
                {grupo.items.map((item, indiceItem) => {
                  const active = isNavActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <li key={item.href} style={{ "--pl-i": indiceItem } as CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60",
                          active
                            ? "bg-white/[0.05] text-panel-text"
                            : "text-panel-muted hover:bg-white/[0.03] hover:text-panel-text",
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="pl-rail absolute left-0 top-1/2 h-4 w-[2px] rounded-r bg-signal"
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:scale-110",
                            active
                              ? "text-panel-text"
                              : "text-panel-muted/80 group-hover:text-panel-text",
                          )}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="truncate transition-transform duration-200 group-hover:translate-x-0.5">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-panel-line p-2">
          <div className="flex items-center gap-2">
            <Link
              href="/painel/configuracoes"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded p-1.5 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
              title="Conta e configurações"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-panel-line bg-panel-raised text-[10px] font-semibold text-panel-text">
                {fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-panel-text">
                  {perfil.nome || "Sua conta"}
                </span>
                <span className="block truncate text-[11px] text-panel-muted">{subtitle}</span>
              </span>
              <Settings className="h-3.5 w-3.5 shrink-0 text-panel-muted/70" aria-hidden="true" />
            </Link>
            <LogoutButton
              variant="ghost"
              showText={false}
              className="h-7 w-7 shrink-0 rounded px-0 text-panel-muted hover:text-panel-text"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
