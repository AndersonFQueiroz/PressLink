import { globalIgnores } from "eslint/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  globalIgnores([
    ".next/**",
    ".next-build/**",
    ".next-dev/**",
    "node_modules/**",
    "out/**",
    "next-env.d.ts",
    // Ferramentas de design instaladas no projeto (skills): scripts empacotados
    // e minificados, não fazem parte do código do produto.
    ".opencode/**",
    ".agents/**",
  ]),
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["tests/**/*", "src/lib/test-utils/**/*", "config/**/*", "vitest.*"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
