"use client";

import { useEffect } from "react";

interface PublicPageTrackerProps {
  perfilId: string;
  username: string;
}

export function PublicPageTracker({ perfilId, username }: PublicPageTrackerProps) {
  useEffect(() => {
    // Não rastreia se for demo fixo ou identificador mock
    if (!perfilId || perfilId.startsWith("demo-")) return;

    // Deduplicação básica (issue #25): o mesmo evento só conta uma vez por
    // sessão do navegador. Sem isso, voltar para a página, navegar entre rotas
    // ou o duplo efeito do StrictMode inflavam visualizações e cliques.
    const CHAVE = "presslink:eventos";
    const jaRegistrado = (chave: string): boolean => {
      try {
        const bruto = window.sessionStorage.getItem(CHAVE);
        const mapa: Record<string, boolean> = bruto ? JSON.parse(bruto) : {};
        if (mapa[chave]) return true;
        mapa[chave] = true;
        window.sessionStorage.setItem(CHAVE, JSON.stringify(mapa));
        return false;
      } catch {
        // sessionStorage bloqueado (modo privado/iframe): segue sem deduplicar.
        return false;
      }
    };

    // 1. Rastreia visualização de página (RF-28)
    const trackEvent = (tipo: string) => {
      try {
        if (jaRegistrado(`${perfilId}:${tipo}`)) return;
        const payload = JSON.stringify({ perfil_id: perfilId, username, tipo });
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/estatisticas/registrar", blob);
        } else {
          fetch("/api/estatisticas/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Ignora silenciosamente para não interferir na navegação do visitante
      }
    };

    trackEvent("page_view");

    // 2. Intercepta cliques de contato direto (WhatsApp e E-mail) - RF-29
    const handleGlobalClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target || !target.href) return;

      const href = target.href.toLowerCase();
      if (href.startsWith("mailto:")) {
        trackEvent("click_email");
      } else if (href.includes("wa.me") || href.includes("whatsapp.com")) {
        trackEvent("click_whatsapp");
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [perfilId, username]);

  return null;
}
