"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, LogOut, Menu, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#0a0a0f]/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-semibold text-white">Painel</span>
          <span className="text-xs text-white/50">Gerencie seu portfólio</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/preview"
          target="_blank"
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 text-xs font-medium text-white hover:bg-white/15"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Ver página</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white hover:bg-white/10"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <div className="h-7 w-7 rounded-full bg-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">DJ</div>
            <span className="hidden sm:inline max-w-[120px] truncate text-white/80">DJ Logado</span>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </button>

          {dropdownOpen && (
            <>
              <button
                aria-label="Fechar menu"
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a1f] p-1 shadow-xl">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white">DJ Logado</p>
                  <p className="text-xs text-white/50 truncate">dj@presslink.app</p>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Saindo..." : "Sair"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
