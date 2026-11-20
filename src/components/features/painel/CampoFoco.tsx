"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Abre a página com o campo certo em foco (`?campo=whatsapp`, `?campo=username`…).
 *
 * O popup de erro do painel manda o DJ para `/painel/perfil?campo=instagram`;
 * este componente encontra o input pelo id, rola até ele e coloca o cursor no
 * lugar — sem o usuário ter que procurar o campo na tela. Usa `useSearchParams`
 * para funcionar também no soft navigation (já estava na página e só mudou a
 * query).
 */
export function CampoFoco() {
  const searchParams = useSearchParams();
  const campo = searchParams.get("campo");

  useEffect(() => {
    if (!campo) return;

    const alvo = document.getElementById(campo);
    if (!(alvo instanceof HTMLElement)) return;

    alvo.scrollIntoView({ block: "center", behavior: "smooth" });

    // O scroll suave termina antes do foco para a tela não pular de novo.
    const timer = window.setTimeout(() => {
      alvo.focus({ preventScroll: true });
      if (alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement) {
        alvo.select();
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [campo]);

  return null;
}
