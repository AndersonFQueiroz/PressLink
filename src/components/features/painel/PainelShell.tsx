"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Sidebar, type PainelPerfil } from "./Sidebar";
import { PainelTopbar } from "./PainelTopbar";
import type { RequisitoPublicacao } from "./PublicacaoStatus";

export function PainelShell({
  perfil,
  publicado,
  requisitos,
  children,
}: {
  perfil: PainelPerfil;
  publicado: boolean;
  requisitos: RequisitoPublicacao[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-panel-bg text-panel-text">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} perfil={perfil} />
      <div className="md:pl-[248px]">
        <PainelTopbar
          perfil={perfil}
          publicado={publicado}
          requisitos={requisitos}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          className={cn(
            "pl-stage relative min-h-[calc(100dvh-3.5rem)] overflow-hidden",
            pathname !== "/painel" && "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
          )}
        >
          <span aria-hidden="true" className="pl-aura" />
          <div key={pathname} className="pl-enter relative w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
