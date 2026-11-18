import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import {
  DEMO_CLEAN_EDITORIAL_DATA,
  DEMO_DARK_MINIMAL_DATA,
  DEMO_VIBRANT_FESTIVAL_DATA,
} from "@/lib/demo-profiles";
import { resolveTemplateId } from "@/lib/templates";
import type { TemplatePublicData } from "@/types/template";

/**
 * Leitura do portfólio público por username (issue #22).
 *
 * A página `/[username]` é Server Component estática com ISR: nada aqui pode
 * tocar cookies/headers. O cliente usado é o anon sem sessão
 * (`@/lib/supabase/public`), e a RLS já esconde perfis não publicados —
 * `publicado = false` simplesmente não volta da consulta.
 *
 * `cache()` do React deduplica a chamada dentro do mesmo request: a página e o
 * `generateMetadata` compartilham a MESMA consulta ao banco.
 */

/** Slugs de demonstração que existem sem banco (usados em testes e na vitrine). */
export const DEMO_USERNAMES = ["demo", "demo-dark", "demo-festival", "demo-editorial"] as const;

const DEMO_PROFILES: Record<string, TemplatePublicData> = {
  demo: DEMO_DARK_MINIMAL_DATA,
  "demo-dark": DEMO_DARK_MINIMAL_DATA,
  "demo-festival": DEMO_VIBRANT_FESTIVAL_DATA,
  "demo-editorial": DEMO_CLEAN_EDITORIAL_DATA,
};

/** Perfil de demonstração, quando o username é um dos demos fixos. */
export function getDemoProfile(username: string): TemplatePublicData | null {
  return DEMO_PROFILES[normalizeUsername(username)] ?? null;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** Linha bruta de `perfil` (select *) — só os campos que a página consome. */
export interface PerfilRow {
  id: string;
  nome_artistico: string | null;
  username: string;
  foto_url: string | null;
  biografia_pt: string | null;
  biografia_en: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  twitter_x: string | null;
  whatsapp: string | null;
  email_booking: string | null;
  template_slug: string | null;
  publicado?: boolean | null;
}

export interface FotoRow {
  id: string;
  url: string;
  alt_text: string | null;
  ordem: number | null;
}

export interface MidiaRow {
  id: string;
  tipo: "spotify" | "soundcloud" | "youtube";
  url: string;
  titulo: string | null;
  ordem: number | null;
}

export interface ShowRow {
  id: string;
  nome_evento: string;
  data: string;
  horario: string | null;
  local: string | null;
  cidade: string | null;
}

/**
 * Monta o `TemplatePublicData` consumido pelos templates.
 * Função pura — é o que os testes unitários cobrem.
 */
export function toTemplatePublicData(
  perfil: PerfilRow,
  fotos: FotoRow[],
  midias: MidiaRow[],
  shows: ShowRow[],
): TemplatePublicData {
  return {
    perfil: {
      id: perfil.id,
      nome_artistico: perfil.nome_artistico ?? perfil.username,
      username: perfil.username,
      foto_url: perfil.foto_url,
      biografia_pt: perfil.biografia_pt,
      biografia_en: perfil.biografia_en,
      instagram: perfil.instagram,
      facebook: perfil.facebook,
      tiktok: perfil.tiktok,
      twitter_x: perfil.twitter_x,
      whatsapp: perfil.whatsapp,
      email_booking: perfil.email_booking,
      // Fallback único de slug (mesma regra do TemplateRenderer).
      template_slug: resolveTemplateId(perfil.template_slug),
    },
    fotos: fotos.map((f) => ({
      id: f.id,
      url: f.url,
      alt_text: f.alt_text,
      ordem: f.ordem ?? 0,
    })),
    midias: midias.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      url: m.url,
      titulo: m.titulo,
      ordem: m.ordem ?? 0,
    })),
    shows: shows.map((s) => ({
      id: s.id,
      nome_evento: s.nome_evento,
      data: s.data,
      horario: s.horario,
      local: s.local,
      cidade: s.cidade,
    })),
  };
}

/**
 * Busca tudo que a página pública precisa. Retorna `null` quando o perfil não
 * existe, está despublicado ou o Supabase não está configurado.
 */
export const getPublicProfile = cache(
  async (username: string): Promise<TemplatePublicData | null> => {
    const limpo = normalizeUsername(username);
    if (!limpo) return null;

    const demo = DEMO_PROFILES[limpo];
    if (demo) return demo;

    const supabase = getPublicClient();
    if (!supabase) return null;

    const { data: perfil, error } = await supabase
      .from("perfil")
      .select("*")
      .eq("username", limpo)
      .maybeSingle<PerfilRow>();

    if (error || !perfil) return null;
    // Defesa extra: mesmo com uma policy mais permissiva no futuro, a página
    // pública só existe para perfil publicado (UC01/RF-24).
    if (perfil.publicado === false) return null;

    const [fotos, midias, shows] = await Promise.all([
      supabase
        .from("foto_galeria")
        .select("id, url, alt_text, ordem")
        .eq("perfil_id", perfil.id)
        .order("ordem", { ascending: true }),
      supabase
        .from("link_de_midia")
        .select("id, tipo, url, titulo, ordem")
        .eq("perfil_id", perfil.id)
        .order("ordem", { ascending: true }),
      supabase
        .from("data_de_show")
        .select("id, nome_evento, data, horario, local, cidade")
        .eq("perfil_id", perfil.id)
        .order("data", { ascending: true }),
    ]);

    return toTemplatePublicData(
      perfil,
      (fotos.data as FotoRow[] | null) ?? [],
      (midias.data as MidiaRow[] | null) ?? [],
      (shows.data as ShowRow[] | null) ?? [],
    );
  },
);

/**
 * Usernames publicados, para o `generateStaticParams`.
 *
 * Sem banco configurado (CI) ou em erro de rede devolve `[]`: o build não pode
 * quebrar por causa de uma pré-renderização — as páginas passam a ser geradas
 * sob demanda na primeira visita (ISR).
 */
export async function listPublishedUsernames(): Promise<string[]> {
  const supabase = getPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("perfil").select("username").eq("publicado", true);
  if (error || !data) return [];

  return (data as Array<{ username: string | null }>)
    .map((linha) => linha.username?.trim().toLowerCase())
    .filter((nome): nome is string => Boolean(nome));
}

/**
 * Params estáticos da página E do card Open Graph.
 *
 * Demos + perfis publicados, sem duplicata. A rota `opengraph-image` é um route
 * handler separado: precisa do próprio `generateStaticParams` para o card ser
 * pré-renderizado no build (senão cada scraper do WhatsApp gera uma imagem).
 */
export async function listStaticUsernameParams(): Promise<Array<{ username: string }>> {
  const publicados = await listPublishedUsernames();
  return [...new Set<string>([...DEMO_USERNAMES, ...publicados])].map((username) => ({
    username,
  }));
}
