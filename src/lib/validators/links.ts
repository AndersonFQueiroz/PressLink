import { z } from "zod";

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

export const linkMidiaSchema = z.object({
  url: z
    .string()
    .min(1, "A URL é obrigatória")
    .url("Formato de URL inválido")
    .refine((val) => detectTipoMidia(val) !== null, {
      message: "A URL deve ser do Spotify, SoundCloud ou YouTube",
    }),
  titulo: z
    .string()
    .max(100, "O título deve ter no máximo 100 caracteres")
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : null)),
  tipo: z.enum(["spotify", "soundcloud", "youtube"]).optional(),
  ordem: z.number().int().min(0).optional(),
});

export const linkMidiaUpdateSchema = z.object({
  titulo: z
    .string()
    .max(100, "O título deve ter no máximo 100 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  url: z
    .string()
    .url("Formato de URL inválido")
    .refine((val) => detectTipoMidia(val) !== null, {
      message: "A URL deve ser do Spotify, SoundCloud ou YouTube",
    })
    .optional(),
  ordem: z.number().int().min(0).optional(),
});

export const reordenarLinksSchema = z.object({
  ids: z
    .array(z.string().uuid("ID inválido"))
    .min(1, "Envie pelo menos um ID para reordenar"),
});

export type LinkMidiaInput = z.infer<typeof linkMidiaSchema>;
export type LinkMidiaUpdateInput = z.infer<typeof linkMidiaUpdateSchema>;
export type ReordenarLinksInput = z.infer<typeof reordenarLinksSchema>;
