"use client";

import { useEffect, useState } from "react";
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
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/features/auth/LogoutButton";

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
  const [displayName, setDisplayName] = useState("Visitante");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!active || !user) return;
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const metaName =
          (typeof meta?.full_name === "string" && meta.full_name) ||
          (typeof meta?.name === "string" && meta.name) ||
          (typeof meta?.display_name === "string" && meta.display_name) ||
          "";
        const fallback = user.email?.split("@")[0] ?? "Visitante";
        const name = metaName.trim() !== "" ? metaName.trim() : fallback;
        setDisplayName(name);
        setUserEmail(user.email ?? null);
      } catch {
        // Sem Supabase configurado ou deslogado: mantém "Visitante"
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const initials = displayName.slice(0, 2).toUpperCase();

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

        <div className="border-t border-white/10 p-4 flex flex-col gap-3">
          <Link
            href="/preview"
            target="_blank"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Eye className="h-4 w-4 text-fuchsia-300" />
            Ver página
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{displayName}</p>
              <p className="truncate text-xs text-white/50">{userEmail ?? "Acesso demonstração"}</p>
            </div>
            <LogoutButton variant="ghost" showText={false} className="h-8 w-8 shrink-0 rounded-lg px-0" />
          </div>

          <p className="text-xs text-white/40">PressLink • Painel</p>
        </div>
      </aside>
    </>
  );
}
