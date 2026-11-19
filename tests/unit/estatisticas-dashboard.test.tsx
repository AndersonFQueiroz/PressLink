import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

import EstatisticasPage from "@/app/painel/estatisticas/page";
import type { PeriodoEstatisticas, PontoSerie } from "@/lib/estatisticas";

function serie(periodo: PeriodoEstatisticas, visualizacoes = 0, cliques = 0): PontoSerie[] {
  return Array.from({ length: periodo }, (_, indice) => ({
    data: `2026-11-${String(indice + 1).padStart(2, "0")}`,
    rotulo: `${String(indice + 1).padStart(2, "0")}/11`,
    visualizacoes,
    cliques,
  }));
}

function resposta(periodo: PeriodoEstatisticas) {
  return {
    totalVisualizacoes: periodo === 7 ? 77 : 1200,
    totalCliques: 34,
    taxaConversao: 2.8,
    username: "dj-presslink",
    publicado: true,
    periodo,
    detalhes: { whatsapp: 30, email: 4, formulario: 0 },
    anterior: { totalVisualizacoes: 1000, totalCliques: 40, taxaConversao: 4 },
    variacoes: { visualizacoes: 20, cliques: -15, conversao: -1.2 },
    serie: serie(periodo, 10, 1),
    diasComDados: 3,
    totalEventos: 1234,
    truncado: false,
    geradoEm: "2026-11-18T15:00:00.000Z",
  };
}

describe("Página /painel/estatisticas", () => {
  const fetchOriginal = global.fetch;

  beforeEach(() => {
    // O CountUp anima com requestAnimationFrame; no jsdom o timestamp do frame
    // não avança de forma confiável, então simulamos "prefers-reduced-motion"
    // para o contador cair direto no valor final.
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));

    global.fetch = vi.fn(async (entrada: any) => {
      const url = String(entrada);
      const periodo: PeriodoEstatisticas = url.includes("periodo=7") ? 7 : 30;
      return { ok: true, json: async () => resposta(periodo) } as any;
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    global.fetch = fetchOriginal;
    vi.restoreAllMocks();
  });

  it("mostra os cards, a variação e busca os últimos 30 dias por padrão", async () => {
    render(<EstatisticasPage />);

    expect(await screen.findByText("1.200")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/estatisticas?periodo=30");
    expect(screen.getByText("Total de Visualizações")).toBeInTheDocument();
    expect(screen.getByText("+20%")).toBeInTheDocument();
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Gráfico dos últimos 30 dias/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Canais de Conversão")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp Direto")).toBeInTheDocument();
    expect(screen.queryByText("sem base anterior")).toBeNull();
  });

  it("troca para 7 dias e atualiza os números", async () => {
    render(<EstatisticasPage />);
    await screen.findByText("1.200");

    fireEvent.click(screen.getByRole("button", { name: "7 dias" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/estatisticas?periodo=7"),
    );
    // O CountUp anima 1.200 → 77 em 900 ms; em máquina de CI o polling padrão
    // de 1 s fica no limite, então damos folga para o valor final aparecer.
    expect(await screen.findByText("77", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Gráfico dos últimos 7 dias/ })).toBeInTheDocument();
  });

  it("mostra estado amigável quando o período não tem eventos", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        ...resposta(30),
        totalVisualizacoes: 0,
        totalCliques: 0,
        taxaConversao: 0,
        detalhes: { whatsapp: 0, email: 0, formulario: 0 },
        variacoes: { visualizacoes: null, cliques: null, conversao: null },
        serie: serie(30),
        diasComDados: 0,
        totalEventos: 0,
      }),
    });

    render(<EstatisticasPage />);

    expect(
      await screen.findByText("Ainda não há dados neste período"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Divulgue o link oficial/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver meu portfólio/i })[0]).toHaveAttribute(
      "href",
      "/dj-presslink",
    );
  });

  it("avisa quando o portfólio está despublicado", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ ...resposta(30), publicado: false }),
    });

    render(<EstatisticasPage />);

    expect(await screen.findByText(/está despublicado/i)).toBeInTheDocument();
  });

  it("mostra o erro da API em vez de números falsos", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Perfil não encontrado" }),
    });

    render(<EstatisticasPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Perfil não encontrado");
  });
});
