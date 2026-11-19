import { describe, expect, it } from "vitest";

import {
  agregarEventos,
  diaNoFuso,
  inicioDoDia,
  intervaloEstatisticas,
  normalizarPeriodo,
  type EventoEstatistica,
} from "@/lib/estatisticas";

// 18/11/2026 12:00 em Brasília (UTC-3)
const AGORA = new Date("2026-11-18T15:00:00.000Z");

function evento(tipo: string, created_at: string): EventoEstatistica {
  return { tipo, created_at };
}

describe("diaNoFuso", () => {
  it("usa o dia de Brasília, não o dia UTC", () => {
    // 02:30 UTC do dia 19 ainda é 23:30 do dia 18 em Brasília.
    expect(diaNoFuso(new Date("2026-11-19T02:30:00.000Z"))).toBe("2026-11-18");
  });

  it("vira o dia exatamente à meia-noite de Brasília", () => {
    expect(diaNoFuso(new Date("2026-11-18T02:59:59.999Z"))).toBe("2026-11-17");
    expect(diaNoFuso(new Date("2026-11-18T03:00:00.000Z"))).toBe("2026-11-18");
  });
});

describe("inicioDoDia", () => {
  it("devolve a meia-noite de Brasília como instante UTC", () => {
    expect(inicioDoDia(new Date("2026-11-18T15:00:00.000Z")).toISOString()).toBe(
      "2026-11-18T03:00:00.000Z",
    );
  });

  it("funciona também quando o instante UTC já está no dia seguinte", () => {
    expect(inicioDoDia(new Date("2026-11-19T02:30:00.000Z")).toISOString()).toBe(
      "2026-11-18T03:00:00.000Z",
    );
  });
});

describe("intervaloEstatisticas", () => {
  it("cobre 7 dias incluindo hoje e o mesmo tamanho no período anterior", () => {
    const { desde, ate, desdeAnterior } = intervaloEstatisticas(7, AGORA);

    expect(desde.toISOString()).toBe("2026-11-12T03:00:00.000Z");
    expect(ate.toISOString()).toBe("2026-11-19T03:00:00.000Z");
    expect(desdeAnterior.toISOString()).toBe("2026-11-05T03:00:00.000Z");
  });

  it("cobre 30 dias incluindo hoje", () => {
    const { desde, desdeAnterior } = intervaloEstatisticas(30, AGORA);

    expect(desde.toISOString()).toBe("2026-10-20T03:00:00.000Z");
    expect(desdeAnterior.toISOString()).toBe("2026-09-20T03:00:00.000Z");
  });
});

describe("normalizarPeriodo", () => {
  it("aceita apenas 7 e 30", () => {
    expect(normalizarPeriodo("7")).toBe(7);
    expect(normalizarPeriodo(30)).toBe(30);
    expect(normalizarPeriodo("8")).toBe(30);
    expect(normalizarPeriodo(null)).toBe(30);
    expect(normalizarPeriodo("abc")).toBe(30);
  });
});

describe("agregarEventos", () => {
  it("monta a série diária com um ponto por dia, terminando hoje", () => {
    const resumo = agregarEventos([], 7, AGORA);

    expect(resumo.serie).toHaveLength(7);
    expect(resumo.serie[0].data).toBe("2026-11-12");
    expect(resumo.serie[6].data).toBe("2026-11-18");
    expect(resumo.serie[6].rotulo).toBe("18/11");
    expect(resumo.totalEventos).toBe(0);
    expect(resumo.diasComDados).toBe(0);
  });

  it("conta visualizações e cliques no dia certo (fuso de Brasília)", () => {
    const resumo = agregarEventos(
      [
        evento("page_view", "2026-11-12T03:00:00.000Z"), // 12/11 00:00 BRT
        evento("page_view", "2026-11-19T02:30:00.000Z"), // 18/11 23:30 BRT
        evento("click_whatsapp", "2026-11-18T15:00:00.000Z"), // 18/11 12:00 BRT
        evento("click_email", "2026-11-18T15:05:00.000Z"),
      ],
      7,
      AGORA,
    );

    const dia12 = resumo.serie.find((ponto) => ponto.data === "2026-11-12");
    const dia18 = resumo.serie.find((ponto) => ponto.data === "2026-11-18");
    const dia17 = resumo.serie.find((ponto) => ponto.data === "2026-11-17");

    expect(dia12).toMatchObject({ visualizacoes: 1, cliques: 0 });
    expect(dia17).toMatchObject({ visualizacoes: 0, cliques: 0 });
    expect(dia18).toMatchObject({ visualizacoes: 1, cliques: 2 });

    expect(resumo.totais).toMatchObject({
      visualizacoes: 2,
      whatsapp: 1,
      email: 1,
      formulario: 0,
      cliques: 2,
    });
    expect(resumo.totalEventos).toBe(4);
    expect(resumo.diasComDados).toBe(2);
  });

  it("separa o período anterior e calcula a variação percentual", () => {
    const resumo = agregarEventos(
      [
        // período atual (7 dias)
        evento("page_view", "2026-11-18T12:00:00.000Z"),
        evento("page_view", "2026-11-17T12:00:00.000Z"),
        evento("click_whatsapp", "2026-11-18T13:00:00.000Z"),
        // período anterior (7 dias antes)
        evento("page_view", "2026-11-10T12:00:00.000Z"),
        evento("click_whatsapp", "2026-11-10T13:00:00.000Z"),
        evento("click_email", "2026-11-09T13:00:00.000Z"),
        // fora de ambos os períodos
        evento("page_view", "2026-10-01T12:00:00.000Z"),
      ],
      7,
      AGORA,
    );

    expect(resumo.totais.visualizacoes).toBe(2);
    expect(resumo.totais.cliques).toBe(1);
    expect(resumo.anterior.visualizacoes).toBe(1);
    expect(resumo.anterior.cliques).toBe(2);

    expect(resumo.variacoes.visualizacoes).toBe(100);
    expect(resumo.variacoes.cliques).toBe(-50);
    // 50% (2 views / 1 clique) contra 200% (1 view / 2 cliques) = -150 p.p.
    expect(resumo.variacoes.conversao).toBe(-150);
  });

  it("devolve variação nula quando não há base de comparação", () => {
    const resumo = agregarEventos(
      [evento("page_view", "2026-11-18T12:00:00.000Z")],
      7,
      AGORA,
    );

    expect(resumo.variacoes.visualizacoes).toBeNull();
    expect(resumo.variacoes.cliques).toBeNull();
    expect(resumo.variacoes.conversao).toBeNull();
  });

  it("calcula taxa de conversão e ignora tipos/registros inválidos", () => {
    const resumo = agregarEventos(
      [
        evento("page_view", "2026-11-18T12:00:00.000Z"),
        evento("page_view", "2026-11-18T12:10:00.000Z"),
        evento("page_view", "2026-11-18T12:20:00.000Z"),
        evento("page_view", "2026-11-18T12:30:00.000Z"),
        evento("click_whatsapp", "2026-11-18T12:40:00.000Z"),
        evento("click_formulario", "2026-11-18T12:50:00.000Z"),
        evento("tipo_invalido", "2026-11-18T13:00:00.000Z"),
        evento("page_view", "data-invalida"),
      ],
      7,
      AGORA,
    );

    expect(resumo.totais.visualizacoes).toBe(4);
    expect(resumo.totais.cliques).toBe(2);
    expect(resumo.totais.formulario).toBe(1);
    expect(resumo.totais.taxaConversao).toBe(50);
    expect(resumo.totalEventos).toBe(6);
  });

  it("conta o dia local inteiro, mesmo eventos após o horário atual", () => {
    const resumo = agregarEventos(
      [evento("page_view", "2026-11-19T02:59:00.000Z")],
      7,
      AGORA,
    );

    // 23:59 BRT de 18/11 — o período é por dia inteiro, não por hora.
    expect(resumo.totalEventos).toBe(1);
  });
});
