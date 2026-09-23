import { vi } from "vitest";

type MockUser = { id: string; email: string };

export function createMockSupabase(opts: {
  user?: MockUser | null;
  perfil?: { id: string } | null;
  fotos?: any[];
  shows?: any[];
  storageUploadOk?: boolean;
} = {}) {
  const hasExplicitUser = "user" in opts;
  const user = hasExplicitUser ? opts.user : ({ id: "user-1", email: "test@presslink.test" } as MockUser);
  const perfilExists = "perfil" in opts ? opts.perfil : user ? { id: "perfil-1" } : null;
  const fotos = opts.fotos ?? [];
  const shows = opts.shows ?? [];

  function makeBuilder(table: string, initialData: any = null) {
    const builder: any = {
      _table: table,
      _data: initialData,
      select: vi.fn(function () {
        return builder;
      }),
      eq: vi.fn(function () {
        return builder;
      }),
      in: vi.fn(function () {
        return builder;
      }),
      order: vi.fn(function () {
        return builder;
      }),
      limit: vi.fn(function () {
        return builder;
      }),
      insert: vi.fn(function (payload: any) {
        return {
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: { id: "new-id", ...payload, perfil_id: (perfilExists as any)?.id ?? "perfil-1" }, error: null })),
          })),
        };
      }),
      update: vi.fn(function () {
        return {
          eq: vi.fn(function () {
            return {
              eq: vi.fn(function () {
                return {
                  select: vi.fn(() => ({
                    single: vi.fn(async () => ({ data: { id: "updated-id" }, error: null })),
                  })),
                };
              }),
              select: vi.fn(() => ({
                single: vi.fn(async () => ({ data: { id: "updated-id" }, error: null })),
              })),
            };
          }),
          select: vi.fn(() => ({
            single: vi.fn(async () => ({ data: { id: "updated-id" }, error: null })),
          })),
        };
      }),
      delete: vi.fn(function () {
        return {
          eq: vi.fn(function () {
            return {
              eq: vi.fn(async () => ({ error: null })),
            };
          }),
        };
      }),
      single: vi.fn(async () => {
        if (table === "perfil") return { data: perfilExists, error: null };
        if (table === "foto_galeria") {
          // for single foto fetch by id
          if (fotos.length) return { data: fotos[0], error: null };
          return { data: null, error: { message: "not found" } };
        }
        if (table === "data_de_show") {
          if (shows.length) return { data: shows[0], error: null };
          return { data: null, error: { message: "not found" } };
        }
        return { data: null, error: null };
      }),
      // thenable for await builder without single (list query)
      then: undefined as any,
    };
    // make thenable so `await supabase.from(...).select(...).eq(...).order(...)` resolves
    builder.then = (resolve: any) => {
      let data: any = null;
      const error: any = null;
      if (table === "perfil") data = perfilExists;
      else if (table === "foto_galeria") data = fotos;
      else if (table === "data_de_show") data = shows;
      return Promise.resolve({ data, error }).then(resolve);
    };
    // also support .in chaining returning builder with thenable
    return builder;
  }

  const from = vi.fn((table: string) => makeBuilder(table));

  const storageFrom = vi.fn(() => ({
    upload: vi.fn().mockResolvedValue(opts.storageUploadOk === false ? { error: { message: "fail" } } : { error: null }),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://cdn.test/galeria/user-1/fake.jpg" } })),
    remove: vi.fn().mockResolvedValue({ error: null }),
  }));

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from,
    storage: { from: storageFrom },
  } as any;
}
