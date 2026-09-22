"use client";

import Link from "next/link";
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

export type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/painel/perfil", label: "Perfil", icon: User },
  { href: "/painel/galeria", label: "Galeria", icon: Images },
  { href: "/painel/musica", label: "Música", icon: Music },
  { href: "/painel/agenda", label: "Agenda", icon: Calendar },
  { href: "/painel/contato", label: "Contato", icon: Mail },
  { href: "/painel/template", label: "Template", icon: Palette },
  { href: "/painel/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#0a0a0f] transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/painel" className="text-lg font-bold tracking-tight" onClick={onClose}>
            <span className="text-white">Press</span>
            <span className="text-fuchsia-400">Link</span>
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-fuchsia-600/20 text-fuchsia-200 border border-fuchsia-500/30"
                        : "text-white/70 hover:bg-white/[0.06] hover:text-white border border-transparent",
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-fuchsia-300" : "text-white/50")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-white/40">PressLink • Painel</p>
        </div>
      </aside>
    </>
  );
}
