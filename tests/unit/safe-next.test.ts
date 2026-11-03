// tests/unit/safe-next.test.ts — sanitização de ?next= (open redirect)
// RED: cobre I5 do review 2026-11-03 — só `startsWith("/")` aceita //evil.com
import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/safe-next";

describe("safeNext", () => {
  it("mantém caminho interno", () => {
    expect(safeNext("/painel")).toBe("/painel");
    expect(safeNext("/painel/galeria?x=1")).toBe("/painel/galeria?x=1");
  });

  it("cai no fallback quando null/undefined/vazio", () => {
    expect(safeNext(null, "/login?verified=1")).toBe("/login?verified=1");
    expect(safeNext(undefined, "/login?verified=1")).toBe("/login?verified=1");
    expect(safeNext("", "/login?verified=1")).toBe("/login?verified=1");
  });

  it("bloqueia protocol-relative //evil.com", () => {
    expect(safeNext("//evil.com", "/login")).toBe("/login");
    expect(safeNext("//evil.com/painel", "/login")).toBe("/login");
  });

  it("bloqueia barra invertida (// e /\\ viram // no browser)", () => {
    expect(safeNext("/\\evil.com", "/login")).toBe("/login");
    expect(safeNext("\\\\evil.com", "/login")).toBe("/login");
  });

  it("bloqueia URL absoluta", () => {
    expect(safeNext("https://evil.com", "/login")).toBe("/login");
    expect(safeNext("http://evil.com/painel", "/login")).toBe("/login");
    expect(safeNext("javascript:alert(1)", "/login")).toBe("/login");
  });

  it("bloqueia esquema disfarçado com espaço/controle no início", () => {
    expect(safeNext(" //evil.com", "/login")).toBe("/login");
    expect(safeNext("/\t/evil.com", "/login")).toBe("/login");
  });
});
