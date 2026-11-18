import type { Metadata } from "next";
import type { TemplatePublicData } from "@/types/template";
import { siteUrl } from "@/lib/site";

/**
 * Metadados da página pública (issue #22).
 *
 * Função pura para poder ser testada sem render: recebe o perfil já carregado e
 * devolve o objeto `Metadata` do Next. As URLs saem absolutas porque WhatsApp,
 * Instagram e LinkedIn não resolvem caminho relativo no preview.
 *
 * A imagem é sempre a rota `opengraph-image` do perfil (1200x630, gerada no
 * servidor) — foto de capa em retrato vira recorte ruim no card do WhatsApp.
 */

const LIMITE_DESCRICAO = 155;

/** Achata quebras de linha/espaços e corta em fronteira de palavra. */
export function buildOgDescription(
  texto: string | null | undefined,
  limite = LIMITE_DESCRICAO,
): string {
  const limpo = (texto ?? "").replace(/\s+/g, " ").trim();
  if (!limpo) return "";
  if (limpo.length <= limite) return limpo;

  const corte = limpo.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(" ");
  const base = ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte;
  return `${base.replace(/[.,;:!?-]+$/, "")}…`;
}

export interface PublicMetadataOptions {
  /**
   * Username da URL. Padrão: `perfil.username`.
   *
   * Os demos usam slugs fixos (`/demo`, `/demo-festival`, `/demo-editorial`)
   * enquanto o perfil de exemplo tem outro username — canonical e og:image
   * precisam apontar para a rota real, senão o preview aponta para 404.
   */
  username?: string;
  /** Base absoluta do site (testes passam uma fixa). */
  baseUrl?: string;
}

export function buildPublicMetadata(
  data: TemplatePublicData,
  options: PublicMetadataOptions = {},
): Metadata {
  const base = (options.baseUrl ?? siteUrl()).replace(/\/+$/, "");
  const { perfil } = data;
  const rota = options.username ?? perfil.username;
  const nome = perfil.nome_artistico?.trim() || rota;
  const url = `${base}/${encodeURIComponent(rota)}`;
  const imagem = `${url}/opengraph-image`;

  const descricao =
    buildOgDescription(perfil.biografia_pt) ||
    buildOgDescription(perfil.biografia_en) ||
    `Portfólio e Electronic Press Kit (EPK) de ${nome} — bio, músicas, agenda e booking.`;

  const titulo = `${nome} (@${rota}) — EPK PressLink`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      siteName: "PressLink",
      locale: "pt_BR",
      url,
      title: titulo,
      description: descricao,
      images: [
        {
          url: imagem,
          width: 1200,
          height: 630,
          alt: `Card do EPK de ${nome}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}
