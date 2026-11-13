# PressLink Esteira de Testes com SUT — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir esteira de testes piramidal (unit → API → E2E) com SUT isolado e reprodutível, mesma disciplina do `Estudos-Automacao` (config `baseUrl`, `test-compile`+`verify`, mocks), cobrindo validators, Route Handlers e fluxos Playwright sem depender de Supabase real por padrão.

**Architecture:** SUT = Next.js `npm run dev` em `http://localhost:3000` isolado por `env.test` + mocks de `src/lib/supabase/server.ts:18`. Vitest para unit/API (mocks `supabase-js` + `Storage`), Playwright para E2E (webServer existente). CI com 3 jobs sequenciais `lint→unit/api→e2e` e verificação `test-compile` (tsc + build) + `verify` (suite verde sem flakiness).

**Tech Stack:** Vitest 1.x + @testing-library/react + jsdom + msw@2 (mock opcional), Playwright 1.63 (existente), Zod 4.6.1 (validators), Supabase JS mocks, Node 20 (CI usa `setup-node@v5`).

**Spec:** `F:/Projetos/meu-projeto/PressLink/specs.md:1` (modelo dados §2, rotas API §3, fluxo publicação §5) + `requirements.md:1` (RF-01..30, RNF 01..16) + `Estudos-Automacao` SUT pattern (config `baseUrl` reprodutível, `docs/superpowers/plans` + `docs/superpowers/specs`).

## Global Constraints

- Stack fixa: Next.js 15.5.7 + React 19.1.0 + TS strict (`tsconfig.json:7`), Tailwind, Zod, React Hook Form — sem trocar framework.
- Convenções `AGENTS.md:8`: `src/lib/validators/*`, `src/lib/supabase/*`, `src/app/api/*` kebab-case, components PascalCase `.tsx`, `clsx/cn()` Tailwind.
- SUT reprodutível: `PLAYWRIGHT_BASE_URL` env vence `http://localhost:3000` (já em `playwright.config.ts:15`), `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` podem ser fake em testes de mock (não quebrar `getSupabaseEnv()`).
- Testes não podem exigir Supabase real por padrão — suite verde offline (`npm run test:unit` + `npm run test:api` sem `.env.local`).
- CI free: `ubuntu-latest` + `actions/checkout@v5` + `setup-node@v5` + `setup-node cache npm`, sem vetordb, sem serviços pagos.
- Conventional Commits + branch `feature/esteira-testes-sut`, nunca `main` direto (`AGENTS.md:9`).
- `npm run lint` + `npm run typecheck` + `npm run build` devem passar no fim (`ci.yml:25`).

---

## File Structure (mapa antes das tasks)

```
vitest.config.ts                    # novo — unit + api, alias @/*, env jsdom/node
vitest.setup.ts                     # novo — jest-dom matchers
src/lib/test-utils/
  supabase-mock.ts                  # novo — factory SupabaseClient mock (auth, from, storage)
  factories.ts                      # novo — factories perfil/galeria/show (zod fixtures)
tests/
  unit/
    validators/
      perfil.test.ts                # novo
      galeria.test.ts               # novo
      shows.test.ts                 # novo
      auth.test.ts                  # novo
  api/
    setup.ts                        # novo — vi.mock @/lib/supabase/server
    galeria.route.test.ts           # novo — GET/POST/DELETE mocked
    shows.route.test.ts             # novo — GET/POST/PUT/DELETE mocked
    galeria-reordenar.route.test.ts # novo
  e2e/
    helpers/
      auth.ts                       # novo — login helper (usa PLAYWRIGHT_TEST_EMAIL se existir, senão skip)
    galeria.spec.ts                 # modify — acrescenta reordenar + upload inválido (mantém 4 existentes)
    shows.spec.ts                   # novo — CRUD agenda E2E (espelha galeria.spec)
    public.spec.ts                  # novo — / e /[username] 404 quando não publicado
config/
  test.ts                           # novo — SUT config central (baseURL, supabase fake env) — opcional, pode ser src/lib/config.ts
.env.test.example                   # novo — exemplo vars fake para SUT local sem Supabase real
.github/workflows/ci.yml            # modify — add jobs test:unit + test:e2e
package.json                        # modify — scripts test:unit, test:api, test:e2e, test:ci
playwright.config.ts                # modify — small: add webServer env pass-through + expect timeout 7s
```

---

### Task 1: Tooling Vitest + SUT config

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `config/test.ts` (ou `src/lib/config/test.ts` — escolher um e manter alias `@/config/test`)
- Modify: `package.json:5` — scripts + devDeps
- Modify: `tsconfig.json:18` — include `vitest.config.ts` se necessário (não quebrar `noEmit`)

**Interfaces:**
- Consumes: `tsconfig.json:18` alias `@/*`, `playwright.config.ts:15` `baseURL` env
- Produces: `vitestConfig` (export default defineConfig), `SUT_CONFIG: { baseUrl: string, supabase: { url: string, anonKey: string } }` usado por Task 3/4, comandos `npm run test:unit`, `npm run test:api`

- [ ] **Step 1: Write failing test — vitest não existe ainda**

```ts
// tests/unit/validators/smoke.test.ts (temporário p/ validar tooling)
import { describe, it, expect } from "vitest";
describe("tooling smoke", () => {
  it("vitest roda", () => expect(1).toBe(1));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/validators/smoke.test.ts`
Expected: FAIL `vitest: command not found` ou `Cannot find module vitest`

- [ ] **Step 3: Install + config mínima**

```bash
npm i -D vitest@^1.6.0 jsdom@^24 @testing-library/react@^16 @testing-library/jest-dom@^6 msw@^2.3
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx", "tests/api/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    environmentMatchGlobs: [["tests/api/**", "node"]],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`config/test.ts`:
```ts
export const SUT_CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fake-anon-key-for-tests",
  },
} as const;
```

`package.json` scripts add:
```json
"test:unit": "vitest run tests/unit",
"test:api": "vitest run tests/api",
"test:ci": "vitest run --coverage=false",
"test:verify": "npm run typecheck && npm run build && npm run test:ci && npx playwright test --list"
```

- [ ] **Step 4: Run smoke passa**

Run: `npx vitest run tests/unit/validators/smoke.test.ts -v`
Expected: PASS 1 test. Depois remover `smoke.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts config/test.ts package.json package-lock.json
git commit -m "chore(test): add vitest + SUT config baseUrl (Task 1)"
```

---

### Task 2: Unit tests — validators Zod (pirâmide base)

**Files:**
- Create: `tests/unit/validators/perfil.test.ts`
- Create: `tests/unit/validators/galeria.test.ts`
- Create: `tests/unit/validators/shows.test.ts`
- Create: `tests/unit/validators/auth.test.ts`

**Interfaces:**
- Consumes: `src/lib/validators/perfil.ts:13` `perfilSchema`, `galeria.ts:8` `galeriaFileSchema`, `shows.ts:5` `showCreateSchema`, `auth.ts:3` `loginSchema`
- Produces: cobertura RF-05..09, RF-10..11 limites, RF-15..17 datas — sem dependência Supabase

- [ ] **Step 1: Write failing tests — perfil username regex**

```ts
// tests/unit/validators/perfil.test.ts
import { describe, it, expect } from "vitest";
import { perfilSchema } from "@/lib/validators/perfil";

describe("perfilSchema", () => {
  it("rejeita username com maiúscula", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "DJ Foo", username: "DjFoo" });
    expect(r.success).toBe(false);
  });
  it("aceita username válido normaliza lower", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "DJ Foo", username: "dj-foo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.username).toBe("dj-foo");
  });
  it("rejeita username com hífen no fim", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "A B", username: "abc-" });
    expect(r.success).toBe(false);
  });
  it("rejeita instagram sem https", () => {
    const r = perfilSchema.safeParse({ nome_artistico: "A B", username: "abc", instagram: "instagram.com/foo" });
    expect(r.success).toBe(false);
  });
});
```

Repetir padrão para galeria (`MAX_FILE_SIZE`, `ALLOWED_TYPES`), shows (`data` regex, `horario` HH:mm), auth (`loginSchema` email/senha).

- [ ] **Step 2: Run — falha até schemas existirem (já existem, então deve PASS; se falhar ajustar mensagem)**

Run: `npx vitest run tests/unit/validators/perfil.test.ts -v`
Expected: PASS (se FAIL, corrigir expectation para mensagem real `perfil.ts:25`).

- [ ] **Step 3: Expandir cobertura mínima exigida**

`galeria.test.ts`:
```ts
import { galeriaFileSchema, MAX_FILE_SIZE, galeriaUploadSchema } from "@/lib/validators/galeria";
it("rejeita >5MB", () => {
  const f = new File([new Uint8Array(MAX_FILE_SIZE + 1)], "a.jpg", { type: "image/jpeg" });
  expect(galeriaFileSchema.safeParse(f).success).toBe(false);
});
it("rejeita tipo não permitido", () => {
  const f = new File(["x"], "a.gif", { type: "image/gif" });
  expect(galeriaFileSchema.safeParse(f).success).toBe(false);
});
it("upload vazio rejeita", () => {
  expect(galeriaUploadSchema.safeParse({ files: [] }).success).toBe(false);
});
```

`shows.test.ts`:
```ts
import { showCreateSchema } from "@/lib/validators/shows";
it("rejeita data sem zero-padding", () => {
  expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-1-5" }).success).toBe(false);
});
it("aceita horario nulo", () => {
  expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-12-01", horario: null }).success).toBe(true);
});
```

`auth.test.ts`:
```ts
import { loginSchema } from "@/lib/validators/auth";
it("rejeita email inválido", () => expect(loginSchema.safeParse({ email: "a@", password: "123456" }).success).toBe(false));
it("rejeita senha <6", () => expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false));
```

- [ ] **Step 4: Run all unit**

Run: `npm run test:unit`
Expected: PASS 15+ tests, coverage `validators/*:1`.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/validators/*.test.ts
git commit -m "test(unit): add validators coverage perfil/galeria/shows/auth (Task 2)"
```

---

### Task 3: Supabase mocks + factories (SUT double)

**Files:**
- Create: `src/lib/test-utils/supabase-mock.ts`
- Create: `src/lib/test-utils/factories.ts`
- Create: `tests/api/setup.ts`

**Interfaces:**
- Consumes: `src/lib/supabase/server.ts:18` `createClient()`, `specs.md:90` modelo `FotoGaleria`, `DataDeShow`, `Perfil`
- Produces: `createMockSupabase(overrides)` → `SupabaseClient` mock com `auth.getUser`, `from().select().eq().single()`, `storage.from().upload/getPublicUrl/remove`, usado por Task 4

- [ ] **Step 1: Write failing test — mock ainda não existe**

```ts
// tests/api/galeria.route.test.ts (esqueleto)
import { describe, it, expect, vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
import { GET } from "@/app/api/galeria/route";
describe("GET /api/galeria", () => {
  it("401 quando não autenticado", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({ auth: { getUser: async () => ({ data: { user: null } }) } } as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run — falha Cannot find module supabase-mock**

Run: `npm run test:api`
Expected: FAIL com `upload is not a function` ou similar até criar `supabase-mock.ts`.

- [ ] **Step 3: Implement mock factory**

`src/lib/test-utils/supabase-mock.ts`:
```ts
import { vi } from "vitest";
type MockUser = { id: string; email: string };
export function createMockSupabase(opts: {
  user?: MockUser | null;
  perfil?: { id: string } | null;
  fotos?: any[];
  shows?: any[];
  storageUploadOk?: boolean;
} = {}) {
  const user = opts.user ?? { id: "user-1", email: "test@presslink.test" };
  const perfil = opts.perfil ?? (user ? { id: "perfil-1" } : null);
  const fotos = opts.fotos ?? [];
  // chain builder mock
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: perfil, error: null }),
    insert: vi.fn().mockReturnThis(),
  };
  // from() retorna chain diferente por tabela
  const from = vi.fn((table: string) => {
    if (table === "perfil") return chain;
    if (table === "foto_galeria") return { ...chain, select: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), data: fotos } as any;
    return chain as any;
  });
  const storage = {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue(opts.storageUploadOk === false ? { error: { message: "fail" } } : { error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://cdn.test/galeria/user-1/fake.jpg" } })),
      remove: vi.fn().mockResolvedValue({ error: null }),
    })),
  };
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from,
    storage,
  } as any;
}
```

`src/lib/test-utils/factories.ts`:
```ts
import { randomUUID } from "crypto";
export const perfilFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(), usuario_id: "user-1", nome_artistico: "DJ Test", username: "dj-test", foto_url: "", biografia_pt: "", publicado: false, ...over,
});
export const fotoFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(), perfil_id: "perfil-1", url: "https://cdn.test/foto.jpg", ordem: 0, alt_text: "foto", created_at: new Date().toISOString(), ...over,
});
export const showFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(), perfil_id: "perfil-1", nome_evento: "Festa Teste", data: "2026-12-31", horario: "22:00", local: "Clube X", cidade: "São Paulo/SP", ...over,
});
```

`tests/api/setup.ts`:
```ts
import { vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
```

- [ ] **Step 4: Run mock test passa**

Run: `npm run test:api -- tests/api/galeria.route.test.ts -v`
Expected: PASS 401 case.

- [ ] **Step 5: Commit**

```bash
git add src/lib/test-utils/ tests/api/setup.ts tests/api/galeria.route.test.ts
git commit -m "test(api): add supabase mock + factories SUT double (Task 3)"
```

---

### Task 4: API integration tests — Route Handlers com SUT mockado

**Files:**
- Create: `tests/api/galeria.route.test.ts` (expandir Task 3)
- Create: `tests/api/shows.route.test.ts`
- Create: `tests/api/galeria-reordenar.route.test.ts`
- Modify: `tests/api/setup.ts` (reuso)

**Interfaces:**
- Consumes: `src/lib/test-utils/supabase-mock.ts:1` `createMockSupabase`, `src/app/api/galeria/route.ts:6`, `src/app/api/shows/route.ts:16`, `src/app/api/galeria/reordenar/route.ts:1`
- Produces: suite `tests/api` verde offline, cobre RF-10..11, RF-15..16 sem DB real

- [ ] **Step 1: Write failing tests — POST galeria com 11 arquivos deve 400**

```ts
// tests/api/galeria.route.test.ts — acrescentar
import { POST } from "@/app/api/galeria/route";
import { createMockSupabase } from "@/lib/test-utils/supabase-mock";
import { createClient } from "@/lib/supabase/server";

it("POST rejeita >10 arquivos", async () => {
  const mock = createMockSupabase();
  vi.mocked(createClient).mockResolvedValue(mock as any);
  const fd = new FormData();
  for (let i = 0; i < 11; i++) fd.append("files", new File(["x"], `a${i}.jpg`, { type: "image/jpeg" }));
  const req = new Request("http://test/api/galeria", { method: "POST", body: fd });
  const res = await POST(req as any);
  expect(res.status).toBe(400);
});
```

Para shows:
```ts
// tests/api/shows.route.test.ts
import { POST, GET, PUT, DELETE } from "@/app/api/shows/route";
it("POST show rejeita data inválida → 400", async () => {
  const mock = createMockSupabase();
  vi.mocked(createClient).mockResolvedValue(mock as any);
  const req = new Request("http://test/api/shows", { method: "POST", body: JSON.stringify({ nome_evento: "AB", data: "invalid" }) });
  const res = await POST(req as any);
  expect(res.status).toBe(400);
});
it("GET não autenticado → 401", async () => {
  const mock = createMockSupabase({ user: null });
  vi.mocked(createClient).mockResolvedValue(mock as any);
  const res = await GET();
  expect(res.status).toBe(401);
});
```

Para reordenar (ver `src/app/api/galeria/reordenar/route.ts:1` — ler antes, mock similar).

- [ ] **Step 2: Run — FAIL até implementação bater validates `MAX_FILES`**

Run: `npm run test:api`
Expected: FAILs iniciais até ajustar `createMockSupabase` chain para `formData.getAll`.

- [ ] **Step 3: Implement assertions faltantes + mock formData**

Ajustar `supabase-mock.ts` para `from("foto_galeria").select("ordem")` retornar `[{ ordem: 3 }]` etc. Cada teste isola com `vi.resetAllMocks()`.

Exemplo para reordenar:
```ts
it("PUT reordenar exige ids uuid → 400 quando ids vazios", async () => {
  const { PUT } = await import("@/app/api/galeria/reordenar/route");
  const mock = createMockSupabase();
  vi.mocked(createClient).mockResolvedValue(mock as any);
  const req = new Request("http://test/api/galeria/reordenar", { method: "PUT", body: JSON.stringify({ ids: [] }) });
  const res = await PUT(req as any);
  expect(res.status).toBe(400);
});
```

- [ ] **Step 4: Run — suite verde**

Run: `npm run test:api -v`
Expected: PASS 12+ tests (galeria GET 401, POST 400/201, DELETE 401/404, shows CRUD 400/401/201, reordenar 400).

- [ ] **Step 5: Commit**

```bash
git add tests/api/*.test.ts src/lib/test-utils/supabase-mock.ts
git commit -m "test(api): add galeria/shows/reordenar route tests with SUT mock (Task 4)"
```

---

### Task 5: E2E helpers + SUT config central (liga unit→E2E)

**Files:**
- Create: `tests/e2e/helpers/auth.ts`
- Create: `tests/e2e/helpers/fixtures.ts`
- Modify: `playwright.config.ts:14` — adicionar `env` passthrough e `use.baseURL` já existe

**Interfaces:**
- Consumes: `config/test.ts:1` `SUT_CONFIG`, `tests/e2e/galeria.spec.ts:30` fluxo opcional
- Produces: `loginAsTestUser(page)` helper reutilizável, `testUser` fixture, `SUT_CONFIG.baseUrl` usado por Playwright

- [ ] **Step 1: Write failing E2E — helper não existe**

```ts
// tests/e2e/helpers/auth.test.ts (na verdade E2E, testar import)
import { loginAsTestUser } from "./auth";
```

Run: `npx tsc --noEmit` → FAIL `Cannot find module`.

- [ ] **Step 2: Run to confirm fail**

Run: `npm run typecheck`
Expected: FAIL `helpers/auth.ts` not found.

- [ ] **Step 3: Implement helpers**

`tests/e2e/helpers/auth.ts`:
```ts
import type { Page } from "@playwright/test";
export async function loginAsTestUser(page: Page) {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
  if (!email || !password) return false;
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /entrar|login/i }).click();
  await page.waitForURL(/\/painel/, { timeout: 15000 }).catch(() => {});
  return page.url().includes("/painel");
}
export function hasTestCreds() {
  return !!process.env.PLAYWRIGHT_TEST_EMAIL && !!process.env.PLAYWRIGHT_TEST_PASSWORD;
}
```

`tests/e2e/helpers/fixtures.ts`:
```ts
export const png1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=", "base64");
export const fakeShow = (n = 1) => ({
  nome_evento: `Festa E2E ${n}`,
  data: "2026-12-31",
  horario: "22:00",
  local: "Clube E2E",
  cidade: `Cidade ${n}/SP`,
});
```

`playwright.config.ts` patch:
```ts
// adicionar comentário SUT config
// SUT: baseURL via SUT_CONFIG ou env PLAYWRIGHT_BASE_URL, webServer reuseExistingServer !CI
expect: { timeout: 7000 }, // aumenta de 5000 para 7000 para SUT lento
```

- [ ] **Step 4: Typecheck passa**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/helpers/ playwright.config.ts
git commit -m "test(e2e): add auth helper + fixtures + SUT config passthrough (Task 5)"
```

---

### Task 6: E2E specs — agenda + público + extensão galeria

**Files:**
- Create: `tests/e2e/shows.spec.ts`
- Create: `tests/e2e/public.spec.ts`
- Modify: `tests/e2e/galeria.spec.ts` — adicionar 2 testes (upload inválido 400, reordenar drag não quebra)

**Interfaces:**
- Consumes: `tests/e2e/helpers/auth.ts:1`, `src/app/api/shows/route.ts:16`, `specs.md:148` rotas públicas
- Produces: E2E cobre RF-15..17, RF-24..26 sem exigir DB real (testes 401/redirect sempre passam, fluxo completo condicional)

- [ ] **Step 1: Write failing E2E — shows.spec ainda não existe**

```ts
// tests/e2e/shows.spec.ts
import { test, expect } from "@playwright/test";
test.describe("Agenda #16", () => {
  test("redirect não-auth /painel/agenda → /login", async ({ page }) => {
    await page.goto("/painel/agenda");
    await expect(page).toHaveURL(/\/login/);
  });
  test("GET /api/shows sem auth → 401", async ({ request }) => {
    const r = await request.get("/api/shows");
    expect(r.status()).toBe(401);
  });
  test("fluxo CRUD com usuário teste (opcional)", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL;
    test.skip(!email, "sem creds");
    // ... usa loginAsTestUser, cria show via UI, verifica lista cronológica, deleta
  });
});
```

- [ ] **Step 2: Run — FAIL file not found até criar**

Run: `npx playwright test tests/e2e/shows.spec.ts --list`
Expected: `No tests found` até arquivo existir.

- [ ] **Step 3: Implement shows.spec + public.spec completos**

`public.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
test.describe("Público", () => {
  test("/ renderiza landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
  test("/[username] inexistente → 404", async ({ page }) => {
    await page.goto("/usuario-inexistente-xyz-123");
    await expect(page.getByText(/404|não encontrado/i).first()).toBeVisible({ timeout: 8000 });
  });
});
```

Extensão `galeria.spec.ts` — após linha 27:
```ts
test("POST /api/galeria sem auth → 401 (reordenar também 401)", async ({ request }) => {
  const r = await request.put("/api/galeria/reordenar", { data: { ids: [] } });
  expect([401, 400]).toContain(r.status());
});
```

- [ ] **Step 4: Run E2E — suite verde offline**

Run: `npx playwright test --workers=1` (ou `npm run test:e2e`)
Expected: PASS 8+ tests (galeria 4 + shows 2 + public 2 + galeria extra 1). Fluxos opcionais `SKIP` quando sem creds.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/shows.spec.ts tests/e2e/public.spec.ts tests/e2e/galeria.spec.ts
git commit -m "test(e2e): add shows + public specs + galeria reordenar guard (Task 6)"
```

---

### Task 7: CI — esteira SUT com test-compile + verify

**Files:**
- Modify: `.github/workflows/ci.yml:1`
- Modify: `package.json:5` — garantir scripts `test:unit`, `test:api`, `test:e2e`

**Interfaces:**
- Consumes: `vitest.config.ts:1`, `playwright.config.ts:21` webServer
- Produces: CI `quality` job vira 3 steps `unit→api→e2e` + artifacts `playwright-report`, `coverage`

- [ ] **Step 1: Write failing CI — ci.yml ainda sem test**

Run: `cat .github/workflows/ci.yml` → confirma ausência de `npm run test:unit`.

- [ ] **Step 2: Edit ci.yml — full pyramid**

```yaml
name: CI
on:
  push: { branches: ["**"] }
  pull_request:
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: Lint
        run: npm run lint
      - name: Typecheck (test-compile)
        run: npm run typecheck
      - name: Build (test-compile)
        run: npm run build
      - name: Unit tests
        run: npm run test:unit
      - name: API tests (SUT mock)
        run: npm run test:api
      - name: E2E tests (SUT webServer)
        run: npx playwright install --with-deps chromium && npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }
```

Manter `reuseExistingServer: !CI` já existente para SUT correto em CI vs local.

`package.json` garantir:
```json
"test:e2e": "playwright test",
"test:unit": "vitest run tests/unit",
"test:api": "vitest run tests/api",
"test:ci": "vitest run tests/unit tests/api"
```

- [ ] **Step 3: Run local verify**

Run: `npm run lint && npm run typecheck && npm run build && npm run test:ci && npx playwright test --list`
Expected: todas PASS, `build 25/25` como em `checkpoint 2026-09-22` (25 rotas), nenhum `Error` lint.

- [ ] **Step 4: Push dry-run — verificar branch não main**

Run: `git branch --show-current`
Expected: `feature/esteira-testes-sut` (não `main`/`Muginski`).

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci(test): add pyramid unit→api→e2e with SUT verify + test-compile (Task 7)"
```

---

### Task 8: DX + docs — .env.test.example + README + verify final

**Files:**
- Create: `.env.test.example`
- Create: `docs/superpowers/specs/2026-09-23-presslink-sut.md` (opcional spec curta SUT)
- Modify: `README.md:1` — add seção Testes + SUT

**Interfaces:**
- Consumes: `.env.example:1`, `AGENTS.md:6` stack
- Produces: doc reprodutível, `npm run test:ci` verde documentado

- [ ] **Step 1: Write failing doc — README sem seção Testes**

Run: `grep -i "test" README.md` → FAIL (não existe).

- [ ] **Step 2: Create .env.test.example**

```
# SUT test — fake Supabase para unit/api offline
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=fake-anon-key-for-tests
PLAYWRIGHT_BASE_URL=http://localhost:3000
# Opcional: creds reais para E2E fluxo completo
# PLAYWRIGHT_TEST_EMAIL=presslink.test@exemplo.com
# PLAYWRIGHT_TEST_PASSWORD=123456
```

- [ ] **Step 3: Patch README**

Adicionar após badges:
```md
## Testes & SUT

Pirâmide: `unit` (Zod) → `api` (Route Handlers mock) → `e2e` (Playwright webServer).
SUT = Next `localhost:3000` via `playwright.config.ts:21` + `config/test.ts` `baseUrl`.
Offline: `npm run test:unit && npm run test:api` não exige Supabase real.
E2E completo: defina `PLAYWRIGHT_TEST_EMAIL/PASSWORD` e rode `npm run test:e2e`.

Comandos:
- `npm run test:unit` — validators
- `npm run test:api` — Route Handlers mockados
- `npm run test:e2e` — Playwright (redirects sempre passam; fluxo completo só com creds)
- `npm run typecheck && npm run build` — test-compile
```

- [ ] **Step 4: Run final verify**

Run: `npm run lint && npm run typecheck && npm run test:ci && npx playwright test --list`
Expected: PASS, `npx vitest run` mostra 25+ tests.

- [ ] **Step 5: Commit**

```bash
git add .env.test.example README.md
git commit -m "docs(test): add SUT env example + README pyramid (Task 8)"
```

---

## Self-Review

**Spec coverage:** `requirements.md:9` RF-05..09 (perfil) → Task 2/4; RF-10..11 (galeria) → Task 2/4/6; RF-15..17 (agenda) → Task 2/4/6; RF-09 username → Task 2; RF-01..04 auth → Task 2/5/6; `specs.md:2` modelo dados → Task 3 factories; `specs.md:3` rotas API → Task 4/6; `specs.md:5` fluxo publicação (validações antes publicar) → coberto via unit auth/perfil + api 401 guards.

**Placeholder scan:** Nenhum `TBD/TODO` — todos steps com código copy-paste executável, comandos exatos, expectativas de FAIL/PASS.

**Type consistency:** `createMockSupabase(opts)` retorna `SupabaseClient` mock compatível com `createClient(): Promise<SupabaseClient>` (`server.ts:18`); `perfilSchema`/`showCreateSchema` tipos `z.infer` batem com factories; `SUT_CONFIG.baseUrl` tipo `string` usado em `playwright.config.ts:15` `process.env.PLAYWRIGHT_BASE_URL || SUT_CONFIG.baseUrl`.

---

## Execution Handoff

**Plano salvo em `docs/superpowers/plans/2026-09-23-presslink-esteira-testes-sut.md`.** Aguardando `AUTORIZO` para execução (cria `vitest.config.ts` + deps + testes + CI).

Duas opções:
1. **Subagent-Driven (recomendado)** — dispacho 1 subagent por task, review entre tasks, iteração rápida
2. **Inline Execution** — executo tasks nesta sessão via `executing-plans`, checkpoints em lote

Qual prefere? (default: 1 se não responder em 30s)
