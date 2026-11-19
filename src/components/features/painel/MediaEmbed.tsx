"use client";

import React, { useState } from "react";
import { Music, Play, AlertTriangle } from "lucide-react";
import { getEmbedUrl, type TipoMidia } from "@/lib/embed";
import { cn } from "@/lib/utils";

interface MediaEmbedProps {
  tipo: TipoMidia;
  url: string;
  titulo?: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Dimensões reservadas do player por provedor.
 * Fonte única das alturas usadas nos iframes abaixo — o lazy loading
 * (LazyMediaEmbed) consome isso para reservar espaço idêntico e evitar
 * layout shift na troca placeholder → player.
 */
export interface MediaEmbedDimensions {
  /** Altura fixa em px — usada por Spotify/SoundCloud */
  height?: number;
  /** true quando o player usa aspect-ratio 16:9 em vez de altura fixa (YouTube) */
  aspectVideo?: boolean;
}

export function getMediaEmbedDimensions(
  tipo: TipoMidia,
  url: string,
  compact = false
): MediaEmbedDimensions {
  if (tipo === "youtube") {
    return { aspectVideo: true };
  }

  if (tipo === "spotify") {
    const isPlaylistOrAlbum =
      url.includes("/playlist/") || url.includes("/album/");
    return { height: compact ? 80 : isPlaylistOrAlbum ? 352 : 152 };
  }

  if (tipo === "soundcloud") {
    const isSet = url.includes("/sets/");
    return { height: compact ? 120 : isSet ? 300 : 166 };
  }

  // Tipo sem embed conhecido: o MediaEmbed renderiza um link leve, sem iframe
  return {};
}

export function ProviderBadge({ tipo }: { tipo: TipoMidia }) {
  if (tipo === "spotify") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-[#1DB954]/25 bg-[#1DB954]/[0.08] px-1.5 py-0.5 text-[11px] font-medium text-[#1ed760]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1ed760]" aria-hidden="true" />
        Spotify
      </span>
    );
  }

  if (tipo === "youtube") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-[#FF0000]/25 bg-[#FF0000]/[0.08] px-1.5 py-0.5 text-[11px] font-medium text-danger">
        <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
        YouTube
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-[#FF5500]/25 bg-[#FF5500]/[0.08] px-1.5 py-0.5 text-[11px] font-medium text-[#ff8a55]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a55]" aria-hidden="true" />
      SoundCloud
    </span>
  );
}

export function MediaEmbed({
  tipo,
  url,
  titulo,
  className,
  compact = false,
}: MediaEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const embedUrl = getEmbedUrl(tipo, url);
  // Alturas centralizadas em getMediaEmbedDimensions (reusado pelo lazy loading)
  const dims = getMediaEmbedDimensions(tipo, url, compact);

  if (!embedUrl || hasError) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-panel-line bg-white/[0.02] p-4 flex flex-col items-center justify-center text-center text-panel-muted gap-2",
          className
        )}
      >
        <AlertTriangle className="h-5 w-5 text-amber-400/80" />
        <p className="text-xs text-panel-text">
          Não foi possível carregar a prévia do player para esta URL.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-signal-soft hover:underline flex items-center gap-1"
        >
          <Play className="h-3 w-3" /> Abrir no {tipo}
        </a>
      </div>
    );
  }

  if (tipo === "spotify") {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl bg-black/40", className)}>
        <iframe
          src={embedUrl}
          width="100%"
          height={dims.height ?? 152}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={titulo || "Spotify Embed Player"}
          className="rounded-xl border-0"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  if (tipo === "youtube") {
    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl bg-black/40 aspect-video",
          compact && "max-w-md",
          className
        )}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          title={titulo || "YouTube Video Player"}
          className="h-full w-full rounded-xl border-0"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  if (tipo === "soundcloud") {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl bg-black/40", className)}>
        <iframe
          src={embedUrl}
          width="100%"
          height={dims.height ?? 166}
          scrolling="no"
          allow="autoplay"
          loading="lazy"
          title={titulo || "SoundCloud Track Player"}
          className="rounded-xl border-0"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-panel-muted p-3 bg-white/[0.02] rounded-xl border border-panel-line">
      <Music className="h-4 w-4" />
      <span>{titulo || url}</span>
    </div>
  );
}
