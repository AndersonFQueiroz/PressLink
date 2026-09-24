"use client";

import React, { useState } from "react";
import { Music, Play, AlertTriangle } from "lucide-react";
import { TipoMidia, getEmbedUrl } from "@/lib/validators/links";
import { cn } from "@/lib/utils";

interface MediaEmbedProps {
  tipo: TipoMidia;
  url: string;
  titulo?: string | null;
  className?: string;
  compact?: boolean;
}

export function ProviderBadge({ tipo }: { tipo: TipoMidia }) {
  if (tipo === "spotify") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1DB954]/15 text-[#1ed760] border border-[#1DB954]/30">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1ed760]" />
        Spotify
      </span>
    );
  }

  if (tipo === "youtube") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF0000]/15 text-[#ff4e4e] border border-[#FF0000]/30">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff4e4e]" />
        YouTube
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF5500]/15 text-[#ff7733] border border-[#FF5500]/30">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff7733]" />
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

  if (!embedUrl || hasError) {
    return (
      <div
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col items-center justify-center text-center text-white/60 gap-2",
          className
        )}
      >
        <AlertTriangle className="h-5 w-5 text-amber-400/80" />
        <p className="text-xs text-white/70">
          Não foi possível carregar a prévia do player para esta URL.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-fuchsia-400 hover:underline flex items-center gap-1"
        >
          <Play className="h-3 w-3" /> Abrir no {tipo}
        </a>
      </div>
    );
  }

  if (tipo === "spotify") {
    const isPlaylistOrAlbum = url.includes("/playlist/") || url.includes("/album/");
    const height = compact ? 80 : isPlaylistOrAlbum ? 352 : 152;

    return (
      <div className={cn("w-full overflow-hidden rounded-xl bg-black/40", className)}>
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
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
    const isSet = url.includes("/sets/");
    const height = compact ? 120 : isSet ? 300 : 166;

    return (
      <div className={cn("w-full overflow-hidden rounded-xl bg-black/40", className)}>
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
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
    <div className="flex items-center gap-2 text-sm text-white/60 p-3 bg-white/[0.02] rounded-xl border border-white/10">
      <Music className="h-4 w-4" />
      <span>{titulo || url}</span>
    </div>
  );
}
