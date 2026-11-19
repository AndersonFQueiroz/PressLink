"use client";

import React from "react";
import Image from "next/image";
import { Music, Play } from "lucide-react";
import {
  MediaEmbed,
  getMediaEmbedDimensions,
} from "@/components/features/painel/MediaEmbed";
import { getEmbedUrl, type TipoMidia } from "@/lib/embed";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

/** Antecipa o load 200px antes do elemento entrar na viewport (issue #49) */
const LAZY_ROOT_MARGIN = "200px 0px";

/**
 * Extrai o ID do vídeo do YouTube a partir de qualquer variação de URL
 * (watch?v=, youtu.be/, /embed/, /shorts/). Retorna null se não reconhecer.
 */
function youTubeVideoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

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
 * issue #23: no caso do YouTube o placeholder exibe também a THUMBNAIL real do
 * vídeo (i.ytimg.com/vi/<id>/hqdefault.jpg) com um glifo de play — a prévia
 * já mostra a imagem do vídeo antes do clique/scroll.
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
  // issue #23: ID do vídeo para a thumbnail do placeholder (só YouTube)
  const ytId = tipo === "youtube" ? youTubeVideoId(url) : null;

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
          data-testid="media-embed-placeholder"
          className={cn(
            "relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-black/40",
            dims.aspectVideo && "aspect-video",
            // YouTube compact ganha max-w-md no player final — espelhado aqui
            // para o placeholder ocupar exatamente o mesmo espaço
            compact && tipo === "youtube" && "max-w-md"
          )}
          style={dims.height ? { height: `${dims.height}px` } : undefined}
        >
          {/* issue #23: thumbnail real do vídeo atrás do glifo de play */}
          {ytId && (
            // issue #28: via next/image (AVIF no tamanho exibido) — o JPG
            // original de 480px era o maior arquivo da página pública.
            <Image
              src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={55}
              loading="lazy"
              className="object-cover opacity-60"
            />
          )}
          <span
            className={cn(
              "flex animate-pulse flex-col items-center gap-2",
              ytId ? "text-panel-text" : "text-panel-muted"
            )}
          >
            {ytId ? (
              // Glifo de play sobre a thumbnail (YouTube)
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/50 ">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            ) : (
              // issue #28: sem o rótulo "Prévia de mídia" — texto decorativo
              // dentro de um bloco aria-hidden só criava item de contraste no
              // Lighthouse. O ícone comunica o mesmo estado.
              <Music className="h-6 w-6" />
            )}
          </span>
        </div>
      )}
    </div>
  );
}
