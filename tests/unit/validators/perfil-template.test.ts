// tests/unit/validators/perfil-template.test.ts — issue #21
// O perfilSchema agora valida o campo opcional template_slug (issue #21):
// aceita só slugs do registro oficial e segue funcional sem o campo.
import { describe, expect, it } from "vitest";

import { perfilSchema } from "@/lib/validators/perfil";

/** Payload mínimo que já validava antes da issue #21 */
const BASE = {
  nome_artistico: "DJ A",
  username: "dj-a",
  biografia_pt: "DJ com mais de dez anos de estrada tocando house.",
  biografia_en: "DJ with more than ten years playing house and tech.",
  instagram: "https://instagram.com/dja",
  tiktok: "",
  twitter_x: "",
  facebook: "",
  foto_url: "",
};

describe("perfilSchema + template_slug (issue #21)", () => {
  it("aceita cada slug válido do registro", () => {
    for (const slug of ["dark-minimal", "vibrant-festival", "clean-editorial"]) {
      const r = perfilSchema.safeParse({ ...BASE, template_slug: slug });
      expect(r.success, slug).toBe(true);
      if (r.success) expect(r.data.template_slug).toBe(slug);
    }
  });

  it("rejeita slug desconhecido (ex.: 'neon-x')", () => {
    const r = perfilSchema.safeParse({ ...BASE, template_slug: "neon-x" });
    expect(r.success).toBe(false);
  });

  it("segue funcionando sem o campo (trocas antigas de perfil não quebram)", () => {
    const r = perfilSchema.safeParse(BASE);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.template_slug).toBeUndefined();
  });
});
