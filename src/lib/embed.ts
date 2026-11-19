/**
 * Utilitários de mídia sem zod (issue #28).
 *
 * Estas funções são usadas também pelos templates públicos, que são componentes
 * de cliente. Quando elas moravam em `validators/links.ts` o bundle da página
 * pública importava o arquivo inteiro e baixava o zod (~26 KB de chunk) só para
 * montar a URL de embed. Os schemas continuam em `validators/links.ts`, que
 * reexporta tudo daqui para manter os imports existentes válidos.
 */

export type TipoMidia = "spotify" | "soundcloud" | "youtube";

export interface LinkDeMidia {
  id: string;
  perfil_id: string;
  tipo: TipoMidia;
  url: string;
  titulo: string | null;
  ordem: number;
  created_at: string;
}

/**
 * Detecta a plataforma a partir de uma URL ou string.
 */
export function detectTipoMidia(inputUrl: string): TipoMidia | null {
  try {
    const trimmed = inputUrl.trim();
    if (!trimmed) return null;

    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    if (
      host === "open.spotify.com" ||
      host === "spotify.com" ||
      host.endsWith(".spotify.com")
    ) {
      return "spotify";
    }

    if (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtu.be"
    ) {
      return "youtube";
    }

    if (
      host === "soundcloud.com" ||
      host === "www.soundcloud.com" ||
      host === "m.soundcloud.com" ||
      host === "on.soundcloud.com"
    ) {
      return "soundcloud";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Converte a URL padrão do provedor para a URL do player embed (iframe).
 */
export function getEmbedUrl(tipo: TipoMidia, url: string): string | null {
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    if (tipo === "youtube") {
      let videoId: string | null = null;

      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1).split("/")[0] || null;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "").split("/")[0] || null;
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.replace("/embed/", "").split("/")[0] || null;
      } else {
        videoId = parsed.searchParams.get("v");
      }

      if (!videoId) return null;
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    if (tipo === "spotify") {
      // Remove localization prefix like /intl-pt/
      let path = parsed.pathname;
      if (path.startsWith("/intl-")) {
        path = path.replace(/^\/intl-[a-zA-Z-]+\//, "/");
      }

      // Check if already an embed
      if (path.startsWith("/embed/")) {
        return `https://open.spotify.com${path}`;
      }

      return `https://open.spotify.com/embed${path}`;
    }

    if (tipo === "soundcloud") {
      const cleanUrl = `${parsed.origin}${parsed.pathname}`;
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        cleanUrl
      )}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    }

    return null;
  } catch {
    return null;
  }
}

// Regex de validação para cada provedor
export const SPOTIFY_REGEX =
  /^https?:\/\/(open\.)?spotify\.com\/(intl-[a-zA-Z-]+\/)?(track|album|playlist|artist|episode)\/[a-zA-Z0-9]+(\?.*)?$/;

export const YOUTUBE_REGEX =
  /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com\/(watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+(\?.*)?$/;

export const SOUNDCLOUD_REGEX =
  /^https?:\/\/(www\.|m\.|on\.)?soundcloud\.com\/[a-zA-Z0-9-_]+(\/[a-zA-Z0-9-_]+)*(\?.*)?$/;
