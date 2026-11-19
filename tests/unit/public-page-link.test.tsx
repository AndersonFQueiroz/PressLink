import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: (props: Record<string, any>) => {
    const { href, children, ...rest } = props;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

import { PublicPageLink } from "@/components/features/painel/PublicPageLink";

const RAIZ = path.resolve(__dirname, "../..");

describe("PublicPageLink", () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
    vi.restoreAllMocks();
  });

  it("usa o username recebido por prop e não consulta a API", () => {
    render(
      <PublicPageLink username="dj-presslink">
        Ver página
      </PublicPageLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/dj-presslink");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("descobre o username pela API quando a página não passa a prop", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ perfil: { username: "santo-bateu" } }),
    });

    render(<PublicPageLink>Ver página</PublicPageLink>);

    // Antes da resposta: cai no Perfil, onde o @ é definido.
    expect(screen.getByRole("link")).toHaveAttribute("href", "/painel/perfil");

    await waitFor(() =>
      expect(screen.getByRole("link")).toHaveAttribute("href", "/santo-bateu"),
    );
  });

  it("prefere a prop quando ela chega depois do primeiro render", async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({}) });

    const { rerender } = render(<PublicPageLink>Ver página</PublicPageLink>);

    rerender(
      <PublicPageLink username="dj-presslink">Ver página</PublicPageLink>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/dj-presslink");
  });

  it("mantém o fallback quando a API falha ou não há sessão", async () => {
    (global.fetch as any).mockResolvedValue({ ok: false, json: async () => ({}) });

    render(<PublicPageLink>Ver página</PublicPageLink>);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/perfil"));
    expect(screen.getByRole("link")).toHaveAttribute("href", "/painel/perfil");
  });
});

describe("botões 'Ver página' do painel", () => {
  // A lista acompanha a reorganização do painel (19/11/2026): o antigo
  // `Header.tsx` foi substituído pela `PainelTopbar` e a Sidebar deixou de ter
  // botão "Ver página" (o link público vive na topbar). O contrato continua o
  // mesmo: nenhum link para a rota inexistente `/preview` e todos passando pelo
  // componente único, que resolve o username e cai no Perfil quando ele falta.
  const arquivos = [
    "src/components/features/painel/PainelTopbar.tsx",
    "src/app/painel/page.tsx",
    "src/app/painel/estatisticas/page.tsx",
  ];

  it.each(arquivos)("%s não aponta para a rota inexistente /preview", (arquivo) => {
    const fonte = readFileSync(path.join(RAIZ, arquivo), "utf8");
    expect(fonte).not.toContain('href="/preview"');
  });

  it("todos usam o componente único de link público", () => {
    for (const arquivo of arquivos) {
      const fonte = readFileSync(path.join(RAIZ, arquivo), "utf8");
      expect(fonte).toContain("PublicPageLink");
    }
  });
});
