import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";
import config from "../playwright.config";

const PL_PORT = process.env.PL_PORT || "3210";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PL_PORT}`;

export default defineConfig(config, {
  testDir: "./e2e",
  outputDir: "../FOTOS-DRY/qa-2026-11-25/test-results",
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: resolve("FOTOS-DRY/qa-2026-11-25/e2e-results.json") }],
    ["html", { open: "never", outputFolder: resolve("FOTOS-DRY/qa-2026-11-25/playwright-report") }],
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
