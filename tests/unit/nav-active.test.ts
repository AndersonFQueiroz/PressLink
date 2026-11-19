import { describe, expect, it } from "vitest";

import { isNavActive } from "@/lib/nav";

describe("isNavActive", () => {
  it("marca Visão geral só na rota raiz", () => {
    expect(isNavActive("/painel", "/painel", true)).toBe(true);
    expect(isNavActive("/painel/perfil", "/painel", true)).toBe(false);
    expect(isNavActive("/painel/estatisticas", "/painel", true)).toBe(false);
  });

  it("marca a seção pela rota e por rotas filhas", () => {
    expect(isNavActive("/painel/perfil", "/painel/perfil")).toBe(true);
    expect(isNavActive("/painel/perfil/editar", "/painel/perfil")).toBe(true);
    expect(isNavActive("/painel/estatisticas", "/painel/estatisticas")).toBe(true);
  });

  it("não acende uma seção por pedaço de palavra", () => {
    expect(isNavActive("/painel/perfil", "/painel/perfil-publico")).toBe(false);
    expect(isNavActive("/painel", "/painel/perfil")).toBe(false);
  });

  it("ignora barra final", () => {
    expect(isNavActive("/painel/perfil/", "/painel/perfil")).toBe(true);
    expect(isNavActive("/", "/")).toBe(true);
  });

  it("acende exatamente um item por rota do painel", () => {
    const itens = [
      { href: "/painel", exact: true },
      { href: "/painel/perfil" },
      { href: "/painel/galeria" },
      { href: "/painel/musica" },
      { href: "/painel/agenda" },
      { href: "/painel/template" },
      { href: "/painel/contato" },
      { href: "/painel/estatisticas" },
    ];

    for (const rota of itens.map((item) => item.href)) {
      const ativos = itens.filter((item) => isNavActive(rota, item.href, item.exact));
      expect(ativos, rota).toHaveLength(1);
    }
  });
});
