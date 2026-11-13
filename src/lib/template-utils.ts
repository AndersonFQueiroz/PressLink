import type { TemplateDJProfile } from "@/types/template";

export type TemplateLang = "pt" | "en";

export interface SocialLink {
  key: "instagram" | "tiktok" | "facebook" | "x";
  label: string;
  href: string;
}

export interface ShowDate {
  day: string;
  monthShort: string;
  monthLong: string;
  weekday: string;
  year: number;
  timestamp: number;
  isPast: boolean;
}

/** Garante https:// e ignora links vazios. */
export function normalizeUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getSocialLinks(perfil: TemplateDJProfile): SocialLink[] {
  const entries: Array<[SocialLink["key"], string, string | null | undefined]> = [
    ["instagram", "Instagram", perfil.instagram],
    ["tiktok", "TikTok", perfil.tiktok],
    ["facebook", "Facebook", perfil.facebook],
    ["x", "X / Twitter", perfil.twitter_x],
  ];

  return entries.flatMap(([key, label, value]) => {
    const href = normalizeUrl(value);
    return href ? [{ key, label, href }] : [];
  });
}

export function buildWhatsAppUrl(perfil: TemplateDJProfile, lang: TemplateLang = "pt"): string | null {
  if (!perfil.whatsapp) return null;
  const digits = perfil.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const withCountry =
    digits.length === 10 || digits.length === 11
      ? `55${digits}`
      : digits;

  const message =
    lang === "en"
      ? `Hi ${perfil.nome_artistico}, I'd like to check availability and fees for a booking.`
      : `Olá ${perfil.nome_artistico}, gostaria de consultar disponibilidade e cachê para uma apresentação.`;

  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function sortShows<T extends { data: string; horario?: string | null }>(shows: T[]): T[] {
  return [...shows].sort((a, b) => {
    const byDate = a.data.localeCompare(b.data);
    if (byDate !== 0) return byDate;
    return (a.horario ?? "").localeCompare(b.horario ?? "");
  });
}

export function formatShowDate(dateStr: string, lang: TemplateLang = "pt"): ShowDate {
  const [year, month, day] = dateStr.split("-").map((part) => Number.parseInt(part, 10));
  const date = new Date(year, (month || 1) - 1, day || 1);
  const locale = lang === "en" ? "en-US" : "pt-BR";

  const monthShort = date.toLocaleDateString(locale, { month: "short" }).replace(".", "").toUpperCase();
  const monthLong = date.toLocaleDateString(locale, { month: "long" }).replace(".", "");
  const weekday = date.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");

  return {
    day: String(day || 1).padStart(2, "0"),
    monthShort,
    monthLong,
    weekday: weekday.toUpperCase(),
    year: year || new Date().getFullYear(),
    timestamp: date.getTime(),
    isPast: date.getTime() + 86400000 < Date.now(),
  };
}

/**
 * Nomes de demonstração vêm espaçados letra a letra ("K R O N O S").
 * Junta esses casos para o hero não quebrar em "KRO / NOS".
 */
export function displayName(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length > 2 && tokens.every((token) => token.length === 1)) {
    return tokens.join("");
  }
  return tokens.join(" ");
}

export function bioFor(perfil: TemplateDJProfile, lang: TemplateLang): string | null {
  return lang === "pt" ? perfil.biografia_pt ?? null : perfil.biografia_en ?? null;
}

export function hasBothLanguages(perfil: TemplateDJProfile): boolean {
  return Boolean(perfil.biografia_pt && perfil.biografia_en);
}

export function splitParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function nextShow<T extends { data: string; horario?: string | null }>(shows: T[]): T | null {
  const now = Date.now() - 86400000;
  return sortShows(shows).find((show) => {
    const [year, month, day] = show.data.split("-").map((part) => Number.parseInt(part, 10));
    return new Date(year, (month || 1) - 1, day || 1).getTime() >= now;
  }) ?? null;
}

export function providerLabel(tipo: "spotify" | "soundcloud" | "youtube"): string {
  if (tipo === "spotify") return "Spotify";
  if (tipo === "soundcloud") return "SoundCloud";
  return "YouTube";
}

export function trackNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
