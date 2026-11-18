import { describe, expect, it } from "vitest";
import {
  DEMO_USERNAMES,
  getDemoProfile,
  getPublicProfile,
  listStaticUsernameParams,
  normalizeUsername,
  toTemplatePublicData,
} from "@/lib/public-profile";
import type { FotoRow, MidiaRow, PerfilRow, ShowRow } from "@/lib/public-profile";

function linhaPerfil(overrides: Partial<PerfilRow> = {}): PerfilRow {
  return {
    id: "perfil-1",
    nome_artistico: "DJ Teste",
    username: "dj-teste",
    foto_url: null,
    biografia_pt: null,
    biografia_en: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    twitter_x: null,
    whatsapp: null,
    email_booking: null,
    template_slug: null,
    publicado: true,
    ...overrides,
  };
}

describe("normalizeUsername", () => {
  it("remove espaços e coloca em minúsculas", () => {
    expect(normalizeUsername("  DJ-PressLink \n")).toBe("dj-presslink");
  });
});

describe("getDemoProfile", () => {
  it("resolve os demos fixos sem tocar no banco", () => {
    for (const username of DEMO_USERNAMES) {
      expect(getDemoProfile(username)).not.toBeNull();
    }
  });

  it("ignora caixa e espaços", () => {
    expect(getDemoProfile("  DEMO-EDITORIAL ")).toBe(getDemoProfile("demo-editorial"));
  });

  it("devolve null para username comum", () => {
    expect(getDemoProfile("dj-presslink")).toBeNull();
  });
});

describe("getPublicProfile", () => {
  it("serve os demos mesmo sem Supabase configurado", async () => {
    const data = await getPublicProfile("demo");
    expect(data?.perfil.nome_artistico).toBeTruthy();
    expect(data?.perfil.template_slug).toBeTruthy();
  });

  it("devolve null para username vazio", async () => {
    await expect(getPublicProfile("   ")).resolves.toBeNull();
  });
});

describe("listStaticUsernameParams", () => {
  it("inclui os demos fixos sem duplicar", async () => {
    const params = await listStaticUsernameParams();
    const nomes = params.map((p) => p.username);

    for (const demo of DEMO_USERNAMES) {
      expect(nomes).toContain(demo);
    }
    expect(new Set(nomes).size).toBe(nomes.length);
  });
});

describe("toTemplatePublicData", () => {
  const fotos: FotoRow[] = [
    { id: "f1", url: "https://cdn.test/1.jpg", alt_text: null, ordem: 2 },
    { id: "f2", url: "https://cdn.test/2.jpg", alt_text: "Capa", ordem: null },
  ];
  const midias: MidiaRow[] = [
    { id: "m1", tipo: "spotify", url: "https://open.spotify.com/track/1", titulo: null, ordem: null },
  ];
  const shows: ShowRow[] = [
    {
      id: "s1",
      nome_evento: "Warehouse",
      data: "2026-12-01",
      horario: null,
      local: null,
      cidade: "São Paulo",
    },
  ];

  it("mapeia as linhas do banco para o formato dos templates", () => {
    const data = toTemplatePublicData(linhaPerfil(), fotos, midias, shows);

    expect(data.perfil.nome_artistico).toBe("DJ Teste");
    expect(data.fotos).toEqual([
      { id: "f1", url: "https://cdn.test/1.jpg", alt_text: null, ordem: 2 },
      { id: "f2", url: "https://cdn.test/2.jpg", alt_text: "Capa", ordem: 0 },
    ]);
    expect(data.midias[0]).toMatchObject({ tipo: "spotify", ordem: 0, titulo: null });
    expect(data.shows[0]).toMatchObject({ nome_evento: "Warehouse", cidade: "São Paulo" });
  });

  it("usa o username quando não há nome artístico", () => {
    const data = toTemplatePublicData(linhaPerfil({ nome_artistico: null }), [], [], []);
    expect(data.perfil.nome_artistico).toBe("dj-teste");
  });

  it("cai no template padrão quando o slug é nulo ou desconhecido", () => {
    expect(toTemplatePublicData(linhaPerfil(), [], [], []).perfil.template_slug).toBe(
      "dark-minimal",
    );
    expect(
      toTemplatePublicData(linhaPerfil({ template_slug: "tema-que-nao-existe" }), [], [], [])
        .perfil.template_slug,
    ).toBe("dark-minimal");
  });

  it("preserva o slug válido escolhido pelo DJ", () => {
    const data = toTemplatePublicData(
      linhaPerfil({ template_slug: "vibrant-festival" }),
      [],
      [],
      [],
    );
    expect(data.perfil.template_slug).toBe("vibrant-festival");
  });
});
