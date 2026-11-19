"use client";

import React from "react";

import type { PeriodoEstatisticas, PontoSerie } from "@/lib/estatisticas";

type GraficoDiarioProps = {
  serie: PontoSerie[];
  periodo: PeriodoEstatisticas;
};

const ALTURA_MINIMA_COM_DADO = 3;

function formatar(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/**
 * Gráfico de barras por dia, sem dependência externa: cada dia tem uma barra de
 * visualizações (roxo) e uma de interações (verde). O eixo Y é normalizado pelo
 * maior valor do período.
 */
export function GraficoDiario({ serie, periodo }: GraficoDiarioProps) {
  const maximo = Math.max(
    1,
    ...serie.map((ponto) => Math.max(ponto.visualizacoes, ponto.cliques)),
  );

  const totalVisualizacoes = serie.reduce(
    (soma, ponto) => soma + ponto.visualizacoes,
    0,
  );
  const totalCliques = serie.reduce((soma, ponto) => soma + ponto.cliques, 0);

  const intervaloRotulos = periodo <= 7 ? 1 : 5;
  const ultimoIndice = serie.length - 1;

  const alturaBarra = (valor: number, maximoDoGrafico: number) =>
    valor > 0
      ? `${Math.max((valor / maximoDoGrafico) * 100, ALTURA_MINIMA_COM_DADO)}%`
      : "0%";

  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={`Gráfico dos últimos ${periodo} dias: ${formatar(totalVisualizacoes)} visualizações e ${formatar(totalCliques)} interações no total.`}
      >
        <div className="flex h-44 items-end gap-[3px] border-b border-white/10 pb-1">
          {serie.map((ponto, indice) => {
            const rotuloVisivel =
              indice % intervaloRotulos === 0 || indice === ultimoIndice;

            return (
              <div
                key={ponto.data}
                className="group relative flex h-full flex-1 items-end justify-center gap-[2px]"
                title={`${ponto.rotulo}: ${formatar(ponto.visualizacoes)} visualizações, ${formatar(ponto.cliques)} interações`}
              >
                <div
                  className="w-full max-w-[12px] rounded-t-sm bg-fuchsia-500/90 transition-all group-hover:bg-fuchsia-400"
                  style={{ height: alturaBarra(ponto.visualizacoes, maximo) }}
                  aria-hidden="true"
                />
                <div
                  className="w-full max-w-[12px] rounded-t-sm bg-emerald-400/90 transition-all group-hover:bg-emerald-300"
                  style={{ height: alturaBarra(ponto.cliques, maximo) }}
                  aria-hidden="true"
                />
                {rotuloVisivel ? (
                  <span
                    className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/40"
                    aria-hidden="true"
                  >
                    {ponto.rotulo}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-fuchsia-500" aria-hidden="true" />
            Visualizações
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" aria-hidden="true" />
            Interações
          </span>
          <span className="text-white/35">
            Pico de {formatar(maximo)} {maximo === 1 ? "evento" : "eventos"} por dia
          </span>
        </div>
      </div>
    </figure>
  );
}
