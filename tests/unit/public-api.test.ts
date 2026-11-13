// tests/unit/public-api.test.ts — allowlist do middleware
// RED: cobre C1 do review 2026-11-03 — /api/auth/* levava 401 e matava hook + reenvio
import { describe, it, expect } from "vitest";
import { isPublicApiPath } from "@/lib/supabase/middleware";

describe("isPublicApiPath", () => {
  it("libera os endpoints de auth chamados sem sessão", () => {
    expect(isPublicApiPath("/api/auth/resend")).toBe(true);
    expect(isPublicApiPath("/api/auth/supabase-hook")).toBe(true);
    expect(isPublicApiPath("/api/auth/qualquer-coisa-nova")).toBe(true);
  });

  it("libera endpoints públicos já existentes", () => {
    expect(isPublicApiPath("/api/health/supabase")).toBe(true);
    expect(isPublicApiPath("/api/contato")).toBe(true);
    expect(isPublicApiPath("/api/estatisticas/registrar")).toBe(true);
    expect(isPublicApiPath("/api/perfil/check-username")).toBe(true);
  });

  it("mantém privado o que precisa de sessão", () => {
    expect(isPublicApiPath("/api/galeria")).toBe(false);
    expect(isPublicApiPath("/api/galeria/reordenar")).toBe(false);
    expect(isPublicApiPath("/api/perfil")).toBe(false);
    expect(isPublicApiPath("/api/shows")).toBe(false);
    expect(isPublicApiPath("/api/links")).toBe(false);
  });

  it("não confunde rota parecida com prefixo liberado", () => {
    expect(isPublicApiPath("/api/authenticacao")).toBe(false);
    expect(isPublicApiPath("/api/healthz")).toBe(true); // prefixo /api/health — comportamento intencional
  });
});
