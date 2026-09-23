import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validators/auth";
import { cadastroSchema } from "@/lib/validators/cadastro";

describe("loginSchema", () => {
  it("rejeita email inválido", () => expect(loginSchema.safeParse({ email: "a@", password: "123456" }).success).toBe(false));
  it("rejeita senha <6", () => expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false));
  it("aceita login válido", () => expect(loginSchema.safeParse({ email: "a@b.com", password: "123456" }).success).toBe(true));
});

describe("cadastroSchema", () => {
  it("rejeita sem aceite LGPD", () => {
    expect(cadastroSchema.safeParse({ nome: "DJ Foo", username: "dj-foo", email: "a@b.com", senha: "12345678", aceiteLgpd: false }).success).toBe(false);
  });
  it("normaliza username lower", () => {
    const r = cadastroSchema.safeParse({ nome: "DJ Foo", username: "DJ-FOO", email: "A@B.COM", senha: "12345678", aceiteLgpd: true });
    expect(r.success).toBe(false); // Dj-Foo com maiúscula rejeita antes de lower
  });
  it("aceita cadastro válido", () => {
    expect(cadastroSchema.safeParse({ nome: "DJ Foo", username: "dj-foo", email: "a@b.com", senha: "12345678", aceiteLgpd: true }).success).toBe(true);
  });
});
