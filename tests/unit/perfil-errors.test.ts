// tests/unit/perfil-errors.test.ts — texto de erro do PUT /api/perfil
//
// Regressão 18/11/2026: sem a migration 03, o painel mostrava o texto cru do
// Postgres ("Could not find the 'template_slug' column ... schema cache") para
// o DJ, sem dizer o que fazer.
import { describe, it, expect } from "vitest";
import {
  MENSAGEM_MIGRATION_PENDENTE,
  MENSAGEM_SESSAO_EXPIRADA,
  explainPerfilSaveError,
} from "@/lib/perfil-errors";

describe("explainPerfilSaveError", () => {
  it("explica a coluna faltando como migration pendente", () => {
    const msg =
      "Could not find the 'template_slug' column of 'perfil' in the schema cache";

    expect(explainPerfilSaveError(500, msg)).toBe(MENSAGEM_MIGRATION_PENDENTE);
  });

  it("reconhece o código 42703 mesmo com outra redação", () => {
    expect(
      explainPerfilSaveError(500, 'column "template_slug" does not exist'),
    ).toBe(MENSAGEM_MIGRATION_PENDENTE);
  });

  it("sessão expirada vira pedido de novo login", () => {
    expect(explainPerfilSaveError(401, "Não autenticado")).toBe(
      MENSAGEM_SESSAO_EXPIRADA,
    );
  });

  it("erro desconhecido mantém a mensagem da API", () => {
    expect(explainPerfilSaveError(409, "Username já está em uso")).toBe(
      "Username já está em uso",
    );
  });

  it("sem mensagem inventa um texto útil com o status", () => {
    expect(explainPerfilSaveError(502, "")).toBe("Falha ao salvar (HTTP 502)");
    expect(explainPerfilSaveError(400, null)).toMatch(/Dados inválidos/);
  });
});
