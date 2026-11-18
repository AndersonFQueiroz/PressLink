import { describe, expect, it } from "vitest";
import { buildOgDescription, buildPublicMetadata } from "@/lib/public-metadata";
import type { TemplatePublicData } from "@/types/template";

function criarPerfil(overrides: Partial<TemplatePublicData["perfil"]> = {}): TemplatePublicData {
  return {
    perfil: {
      id: "perfil-1",
      nome_artistico: "DJ Teste",
      username: "dj-teste",
      foto_url: null,
      biografia_pt:
        "Techno hipnótico e house profundo, com passagens por clubes de São Paulo e Berlim.",
      biografia_en: null,
      instagram: null,
      facebook: null,
      tiktok: null,
      twitter_x: null,
      whatsapp: null,
      email_booking: null,
      template_slug: "dark-minimal",
      ...overrides,
    },
    fotos: [],
    midias: [],
    shows: [],
  };
}

interface OgLike {
  type?: string;
  siteName?: string;
  locale?: string;
  url?: string;
  title?: string;
  description?: string;
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
}

interface TwitterLike {
  card?: string;
  title?: string;
  description?: string;
  images?: string[];
}

describe("buildOgDescription", () => {
  it("achata espaços e quebras de linha", () => {
    expect(buildOgDescription("  techno\n\n  hipnótico   e house  ")).toBe(
      "techno hipnótico e house",
    );
  });

  it("devolve vazio quando não há texto", () => {
    expect(buildOgDescription(null)).toBe("");
    expect(buildOgDescription("   \n ")).toBe("");
  });

  it("não corta texto dentro do limite", () => {
    const curto = "Bio curta para o card.";
    expect(buildOgDescription(curto)).toBe(curto);
  });

  it("corta em fronteira de palavra e termina com reticências", () => {
    const longo = "palavra ".repeat(40).trim();
    const resultado = buildOgDescription(longo, 60);

    expect(resultado.length).toBeLessThanOrEqual(61);
    expect(resultado.endsWith("…")).toBe(true);
    expect(resultado.endsWith("palavra…")).toBe(true);
    expect(resultado).not.toContain("  ");
  });

  it("remove pontuação solta antes das reticências", () => {
    const resultado = buildOgDescription("Techno, house, disco, funk, samba, jazz.", 20);
    expect(resultado.endsWith("…")).toBe(true);
    expect(resultado).not.toMatch(/[,.;:!?-]…$/);
  });
});

describe("buildPublicMetadata", () => {
  const baseUrl = "https://presslink.test";

  it("monta Open Graph e Twitter com URLs absolutas", () => {
    const metadata = buildPublicMetadata(criarPerfil(), { baseUrl });
    const og = metadata.openGraph as OgLike;
    const twitter = metadata.twitter as TwitterLike;

    expect(metadata.title).toBe("DJ Teste (@dj-teste) — EPK PressLink");
    expect(metadata.description).toContain("Techno hipnótico");
    expect(metadata.alternates?.canonical).toBe(`${baseUrl}/dj-teste`);

    expect(og.type).toBe("profile");
    expect(og.siteName).toBe("PressLink");
    expect(og.url).toBe(`${baseUrl}/dj-teste`);
    expect(og.title).toBe("DJ Teste (@dj-teste) — EPK PressLink");
    expect(og.images?.[0]).toEqual({
      url: `${baseUrl}/dj-teste/opengraph-image`,
      width: 1200,
      height: 630,
      alt: "Card do EPK de DJ Teste",
    });

    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images).toEqual([`${baseUrl}/dj-teste/opengraph-image`]);
  });

  it("usa a bio em inglês quando a portuguesa está vazia", () => {
    const metadata = buildPublicMetadata(
      criarPerfil({ biografia_pt: null, biografia_en: "Hypnotic techno from Berlin." }),
      { baseUrl },
    );
    expect(metadata.description).toBe("Hypnotic techno from Berlin.");
  });

  it("cai numa descrição padrão quando o DJ não tem bio", () => {
    const metadata = buildPublicMetadata(criarPerfil({ biografia_pt: null, biografia_en: null }), {
      baseUrl,
    });
    expect(metadata.description).toBe(
      "Portfólio e Electronic Press Kit (EPK) de DJ Teste — bio, músicas, agenda e booking.",
    );
  });

  it("usa o username da rota nos demos (canonical/og:image corretos)", () => {
    const metadata = buildPublicMetadata(criarPerfil({ username: "kronos" }), {
      username: "demo",
      baseUrl,
    });
    const og = metadata.openGraph as OgLike;

    expect(metadata.alternates?.canonical).toBe(`${baseUrl}/demo`);
    expect(og.url).toBe(`${baseUrl}/demo`);
    expect(og.images?.[0]?.url).toBe(`${baseUrl}/demo/opengraph-image`);
    expect(String(metadata.title)).toContain("@demo");
  });

  it("normaliza baseUrl com barra final e caracteres especiais", () => {
    const metadata = buildPublicMetadata(criarPerfil({ username: "dj teste" }), {
      baseUrl: "https://presslink.test/",
    });
    expect(metadata.alternates?.canonical).toBe("https://presslink.test/dj%20teste");
  });
});
