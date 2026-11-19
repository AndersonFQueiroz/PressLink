import "./setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/server";

describe("POST /api/publicar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("401 quando não autenticado", async () => {
    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/publicar/route");
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("404 quando perfil não existe", async () => {
    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      })),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/publicar/route");
    const res = await POST();
    expect(res.status).toBe(404);
  });

  it("400 com lista de pendências quando requisitos obrigatórios faltam", async () => {
    const mockPerfil = {
      id: "perfil-1",
      nome_artistico: "",
      username: "kronos",
      publicado: false,
    };

    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === "perfil") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(async () => ({ data: mockPerfil, error: null })),
          };
        }
        if (table === "foto_galeria") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(async () => ({ count: 0, error: null })),
          };
        }
        if (table === "link_de_midia") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(async () => ({ count: 0, error: null })),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/publicar/route");
    const res = await POST();
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.pendencias).toBeDefined();
    expect(json.pendencias).toContain("Nome artístico é obrigatório.");
    expect(json.pendencias).toContain("É necessário cadastrar pelo menos 1 foto na galeria.");
    expect(json.pendencias).toContain("É necessário cadastrar pelo menos 1 link de música ou vídeo.");
  });

  it("200 publica com sucesso quando todos os requisitos estão preenchidos", async () => {
    const mockPerfil = {
      id: "perfil-1",
      nome_artistico: "DJ Kronos",
      username: "kronos",
      publicado: false,
    };

    const updateSpy = vi.fn(async () => ({ error: null }));

    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === "perfil") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(async () => ({ data: mockPerfil, error: null })),
            update: vi.fn(() => ({
              eq: updateSpy,
            })),
          };
        }
        if (table === "foto_galeria") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(async () => ({ count: 2, error: null })),
          };
        }
        if (table === "link_de_midia") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(async () => ({ count: 1, error: null })),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/publicar/route");
    const res = await POST();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.publicado).toBe(true);
    expect(json.displayUrl).toBe(json.url.replace(/^https?:\/\//, ""));
    expect(json.displayUrl).toContain("/kronos");
    expect(json.url).toContain("kronos");
  });
});

describe("POST /api/despublicar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("401 quando não autenticado", async () => {
    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/despublicar/route");
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("200 despublica com sucesso", async () => {
    const mockPerfil = {
      id: "perfil-1",
      username: "kronos",
      publicado: true,
    };

    const updateSpy = vi.fn(async () => ({ error: null }));

    const mock = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
      },
      from: vi.fn((table: string) => {
        if (table === "perfil") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(async () => ({ data: mockPerfil, error: null })),
            update: vi.fn(() => ({
              eq: updateSpy,
            })),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/despublicar/route");
    const res = await POST();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.publicado).toBe(false);
  });
});
