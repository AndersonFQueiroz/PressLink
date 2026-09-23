import "./setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase } from "@/lib/test-utils/supabase-mock";
import { createClient } from "@/lib/supabase/server";

describe("GET /api/galeria", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("401 quando não autenticado", async () => {
    const mock = createMockSupabase({ user: null, perfil: null });
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { GET } = await import("@/app/api/galeria/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });
  it("200 quando autenticado e perfil existe", async () => {
    const mock = createMockSupabase({ fotos: [{ id: "f1", url: "https://cdn.test/f1.jpg" }] });
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { GET } = await import("@/app/api/galeria/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.fotos).toBeDefined();
  });
});

describe("POST /api/galeria", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("401 sem auth", async () => {
    const mock = createMockSupabase({ user: null, perfil: null });
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { POST } = await import("@/app/api/galeria/route");
    const fd = new FormData();
    fd.append("files", new File(["x"], "a.jpg", { type: "image/jpeg" }));
    const req = new Request("http://test/api/galeria", { method: "POST", body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
  it("400 quando >10 arquivos", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { POST } = await import("@/app/api/galeria/route");
    const fd = new FormData();
    for (let i = 0; i < 11; i++) fd.append("files", new File(["x"], `a${i}.jpg`, { type: "image/jpeg" }));
    const req = new Request("http://test/api/galeria", { method: "POST", body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
  it("400 quando arquivo >5MB", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { POST } = await import("@/app/api/galeria/route");
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    const fd = new FormData();
    fd.append("files", new File([big], "big.jpg", { type: "image/jpeg" }));
    const req = new Request("http://test/api/galeria", { method: "POST", body: fd });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/galeria", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("400 id inválido", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { DELETE } = await import("@/app/api/galeria/route");
    const req = new Request("http://test/api/galeria?id=invalid-uuid", { method: "DELETE" });
    const res = await DELETE(req as any);
    expect(res.status).toBe(400);
  });
  it("401 sem auth", async () => {
    const mock = createMockSupabase({ user: null, perfil: null });
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { DELETE } = await import("@/app/api/galeria/route");
    const req = new Request("http://test/api/galeria?id=00000000-0000-0000-0000-000000000001", { method: "DELETE" });
    const res = await DELETE(req as any);
    expect(res.status).toBe(401);
  });
});
