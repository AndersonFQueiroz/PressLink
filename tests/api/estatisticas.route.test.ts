import "./setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/supabase/server";

describe("POST /api/estatisticas/registrar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("400 quando tipo de evento é inválido ou ausente", async () => {
    const { POST } = await import("@/app/api/estatisticas/registrar/route");
    const req = new Request("http://localhost:3000/api/estatisticas/registrar", {
      method: "POST",
      body: JSON.stringify({ tipo: "tipo_invalido" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("400 quando nenhum identificador (perfil_id ou username) é enviado", async () => {
    const { POST } = await import("@/app/api/estatisticas/registrar/route");
    const req = new Request("http://localhost:3000/api/estatisticas/registrar", {
      method: "POST",
      body: JSON.stringify({ tipo: "page_view" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("404 quando username não existe ou perfil está despublicado", async () => {
    const mock = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      })),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/estatisticas/registrar/route");
    const req = new Request("http://localhost:3000/api/estatisticas/registrar", {
      method: "POST",
      body: JSON.stringify({ username: "nao-existe", tipo: "page_view" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("201 registra evento com sucesso via perfil_id", async () => {
    const insertSpy = vi.fn().mockImplementation(() => Promise.resolve({ error: null }));
    const mock = {
      from: vi.fn(() => ({
        insert: insertSpy,
      })),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/estatisticas/registrar/route");
    const req = new Request("http://localhost:3000/api/estatisticas/registrar", {
      method: "POST",
      headers: { "x-forwarded-for": "192.168.1.100" },
      body: JSON.stringify({ perfil_id: "perfil-123", tipo: "page_view" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(insertSpy).toHaveBeenCalledTimes(1);

    const callArg = (insertSpy.mock.calls as any)[0]?.[0] as { perfil_id: string; tipo: string; ip_hash: string } | undefined;
    expect(callArg?.perfil_id).toBe("perfil-123");
    expect(callArg?.tipo).toBe("page_view");
    expect(callArg?.ip_hash).toBeDefined();
    // Garante que o IP foi anonimizado e não salvo em texto claro
    expect(callArg?.ip_hash).not.toContain("192.168.1.100");
  });

  it("201 registra evento de clique em WhatsApp resolvendo username", async () => {
    const insertSpy = vi.fn().mockImplementation(() => Promise.resolve({ error: null }));
    const mock = {
      from: vi.fn((table: string) => {
        if (table === "perfil") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(async () => ({ data: { id: "perfil-resolved" }, error: null })),
          };
        }
        return {
          insert: insertSpy,
        };
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { POST } = await import("@/app/api/estatisticas/registrar/route");
    const req = new Request("http://localhost:3000/api/estatisticas/registrar", {
      method: "POST",
      body: JSON.stringify({ username: "djkronos", tipo: "click_whatsapp" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(insertSpy).toHaveBeenCalledTimes(1);
    const callArg = (insertSpy.mock.calls as any)[0]?.[0] as { perfil_id: string; tipo: string } | undefined;
    expect(callArg?.perfil_id).toBe("perfil-resolved");
    expect(callArg?.tipo).toBe("click_whatsapp");
  });
});

const PERFIL_PADRAO = { id: "perfil-1", username: "kronos", publicado: true };

/**
 * Meio-dia em Brasília (UTC-3) do dia pedido.
 *
 * A API fecha os dias no fuso de São Paulo, então o teste não pode usar o fuso
 * da máquina: no CI (TZ=UTC) o "meio-dia local" caía de madrugada em Brasília e
 * virava o dia seguinte, saindo do período e zerando os totais.
 */
function diasAtras(dias: number, horas = 12): string {
  const agoraEmBrasilia = new Date(Date.now() - 3 * 3_600_000);
  const meiaNoiteEmBrasilia =
    Date.UTC(
      agoraEmBrasilia.getUTCFullYear(),
      agoraEmBrasilia.getUTCMonth(),
      agoraEmBrasilia.getUTCDate(),
    ) -
    dias * 86_400_000 +
    (horas + 3) * 3_600_000;

  return new Date(meiaNoiteEmBrasilia).toISOString();
}

function evento(tipo: string, created_at: string) {
  return { tipo, created_at };
}

type CenarioEventos = {
  paginas: Array<Array<{ tipo: string; created_at: string }>>;
  erro?: string | null;
  perfil?: typeof PERFIL_PADRAO | null;
};

function criarCliente({ paginas, erro = null, perfil = PERFIL_PADRAO }: CenarioEventos) {
  let chamadas = 0;

  const range = vi.fn(async () => {
    const indice = Math.min(chamadas, paginas.length - 1);
    chamadas += 1;

    if (erro) return { data: null, error: { message: erro } };
    return { data: paginas[indice] ?? [], error: null };
  });

  const eventosBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range,
  };

  const perfilBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: perfil, error: null })),
  };

  const mock = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
    },
    from: vi.fn((table: string) => {
      if (table === "perfil") return perfilBuilder;
      return eventosBuilder;
    }),
  };

  return { mock, range, eventosBuilder };
}

function requisicao(query = "") {
  return new Request(`http://localhost:3000/api/estatisticas${query}`);
}

describe("GET /api/estatisticas", () => {
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

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao());
    expect(res.status).toBe(401);
  });

  it("404 quando perfil não existe", async () => {
    const { mock } = criarCliente({ paginas: [[]], perfil: null });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao());
    expect(res.status).toBe(404);
  });

  it("200 devolve totais, canais, variação e série diária (30 dias por padrão)", async () => {
    const { mock } = criarCliente({
      paginas: [
        [
          evento("page_view", diasAtras(0)),
          evento("page_view", diasAtras(1)),
          evento("page_view", diasAtras(2)),
          evento("click_whatsapp", diasAtras(0)),
          evento("click_email", diasAtras(1)),
          // período anterior de comparação
          evento("page_view", diasAtras(31)),
          evento("page_view", diasAtras(32)),
          evento("click_whatsapp", diasAtras(31)),
        ],
      ],
    });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao());
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const json = await res.json();

    expect(json.periodo).toBe(30);
    expect(json.totalVisualizacoes).toBe(3);
    expect(json.totalCliques).toBe(2);
    expect(json.detalhes).toEqual({ whatsapp: 1, email: 1, formulario: 0 });
    expect(json.anterior).toMatchObject({
      totalVisualizacoes: 2,
      totalCliques: 1,
    });
    expect(json.variacoes.visualizacoes).toBe(50);
    expect(json.variacoes.cliques).toBe(100);
    expect(json.serie).toHaveLength(30);
    expect(json.totalEventos).toBe(5);
    expect(json.diasComDados).toBe(3);
    expect(json.truncado).toBe(false);
    expect(json.username).toBe("kronos");
  });

  it("respeita ?periodo=7", async () => {
    const { mock } = criarCliente({ paginas: [[]] });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao("?periodo=7"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.periodo).toBe(7);
    expect(json.serie).toHaveLength(7);
  });

  it("ignora período inválido e cai no padrão de 30 dias", async () => {
    const { mock } = criarCliente({ paginas: [[]] });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao("?periodo=abc"));
    const json = await res.json();

    expect(json.periodo).toBe(30);
  });

  it("500 quando a consulta de eventos falha", async () => {
    const { mock } = criarCliente({ paginas: [[]], erro: "db fora" });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao());
    expect(res.status).toBe(500);
  });

  it("pagina a leitura acima do limite de 1000 linhas do PostgREST", async () => {
    const primeiraPagina = Array.from({ length: 1000 }, () =>
      evento("page_view", diasAtras(0)),
    );

    const { mock, range } = criarCliente({
      paginas: [primeiraPagina, [evento("page_view", diasAtras(0))]],
    });
    vi.mocked(createClient).mockResolvedValue(mock as any);

    const { GET } = await import("@/app/api/estatisticas/route");
    const res = await GET(requisicao());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(range).toHaveBeenCalledTimes(2);
    expect(json.totalVisualizacoes).toBe(1001);
    expect(json.truncado).toBe(false);
  });
});
