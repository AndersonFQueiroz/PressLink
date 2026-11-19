import "./setup";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { senhaConfere } from "@/lib/supabase/password-check";

vi.mock("@/lib/supabase/password-check", () => ({ senhaConfere: vi.fn() }));

type MockOpts = {
  user?: { id: string; email: string | null } | null;
  perfil?: { username: string } | null;
  files?: Record<string, string[]>;
  listError?: { message: string } | null;
  removeError?: { message: string } | null;
  rpcError?: { message: string; code?: string } | null;
};

/**
 * Cliente Supabase mínimo para DELETE /api/conta: auth, perfil (username),
 * storage.list/remove e rpc. Os spies ficam expostos para as asserções.
 */
function mockSupabase(opts: MockOpts = {}) {
  const user = "user" in opts ? opts.user : { id: "user-1", email: "dj@presslink.test" };
  const perfil = "perfil" in opts ? opts.perfil : { username: "dj-presslink" };
  const files = opts.files ?? {};

  const maybeSingle = vi.fn(async () => ({ data: perfil, error: null }));
  const remove = vi.fn(async () => ({ error: opts.removeError ?? null }));
  const rpc = vi.fn(async () => ({ error: opts.rpcError ?? null }));
  const signOut = vi.fn(async () => ({ error: null }));
  const lists: Record<string, Mock> = {};

  const from = vi.fn(() => ({
    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) })),
  }));

  // `storage.from(bucket)` devolve o list/remove daquele bucket; `list` recebe
  // a pasta do usuário (não o bucket), então o mapa `files` é preso no closure.
  // Um `list` por bucket: a rota chama `storage.from(bucket)` de novo para o
  // remove, então o spy não pode ser recriado a cada chamada.
  const storageFrom = vi.fn((bucket: string) => {
    if (!lists[bucket]) {
      lists[bucket] = vi.fn(async () => ({
        data: (files[bucket] ?? []).map((name, i) => ({ id: `obj-${i}`, name })),
        error: opts.listError ?? null,
      }));
    }
    return { list: lists[bucket], remove };
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      signOut,
    },
    from,
    storage: { from: storageFrom },
    rpc,
    __spies: { maybeSingle, remove, rpc, signOut, lists },
  };
}

function req(body: unknown = { senha: "senha-certa" }): Request {
  return new Request("http://localhost/api/conta", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("DELETE /api/conta (issue #29)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(senhaConfere).mockResolvedValue(true);
  });

  it("401 quando não há sessão", async () => {
    vi.mocked(createClient).mockResolvedValue(mockSupabase({ user: null }) as never);
    const { DELETE } = await import("@/app/api/conta/route");
    const res = await DELETE(req());
    expect(res.status).toBe(401);
  });

  it("400 quando a senha não vem no corpo", async () => {
    vi.mocked(createClient).mockResolvedValue(mockSupabase() as never);
    const { DELETE } = await import("@/app/api/conta/route");
    const res = await DELETE(req({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Informe sua senha para confirmar" });
  });

  it("400 e nada apagado quando a senha está errada", async () => {
    vi.mocked(senhaConfere).mockResolvedValue(false);
    const client = mockSupabase();
    vi.mocked(createClient).mockResolvedValue(client as never);
    const { DELETE } = await import("@/app/api/conta/route");
    const res = await DELETE(req());
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Senha incorreta." });
    expect(client.__spies.remove).not.toHaveBeenCalled();
    expect(client.__spies.rpc).not.toHaveBeenCalled();
  });

  it("remove os arquivos dos dois buckets, apaga auth.users e encerra a sessão", async () => {
    const client = mockSupabase({
      files: {
        avatars: ["avatar.png"],
        galeria: ["foto-1.jpg", "foto-2.jpg"],
      },
    });
    vi.mocked(createClient).mockResolvedValue(client as never);
    const { DELETE } = await import("@/app/api/conta/route");

    const res = await DELETE(req());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, redirect: "/?conta=excluida" });

    expect(client.__spies.lists.avatars).toHaveBeenCalledWith("user-1", {
      limit: 100,
      offset: 0,
    });
    expect(client.__spies.remove).toHaveBeenNthCalledWith(1, ["user-1/avatar.png"]);
    expect(client.__spies.remove).toHaveBeenNthCalledWith(2, [
      "user-1/foto-1.jpg",
      "user-1/foto-2.jpg",
    ]);
    expect(client.__spies.rpc).toHaveBeenCalledWith("excluir_minha_conta");
    expect(client.__spies.signOut).toHaveBeenCalled();
  });

  it("não chama a exclusão da conta quando o Storage falha", async () => {
    const client = mockSupabase({
      files: { avatars: ["avatar.png"] },
      removeError: { message: "storage fora do ar" },
    });
    vi.mocked(createClient).mockResolvedValue(client as never);
    const { DELETE } = await import("@/app/api/conta/route");

    const res = await DELETE(req());

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("conta não foi excluída"),
    });
    expect(client.__spies.rpc).not.toHaveBeenCalled();
  });

  it("explica a migration quando a função ainda não existe no banco", async () => {
    const client = mockSupabase({
      rpcError: { message: "Could not find the function", code: "PGRST202" },
    });
    vi.mocked(createClient).mockResolvedValue(client as never);
    const { DELETE } = await import("@/app/api/conta/route");

    const res = await DELETE(req());

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      error: expect.stringContaining("04_exclusao_conta.sql"),
    });
  });
});
