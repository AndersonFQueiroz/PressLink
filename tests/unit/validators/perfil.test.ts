import { describe, it, expect } from "vitest";
import { perfilSchema } from "@/lib/validators/perfil";

describe("perfilSchema", () => {
  it("rejeita username com maiúscula", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "DJ Foo", username: "DjFoo" });
    expect(r.success).toBe(false);
  });
  it("aceita username válido e normaliza lower", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "DJ Foo", username: "dj-foo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.username).toBe("dj-foo");
  });
  it("rejeita username com hífen no fim", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "A B", username: "abc-" });
    expect(r.success).toBe(false);
  });
  it("rejeita instagram sem https", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "A B", username: "abc", instagram: "instagram.com/foo" });
    expect(r.success).toBe(false);
  });
  it("aceita instagram https válido", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "DJ Foo", username: "dj-foo", instagram: "https://instagram.com/foo" });
    expect(r.success).toBe(true);
  });
  it("rejeita nome vazio", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "", username: "dj-foo" });
    expect(r.success).toBe(false);
  });
  it("trim nome_artistico", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "  DJ Foo  ", username: "dj-foo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.nome_artistico).toBe("DJ Foo");
  });
});
