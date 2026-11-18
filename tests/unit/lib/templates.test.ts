// tests/unit/lib/templates.test.ts — issue #21
// Unidade do registro de templates (fonte única de temas) e do payload de
// troca de tema (RF-23: dados do DJ permanecem intactos após a troca).
import { describe, expect, it } from "vitest";

import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATES,
  TEMPLATE_IDS,
  buildTemplateSwitchPayload,
  getTemplateById,
  isKnownTemplateId,
  resolveTemplateId,
} from "@/lib/templates";
import type { TemplatePublicData } from "@/types/template";

/** Portfólio de exemplo completo para exercitar o payload de troca */
const DADOS_EXEMPLO: TemplatePublicData = {
  perfil: {
    id: "perfil-1",
    username: "dj-a",
    nome_artistico: "DJ A",
    foto_url: "https://cdn.example.com/dja.jpg",
    biografia_pt: "DJ com mais de dez anos de estrada tocando house e tech.",
    biografia_en: "DJ with more than ten years playing house and tech.",
    instagram: "https://instagram.com/dja",
    facebook: "",
    tiktok: "https://tiktok.com/@dja",
    twitter_x: "",
    whatsapp: "+5511999990000",
    email_booking: "booking@dja.com",
    template_slug: "dark-minimal",
  },
  fotos: [{ id: "f1", url: "https://cdn.example.com/1.jpg", alt_text: "show", ordem: 1 }],
  midias: [{ id: "m1", tipo: "spotify", url: "https://open.spotify.com/track/x", titulo: "Faixa", ordem: 1 }],
  shows: [{ id: "s1", nome_evento: "Festival X", data: "2026-12-01", horario: "23:00", local: "Galpão Y", cidade: "São Paulo" }],
};

describe("registro de templates (TEMPLATES)", () => {
  it("tem exatamente os 3 temas oficiais, ids únicos e slugs conhecidos", () => {
    expect(TEMPLATES).toHaveLength(3);
    expect([...TEMPLATE_IDS].sort()).toEqual(
      ["clean-editorial", "dark-minimal", "vibrant-festival"],
    );

    const ids = TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    TEMPLATES.forEach((t) => expect(isKnownTemplateId(t.id)).toBe(true));
  });

  it("cada tema define tokens completos e classe raiz pl-tpl--*", () => {
    TEMPLATES.forEach((t) => {
      for (const k of ["background", "foreground", "accent", "accentSecondary", "surface"] as const) {
        expect(t.tokens[k]).toMatch(/^#([0-9a-f]{3}){1,2}$/i);
      }
      expect(t.classeRaiz).toMatch(/^pl-tpl--/);
      // só clean-editorial é claro; os outros dois são dark
      expect(t.scheme).toBe(t.id === "clean-editorial" ? "light" : "dark");
      expect(t.nome).toBeTruthy();
      expect(t.descricao).toBeTruthy();
    });
  });
});

describe("resolveTemplateId / getTemplateById", () => {
  it("resolve slug conhecido sem alterar", () => {
    expect(resolveTemplateId("vibrant-festival")).toBe("vibrant-festival");
    expect(getTemplateById("clean-editorial")?.id).toBe("clean-editorial");
  });

  it("null/vazio/desconhecido caem no default (dark-minimal)", () => {
    expect(DEFAULT_TEMPLATE_ID).toBe("dark-minimal");
    expect(resolveTemplateId(null)).toBe(DEFAULT_TEMPLATE_ID);
    expect(resolveTemplateId(undefined)).toBe(DEFAULT_TEMPLATE_ID);
    expect(resolveTemplateId("")).toBe(DEFAULT_TEMPLATE_ID);
    expect(resolveTemplateId("neon-x")).toBe(DEFAULT_TEMPLATE_ID);
  });
});

describe("buildTemplateSwitchPayload (RF-23)", () => {
  it("repete todos os campos do perfil sem alteração + o novo template_slug", () => {
    const payload = buildTemplateSwitchPayload(DADOS_EXEMPLO, "vibrant-festival");

    // Template escolhido
    expect(payload.template_slug).toBe("vibrant-festival");
    // Identidade e contatos intactos
    expect(payload.nome_artistico).toBe("DJ A");
    expect(payload.username).toBe("dj-a");
    expect(payload.biografia_pt).toBe(DADOS_EXEMPLO.perfil.biografia_pt);
    expect(payload.biografia_en).toBe(DADOS_EXEMPLO.perfil.biografia_en);
    expect(payload.instagram).toBe("https://instagram.com/dja");
    expect(payload.tiktok).toBe("https://tiktok.com/@dja");
    expect(payload.foto_url).toBe("https://cdn.example.com/dja.jpg");
    expect(payload.whatsapp).toBe("+5511999990000");
    expect(payload.email_booking).toBe("booking@dja.com");
    // Campos vazios continuam vazios (não inventa valor)
    expect(payload.facebook).toBe("");
    expect(payload.twitter_x).toBe("");
  });

  it("omite whatsapp/email_booking quando ausentes (PUT parcial não nula nada)", () => {
    const semContato: TemplatePublicData = {
      ...DADOS_EXEMPLO,
      perfil: {
        ...DADOS_EXEMPLO.perfil,
        whatsapp: undefined,
        email_booking: undefined,
      },
    };
    const payload = buildTemplateSwitchPayload(semContato, "clean-editorial");

    expect(payload.template_slug).toBe("clean-editorial");
    expect("whatsapp" in payload).toBe(false);
    expect("email_booking" in payload).toBe(false);
  });

  it("passa o slug escolhido como template_slug (guarda contra slug inválido é a schema do PUT)", () => {
    const payload = buildTemplateSwitchPayload(DADOS_EXEMPLO, "neon-x");
    expect(payload.template_slug).toBe("neon-x");
  });

  it("não envia foto_url quando o perfil não tem capa (não sobrescreve imagem)", () => {
    // Regressão 18/11/2026: a tela usava a 1ª foto da galeria como capa do
    // preview e o payload gravava essa URL no perfil ao trocar de tema.
    const semCapa: TemplatePublicData = {
      ...DADOS_EXEMPLO,
      perfil: { ...DADOS_EXEMPLO.perfil, foto_url: null },
    };

    const payload = buildTemplateSwitchPayload(semCapa, "vibrant-festival");

    expect("foto_url" in payload).toBe(false);
    expect(payload.template_slug).toBe("vibrant-festival");
  });
});
