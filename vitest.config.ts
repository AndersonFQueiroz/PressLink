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
