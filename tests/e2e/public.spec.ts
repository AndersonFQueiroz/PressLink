import { test, expect } from "@playwright/test";

test.describe("Público — PressLink", () => {
  test("/ renderiza landing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("/[username] inexistente → 404", async ({ page }) => {
    await page.goto("/usuario-inexistente-xyz-123");
    await expect(page.getByText(/404|não encontrado/i).first()).toBeVisible({ timeout: 10000 }).catch(async () => {
      // fallback: status 404 via response
      const r = await page.request.get("/usuario-inexistente-xyz-123");
      expect(r.status()).toBe(404);
    });
  });

  test("/login e /cadastro renderizam", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });
    await page.goto("/cadastro");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 }).catch(async () => {
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  });

  // #31 — cabeçalhos de segurança presentes em todas as respostas (:path*).
  // Guarda contra regressão: se alguém mexer em next.config.ts, a suíte cai.
  test("respostas trazem CSP + HSTS + nosniff (#31)", async ({ request }) => {
    const r = await request.get("/");
    expect(r.status()).toBe(200);
    const headers = r.headers();
    const csp = headers["content-security-policy"];
    expect(csp, "Content-Security-Policy ausente").toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-src");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});
