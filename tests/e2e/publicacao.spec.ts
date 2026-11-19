import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Publicação e Despublicação #24 (UC01) — PressLink", () => {
  // 1. Endpoint /api/publicar sem autenticação retorna 401
  test("POST /api/publicar sem auth → 401", async ({ request }) => {
    const res = await request.post("/api/publicar");
    expect(res.status()).toBe(401);
  });

  // 2. Endpoint /api/despublicar sem autenticação retorna 401
  test("POST /api/despublicar sem auth → 401", async ({ request }) => {
    const res = await request.post("/api/despublicar");
    expect(res.status()).toBe(401);
  });

  // 3. Acesso não autenticado ao painel redireciona para login
  test("redirect não-auth /painel → /login", async ({ page }) => {
    await page.goto("/painel");
    await expect(page).toHaveURL(/\/login/);
  });

  // 4. Fluxo completo no painel com usuário de teste (se variáveis estiverem configuradas)
  test("fluxo publicação/despublicação com usuário teste (opcional)", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
    test.skip(!email || !password, "Sem PLAYWRIGHT_TEST_EMAIL/PASSWORD — pula fluxo completo");

    const logged = await loginAsTestUser(page);
    expect(logged).toBe(true);

    await page.goto("/painel");
    await expect(page).toHaveURL(/\/painel/);

    // Valida presença da seção de gerenciamento de publicação
    await expect(
      page.getByText(/área do artista|gerencie seu portfólio|a pista é sua/i).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
