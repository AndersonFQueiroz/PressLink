"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/features/painel/Sidebar";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0a0a0f]/90 px-4 backdrop-blur md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              <span className="text-white">Press</span>
              <span className="text-fuchsia-400">Link</span>
            </span>
            <span className="text-xs text-white/50">Painel</span>
          </div>
        </div>
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
