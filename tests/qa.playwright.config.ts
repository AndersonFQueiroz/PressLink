import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
import config from "../playwright.config";

const PL_PORT = process.env.PL_PORT || "3210";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PL_PORT}`;
// Pasta dos relatórios: PL_QA_DIR permite reaproveitar o harness em outras
// rodadas; o padrão mantém a evidência da QA de 25/11.
const QA_DIR = resolve(process.env.PL_QA_DIR || "FOTOS-DRY/qa-2026-11-25");

export default defineConfig(config, {
  testDir: "./e2e",
  outputDir: resolve(QA_DIR, "test-results"),
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: resolve(QA_DIR, "e2e-results.json") }],
    ["html", { open: "never", outputFolder: resolve(QA_DIR, "playwright-report") }],
  ],
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
    video: "off",
  },
  webServer: {
    ...config.webServer,
    command: `npm run dev -- -p ${PL_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
