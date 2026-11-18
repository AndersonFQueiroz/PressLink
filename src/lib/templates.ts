/**
 * Registro único de templates visuais do PressLink (issue #21).
 *
 * Cada entrada descreve um estilo aplicável à página pública do DJ:
 * - id: slug persistido na coluna perfil.template_slug via PUT /api/perfil;
 * - classeRaiz: classe CSS (definida em globals.css) que expõe os tokens
 *   abaixo como CSS variables --pl-tpl-* para componentes que queiram consumir
 *   a paleta (miniaturas, moldura do preview, futuros templates);
 * - tokens: cores reais do template público correspondente em
 *   src/components/templates/*.tsx (manter sincronizado).
 *
 * ONDE O CAMPO É CONSUMIDO:
 * A página pública (src/app/[username]/page.tsx) lê perfil.template_slug do
 * banco e passa o slug para o TemplateRenderer, que escolhe qual componente de
 * src/components/templates/ renderizar. A tela /painel/template (issue #21)
 * apenas escreve esse campo, sem alterar nenhum outro dado do perfil (RF-23).
 */
import type { TemplatePublicData } from "@/types/template";

export interface TemplateTokens {
  /** Fundo base da página. */
  background: string;
  /** Cor principal do texto. */
  foreground: string;
  /** Acorde primário (CTAs, destaques). */
  accent: string;
  /** Acorde secundário (decoração, gradientes). */
  accentSecondary: string;
  /** Superfícies internas (cards, seções). */
  surface: string;
}

export interface TemplateDef {
  /** Slug persistido em perfil.template_slug. */
  id: string;
  nome: string;
  descricao: string;
  /** Classe raiz com os tokens como CSS variables (globals.css). */
  classeRaiz: string;
  /** Tema do navegador dentro da moldura (color-scheme). */
  scheme: "dark" | "light";
  tokens: TemplateTokens;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "dark-minimal",
    nome: "Dark Minimal",
    descricao:
      "Visual escuro e sóbrio, tipografia fina — ideal para techno, underground e industrial.",
    classeRaiz: "pl-tpl--dark-minimal",
    scheme: "dark",
    tokens: {
      background: "#070708",
      foreground: "#e9e7df",
      accent: "#ffffff",
      accentSecondary: "#d8d5cb",
      surface: "#0a0a0b",
    },
  },
  {
    id: "vibrant-festival",
    nome: "Vibrant Festival",
    descricao:
      "Neon de alto contraste sobre roxo profundo — energia de mainstage e festivais EDM.",
    classeRaiz: "pl-tpl--vibrant-festival",
    scheme: "dark",
    tokens: {
      background: "#0b0614",
      foreground: "#fff6e9",
      accent: "#d8ff4a",
      accentSecondary: "#ff3d8b",
      surface: "#1a0f2e",
    },
  },
  {
    id: "clean-editorial",
    nome: "Clean Editorial",
    descricao:
      "Layout claro e refinado com toque terracota — casamentos, lounges e eventos de alto padrão.",
    classeRaiz: "pl-tpl--clean-editorial",
    scheme: "light",
    tokens: {
      background: "#f4efe6",
      foreground: "#1a1712",
      accent: "#b8472b",
      accentSecondary: "#ddd5c7",
      surface: "#ece5d8",
    },
  },
];

/** Usado quando perfil.template_slug está nulo ou fora do registro (mesmo fallback da página pública). */
export const DEFAULT_TEMPLATE_ID = "dark-minimal";

/** Todos os slugs válidos — reutilizados pela validação Zod do PUT /api/perfil. */
export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id) as readonly string[];

export function getTemplateById(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Type guard para entradas vindas do banco ou do formulário. */
export function isKnownTemplateId(value: unknown): value is string {
  return typeof value === "string" && TEMPLATE_IDS.includes(value);
}

/** Normaliza qualquer valor recebido para um slug conhecido (fallback: padrão). */
export function resolveTemplateId(value: string | null | undefined): string {
  return isKnownTemplateId(value) ? value : DEFAULT_TEMPLATE_ID;
}

/**
 * RF-23 — corpo do PUT /api/perfil usado para trocar o template.
 *
 * Todos os campos do perfil voltam exatamente como chegaram na sessão; apenas
 * template_slug muda, garantindo que a troca de visual nunca perca dados.
 * whatsapp/email_booking só são enviados quando existem (a tela Contato é
 * opcional), para não sobrescrever o estado atual no banco.
 */
export function buildTemplateSwitchPayload(
  data: TemplatePublicData,
  templateSlug: string,
): Record<string, unknown> {
  const p = data.perfil;
  const payload: Record<string, unknown> = {
    nome_artistico: p.nome_artistico,
    username: p.username,
    biografia_pt: p.biografia_pt ?? "",
    biografia_en: p.biografia_en ?? "",
    instagram: p.instagram ?? "",
    tiktok: p.tiktok ?? "",
    twitter_x: p.twitter_x ?? "",
    facebook: p.facebook ?? "",
    foto_url: p.foto_url ?? "",
    template_slug: templateSlug,
  };
  if (p.whatsapp !== undefined) payload.whatsapp = p.whatsapp;
  if (p.email_booking !== undefined) payload.email_booking = p.email_booking;
  return payload;
}
