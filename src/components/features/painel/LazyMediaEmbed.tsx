"use client";

import React from "react";
import { Music } from "lucide-react";
import {
  MediaEmbed,
  getMediaEmbedDimensions,
} from "@/components/features/painel/MediaEmbed";
import { TipoMidia, getEmbedUrl } from "@/lib/validators/links";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

/** Antecipa o load 200px antes do elemento entrar na viewport (issue #49) */
const LAZY_ROOT_MARGIN = "200px 0px";

interface LazyMediaEmbedProps {
  tipo: TipoMidia;
  url: string;
  titulo?: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Wrapper de lazy loading para o MediaEmbed (issue #49, parte de #23).
 *
 * O iframe/player só é montado quando o container entra na viewport (com
 * folga de 200px via IntersectionObserver). Antes disso é renderizado um
 * placeholder com as MESMAS dimensões finais do player (getMediaEmbedDimensions)
 * — zero layout shift na seção de mídia.
 *
 * Reusa o enum `tipo` (TipoMidia) e a lógica de providers do MediaEmbed,
 * que continua sendo quem monta os iframes de Spotify/SoundCloud/YouTube.
 *
 * Sem URL de embed válida o MediaEmbed exibe apenas o fallback leve (caixa de
 * erro/link, sem iframe), então nesse caso ele é renderizado imediatamente.
 */
export function LazyMediaEmbed({
  tipo,
  url,
  titulo,
  className,
  compact = false,
}: LazyMediaEmbedProps) {
  const embedUrl = getEmbedUrl(tipo, url);
  const dims = getMediaEmbedDimensions(tipo, url, compact);

  // Só observa se de fato há um iframe para adiar
  const { ref, inView } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: LAZY_ROOT_MARGIN,
    enabled: Boolean(embedUrl),
  });

  // Sem embed válido → fallback leve sem iframe: monta já, sem esperar scroll
  if (!embedUrl) {
    return (
      <MediaEmbed
        tipo={tipo}
        url={url}
        titulo={titulo}
        className={className}
        compact={compact}
      />
    );
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      {inView ? (
        // Dentro (ou a <200px da) viewport: monta o player real
        <MediaEmbed tipo={tipo} url={url} titulo={titulo} compact={compact} />
      ) : (
        // Placeholder reserva as dimensões exatas do player final (altura fixa
        // por provedor ou 16:9 no YouTube) para a troca não mover a página
        <div
          aria-hidden="true"
          className={cn(
            "flex w-full items-center justify-center overflow-hidden rounded-xl bg-black/40",
            dims.aspectVideo && "aspect-video",
            // YouTube compact ganha max-w-md no player final — espelhado aqui
            // para o placeholder ocupar exatamente o mesmo espaço
            compact && tipo === "youtube" && "max-w-md"
          )}
          style={dims.height ? { height: `${dims.height}px` } : undefined}
        >
          <span className="flex animate-pulse flex-col items-center gap-2 text-white/30">
            <Music className="h-6 w-6" />
            <span className="text-[10px] uppercase tracking-[0.2em]">
              Prévia de mídia
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
