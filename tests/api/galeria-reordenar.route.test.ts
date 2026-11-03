import "./setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabase } from "@/lib/test-utils/supabase-mock";
import { createClient } from "@/lib/supabase/server";

describe("PUT /api/galeria/reordenar", () => {
  beforeEach(() => { vi.resetAllMocks(); });
  it("401 sem auth", async () => {
    const mock = createMockSupabase({ user: null, perfil: null });
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { PUT } = await import("@/app/api/galeria/reordenar/route");
    const req = new Request("http://test/api/galeria/reordenar", { method: "PUT", body: JSON.stringify({ ids: ["00000000-0000-0000-0000-000000000001"] }) });
    const res = await PUT(req as any);
    expect(res.status).toBe(401);
  });
  it("400 quando ids vazio", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { PUT } = await import("@/app/api/galeria/reordenar/route");
    const req = new Request("http://test/api/galeria/reordenar", { method: "PUT", body: JSON.stringify({ ids: [] }) });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });
  it("400 quando id inválido uuid", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { PUT } = await import("@/app/api/galeria/reordenar/route");
    const req = new Request("http://test/api/galeria/reordenar", { method: "PUT", body: JSON.stringify({ ids: ["not-uuid"] }) });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });
  it("400 quando JSON inválido", async () => {
    const mock = createMockSupabase();
    vi.mocked(createClient).mockResolvedValue(mock as any);
    const { PUT } = await import("@/app/api/galeria/reordenar/route");
    const req = new Request("http://test/api/galeria/reordenar", { method: "PUT", body: "invalid-json" });
    // mock json parse will throw, route should catch
    (req.json as any) = async () => { throw new Error("bad json"); };
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });
});
