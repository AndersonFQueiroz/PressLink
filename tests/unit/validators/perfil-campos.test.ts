// tests/unit/validators/perfil-campos.test.ts — regressão 19/11/2026
// O perfil chega da tela com `whatsapp: null` / `email_booking: null` quando o
// DJ nunca abriu Contato. O schema recusava null e a troca de tema morria com
// 400 "Dados inválidos" (o PUT usa o mesmo perfilSchema).
import { describe, expect, it } from "vitest";

import { perfilSchema } from "@/lib/validators/perfil";

const BASE = {
  nome_artistico: "DJ A",
  username: "dj-a",
  biografia_pt: "",
  biografia_en: "",
  instagram: "",
  tiktok: "",
  twitter_x: "",
  facebook: "",
};

describe("perfilSchema — campos de contato opcionais", () => {
  it("aceita whatsapp e email_booking nulos (conta sem contato salvo)", () => {
    const r = perfilSchema.safeParse({ ...BASE, whatsapp: null, email_booking: null });

    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.whatsapp).toBeNull();
      expect(r.data.email_booking).toBeNull();
    }
  });

  it("continua aceitando string e ausência do campo", () => {
    const comValor = perfilSchema.safeParse({
      ...BASE,
      whatsapp: "+55 11 99999-0000",
      email_booking: "booking@dja.com",
    });
    const semCampo = perfilSchema.safeParse(BASE);

    expect(comValor.success).toBe(true);
    expect(semCampo.success).toBe(true);
  });

  it("ainda recusa número/e-mail acima do limite", () => {
    const r = perfilSchema.safeParse({
      ...BASE,
      whatsapp: "9".repeat(31),
      email_booking: `${"a".repeat(250)}@x.com`,
    });

    expect(r.success).toBe(false);
  });
});
