"use client";

import React from "react";

import type { PeriodoEstatisticas, PontoSerie } from "@/lib/estatisticas";
import { cn } from "@/lib/utils";

type GraficoDiarioProps = {
  serie: PontoSerie[];
  periodo: PeriodoEstatisticas;
};

const ALTURA_MINIMA_COM_DADO = 3;
const LIMITE_POUCOS_PONTOS = 14;

function formatar(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

/**
 * Gráfico de barras por dia, sem dependência externa: cada dia tem uma barra de
 * visualizações (magenta) e uma de interações (cinza). O eixo Y é normalizado
 * pelo maior valor do período.
 *
 * Com poucos dias (7, ou poucos dias com dados em 30) as colunas têm largura
 * fixa e o conjunto é centralizado — uma barra solta não cola mais na borda.
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
  const poucosPontos = serie.length <= LIMITE_POUCOS_PONTOS;

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
        <div className="flex h-44 items-end border-b border-panel-line">
          <div
            className={cn(
              "flex h-full w-full items-end gap-[3px] px-2",
              poucosPontos ? "justify-center" : "justify-between",
            )}
          >
            {serie.map((ponto, indice) => {
              const rotuloVisivel =
                indice % intervaloRotulos === 0 || indice === ultimoIndice;

              return (
                <div
                  key={ponto.data}
                  className={cn(
                    "group relative flex h-full items-end justify-center gap-[2px]",
                    poucosPontos ? "w-[26px] shrink-0" : "min-w-0 flex-1",
                  )}
                  title={`${ponto.rotulo}: ${formatar(ponto.visualizacoes)} visualizações, ${formatar(ponto.cliques)} interações`}
                >
                  <div
                    className="pl-bar-y w-full max-w-[12px] rounded-t-sm bg-signal/85 transition-colors group-hover:bg-signal"
                    style={
                      {
                        height: alturaBarra(ponto.visualizacoes, maximo),
                        "--pl-i": indice,
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  />
                  <div
                    className="pl-bar-y w-full max-w-[12px] rounded-t-sm bg-white/30 transition-colors group-hover:bg-white/45"
                    style={
                      {
                        height: alturaBarra(ponto.cliques, maximo),
                        "--pl-i": indice,
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  />
                  {rotuloVisivel ? (
                    <span
                      className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-panel-muted"
                      aria-hidden="true"
                    >
                      {ponto.rotulo}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-panel-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-signal" aria-hidden="true" />
            Visualizações
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-white/30" aria-hidden="true" />
            Interações
          </span>
          <span>
            Pico de {formatar(maximo)} {maximo === 1 ? "evento" : "eventos"} por dia
          </span>
        </div>
      </div>
    </figure>
  );
}
