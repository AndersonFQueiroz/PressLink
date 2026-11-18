// tests/unit/public-tables.test.ts — contrato entre a página pública e as migrações.
//
// Regressão do bug encontrado na revisão dos PRs #54/#55 (18/11/2026): a rota
// pública consultava `fotogaleria`, `linkdemidia` e `datadeshow`, mas as
// migrações criam `foto_galeria`, `link_de_midia` e `data_de_show`. O Supabase
// devolvia 404 silencioso e a página pública (e o preview do seletor de
// templates) exibia o portfólio sem fotos, mídias e agenda.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const raiz = path.resolve(__dirname, "../..");
const paginaPublica = readFileSync(
  path.join(raiz, "src/app/[username]/page.tsx"),
  "utf8",
);
const migracaoInicial = readFileSync(
  path.join(raiz, "supabase/migrations/01_initial_schema.sql"),
  "utf8",
);

const TABELAS = ["foto_galeria", "link_de_midia", "data_de_show"];

describe("página pública x nomes reais das tabelas", () => {
  it.each(TABELAS)("consulta a tabela %s pelo nome da migração", (tabela) => {
    expect(paginaPublica).toContain(`.from("${tabela}")`);
    expect(migracaoInicial).toContain(`create table public.${tabela}`);
  });

  it("não usa os nomes antigos sem underscore (que não existem no banco)", () => {
    for (const antiga of ["fotogaleria", "linkdemidia", "datadeshow"]) {
      expect(paginaPublica).not.toContain(`.from("${antiga}")`);
    }
  });
});
