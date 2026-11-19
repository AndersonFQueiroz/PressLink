import { describe, expect, it } from "vitest";
import { excluirContaSchema } from "@/lib/validators/conta";

describe("excluirContaSchema (issue #29)", () => {
  it("aceita uma senha preenchida", () => {
    const parsed = excluirContaSchema.safeParse({ senha: "minha-senha-123" });
    expect(parsed.success).toBe(true);
  });

  it("recusa senha ausente com mensagem em português", () => {
    const parsed = excluirContaSchema.safeParse({});
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe sua senha para confirmar");
    }
  });

  it("recusa senha vazia", () => {
    const parsed = excluirContaSchema.safeParse({ senha: "" });
    expect(parsed.success).toBe(false);
  });

  it("recusa senha acima de 72 caracteres (limite do bcrypt)", () => {
    const parsed = excluirContaSchema.safeParse({ senha: "a".repeat(73) });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Senha muito longa");
    }
  });
});
