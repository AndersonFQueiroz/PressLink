// tests/unit/erros-painel.test.ts — erros do painel com ação (19/11/2026)
// Cada erro de servidor vira { titulo, mensagem, destino } para o popup
// (ErroAcaoDialog) — nunca "Dados inválidos" solto na tela.
import { describe, expect, it } from "vitest";

import {
  DESTINOS_CAMPO,
  erroSemPerfil,
  explicarErroDeRede,
  explicarErroSalvar,
  problemasDeValidacao,
} from "@/lib/erros-painel";

describe("problemasDeValidacao", () => {
  it("lê o campo e a mensagem dos issues do Zod", () => {
    const problemas = problemasDeValidacao({
      error: "Dados inválidos",
      issues: {
        formErrors: [],
        fieldErrors: { instagram: ["Use URL completa com https://"] },
      },
    });

    expect(problemas).toEqual([
      { campo: "instagram", mensagem: "Use URL completa com https://" },
    ]);
  });

  it("ignora issues vazios e corpo nulo", () => {
    expect(problemasDeValidacao(null)).toEqual([]);
    expect(problemasDeValidacao({ issues: { formErrors: [], fieldErrors: {} } })).toEqual([]);
  });
});

describe("explicarErroSalvar", () => {
  it("401 vira sessão expirada com botão de login", () => {
    const erro = explicarErroSalvar("perfil", 401, { error: "Não autenticado" });

    expect(erro.titulo).toBe("Sua sessão expirou");
    expect(erro.destino?.href).toBe("/login");
  });

  it("400 com issue manda para o campo certo (perfil)", () => {
    const erro = explicarErroSalvar("perfil", 400, {
      error: "Dados inválidos",
      issues: { formErrors: [], fieldErrors: { instagram: ["Use URL completa com https://"] } },
    });

    expect(erro.mensagem).toBe("Use URL completa com https://");
    expect(erro.destino).toEqual(DESTINOS_CAMPO.instagram);
    expect(erro.destino?.href).toBe("/painel/perfil?campo=instagram");
  });

  it("400 com issue manda para o campo certo (contato)", () => {
    const erro = explicarErroSalvar("contato", 400, {
      error: "Dados inválidos",
      issues: { fieldErrors: { whatsapp: ["Número de WhatsApp inválido"] } },
    });

    expect(erro.destino?.href).toBe("/painel/contato?campo=whatsapp");
  });

  it("400 sem issues pede revisão e só manda ao Perfil quando o erro veio da troca de tema", () => {
    const noTema = explicarErroSalvar("template", 400, { error: "Dados inválidos" });
    const noFormulario = explicarErroSalvar("contato", 400, { error: "Dados inválidos" });

    expect(noTema.destino?.href).toBe("/painel/perfil");
    expect(noFormulario.destino).toBeUndefined();
    expect(noTema.mensagem).not.toBe("Dados inválidos");
  });

  it("409 no contato é pré-requisito de perfil, não username em uso", () => {
    const erro = explicarErroSalvar("contato", 409, {
      error: "Salve a página Perfil antes de configurar o contato.",
    });

    expect(erro.titulo).toBe("Salve seu perfil primeiro");
    expect(erro.destino?.href).toBe("/painel/perfil?campo=nome_artistico");
  });

  it("409 no perfil é username em uso com botão para o campo", () => {
    const erro = explicarErroSalvar("perfil", 409, { error: "Username já está em uso" });

    expect(erro.titulo).toBe("Esse endereço já está em uso");
    expect(erro.destino?.href).toBe("/painel/perfil?campo=username");
  });

  it("500 de migration pendente mostra o caminho do banco", () => {
    const erro = explicarErroSalvar("template", 500, {
      error: "Could not find the 'template_slug' column of 'perfil' in the schema cache",
    });

    expect(erro.titulo).toBe("Falta uma migration no banco");
    expect(erro.mensagem).toContain("supabase/migrations");
  });

  it("500 genérico pede nova tentativa sem recarregar o formulário", () => {
    const erro = explicarErroSalvar("perfil", 500, { error: "timeout" });

    expect(erro.mensagem).toContain("Tente de novo");
    expect(erro.detalhe).toBe("timeout");
    expect(erro.destino).toBeUndefined();
  });
});

describe("pré-requisitos e rede", () => {
  it("sem perfil explica e leva ao Perfil", () => {
    const erro = erroSemPerfil();

    expect(erro.titulo).toBe("Complete seu perfil primeiro");
    expect(erro.destino?.href).toBe("/painel/perfil?campo=nome_artistico");
  });

  it("falha de rede manda fechar e salvar de novo, sem sair da tela", () => {
    const erro = explicarErroDeRede();

    expect(erro.destino).toBeUndefined();
    expect(erro.mensagem).toContain("Nada foi salvo");
  });
});
