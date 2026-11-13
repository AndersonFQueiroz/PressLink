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
