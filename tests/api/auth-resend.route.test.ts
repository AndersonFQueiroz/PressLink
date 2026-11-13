// tests/api/auth-resend.route.test.ts — POST /api/auth/resend
// RED: cobre C1 (rota alcançável), I2 (cota só consome no sucesso + ordem das checagens),
// I3 (não vazar mensagem interna nem virar oráculo de existência de conta)
import "./setup";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMockSupabase } from "@/lib/test-utils/supabase-mock";
import { createClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/auth/resend/route";
import type { NextRequest } from "next/server";

// cada teste usa um email próprio: o rate limit é keyed por email no módulo
function req(body: unknown, raw?: string) {
  const request = new Request("http://test/api/auth/resend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw !== undefined ? raw : JSON.stringify(body),
  });
  return request as unknown as NextRequest; // a rota só usa req.json() — não precisa do restante do NextRequest
}

function mockSupabase(resendResult: { error: { message: string } | null } = { error: null }) {
  const mock = createMockSupabase();
  mock.auth.resend = vi.fn().mockResolvedValue(resendResult);
  vi.mocked(createClient).mockResolvedValue(mock as never);
  return mock;
}

const T0 = new Date("2026-11-03T10:00:00Z").getTime();

describe("POST /api/auth/resend", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(T0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("400 com JSON inválido", async () => {
    mockSupabase();
    const res = await POST(req(null, "{nao-e-json"));
    expect(res.status).toBe(400);
  });

  it("400 com email inválido", async () => {
    mockSupabase();
    const res = await POST(req({ email: "nao-e-email" }));
    expect(res.status).toBe(400);
  });

  it("400 sem body", async () => {
    mockSupabase();
    const res = await POST(req({}));
    expect(res.status).toBe(400);
  });

  it("200 no primeiro envio", async () => {
    const mock = mockSupabase();
    const res = await POST(req({ email: "primeiro@presslink.test" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mock.auth.resend).toHaveBeenCalledTimes(1);
  });

  it("429 com retryAfter ~60s no reenvio imediato (cooldown)", async () => {
    mockSupabase();
    await POST(req({ email: "cooldown@presslink.test" }));
    const res = await POST(req({ email: "cooldown@presslink.test" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(60);
  });

  it("normaliza case do email no rate limit (A@x e a@x = mesma cota)", async () => {
    mockSupabase();
    await POST(req({ email: "Case@PressLink.test" }));
    const res = await POST(req({ email: "case@presslink.test" }));
    expect(res.status).toBe(429);
  });

  it("5 envios/dia permitidos, o 6º retorna retryAfter em horas (limite antes do cooldown)", async () => {
    mockSupabase();
    const email = "limite@presslink.test";
    for (let i = 0; i < 5; i++) {
      const res = await POST(req({ email }));
      expect(res.status).toBe(200);
      vi.advanceTimersByTime(61_000);
    }
    const res = await POST(req({ email }));
    expect(res.status).toBe(429);
    const body = await res.json();
    // se a ordem fosse cooldown-antes-de-limite, voltaria ~60s
    expect(body.retryAfter).toBeGreaterThan(3600);
  });

  it("falha do Supabase NÃO consome cota do dia", async () => {
    const mock = mockSupabase({ error: { message: "upstream indisponível" } });
    const email = "falha@presslink.test";

    const falha = await POST(req({ email }));
    // não expõe erro interno, mas sinaliza que não enviou
    expect(falha.status).toBe(200);
    expect(mock.auth.resend).toHaveBeenCalledTimes(1);

    mock.auth.resend.mockResolvedValue({ error: null });
    // 5 sucessos depois da falha — se a falha tivesse consumido, o 5º daria 429
    for (let i = 0; i < 5; i++) {
      vi.advanceTimersByTime(61_000);
      const res = await POST(req({ email }));
      expect(res.status).toBe(200);
    }
  });

  it("não vaza mensagem interna do GoTrue (I3)", async () => {
    mockSupabase({ error: { message: "User not found: 8f1c-internal-uuid" } });
    const res = await POST(req({ email: "oraculo@presslink.test" }));
    const body = await res.json();
    const raw = JSON.stringify(body);
    expect(raw).not.toContain("internal-uuid");
    expect(raw).not.toContain("User not found");
    // resposta indistinguível de sucesso — evita enumeração
    expect(body).toEqual({ ok: true });
  });

  it("200 alreadyVerified quando a conta já está confirmada", async () => {
    mockSupabase({ error: { message: "Email already confirmed" } });
    const res = await POST(req({ email: "javerificado@presslink.test" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, alreadyVerified: true });
  });
});
