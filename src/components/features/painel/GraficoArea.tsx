"use client";

import { useId, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import type { PontoSerie } from "@/lib/estatisticas";
import { cn } from "@/lib/utils";

/**
 * Gráfico de área dos últimos N dias.
 *
 * Duas séries na mesma escala: visitas (magenta, área em gradiente) e contatos
 * (verde-limão do tema público, linha fina). Eixo Y com quatro faixas e
 * tooltip no hover/foco por teclado. Sem biblioteca externa.
 */

const LARGURA = 640;
const ALTURA = 200;
const MARGEM = { topo: 14, direita: 10, base: 24, esquerda: 36 };

function formatarCompacto(valor: number): string {
  if (valor >= 1000) {
    const mil = valor / 1000;
    return `${mil.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  }
  return valor.toLocaleString("pt-BR");
}

function topoBonito(maximo: number): number {
  if (maximo <= 4) return 4;
  const passo = Math.ceil(maximo / 4);
  return passo * 4;
}

/** Catmull-Rom → Bézier cúbica, com tensão baixa para não exagerar nas curvas. */
function caminhoSuave(pontos: { x: number; y: number }[]): string {
  if (pontos.length === 0) return "";
  if (pontos.length === 1) return `M ${pontos[0].x} ${pontos[0].y}`;

  const t = 0.18;
  let d = `M ${pontos[0].x} ${pontos[0].y}`;

  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export function GraficoArea({
  serie,
  className,
}: {
  serie: PontoSerie[];
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [ativo, setAtivo] = useState<number | null>(null);

  const dados = useMemo(() => serie ?? [], [serie]);
  const total = dados.length;

  const maximo = Math.max(
    1,
    ...dados.map((ponto) => Math.max(ponto.visualizacoes, ponto.cliques)),
  );
  const topo = topoBonito(maximo);
  const vazio = dados.every((ponto) => ponto.visualizacoes === 0 && ponto.cliques === 0);

  const plotW = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const plotH = ALTURA - MARGEM.topo - MARGEM.base;

  const x = (indice: number) =>
    MARGEM.esquerda + (total <= 1 ? plotW / 2 : (indice / (total - 1)) * plotW);
  const y = (valor: number) =>
    MARGEM.topo + (1 - Math.min(valor, topo) / topo) * plotH;

  const pontosVisitas = dados.map((ponto, indice) => ({
    x: x(indice),
    y: y(ponto.visualizacoes),
  }));
  const pontosContatos = dados.map((ponto, indice) => ({
    x: x(indice),
    y: y(ponto.cliques),
  }));

  const linhaVisitas = caminhoSuave(pontosVisitas);
  const linhaContatos = caminhoSuave(pontosContatos);
  const areaVisitas =
    pontosVisitas.length > 0
      ? `${linhaVisitas} L ${x(total - 1)} ${MARGEM.topo + plotH} L ${MARGEM.esquerda} ${
          MARGEM.topo + plotH
        } Z`
      : "";

  const faixas = [0, 0.25, 0.5, 0.75, 1].map((fracao) => ({
    valor: Math.round(topo * fracao),
    y: MARGEM.topo + plotH * (1 - fracao),
  }));

  const intervaloRotulos = total <= 7 ? 1 : 5;
  const pontoAtivo = ativo !== null ? dados[ativo] : null;
  const posicaoAtiva = ativo !== null ? x(ativo) : 0;
  const alturaAtiva =
    ativo !== null ? Math.min(y(dados[ativo].visualizacoes), y(dados[ativo].cliques)) : 0;

  function mover(evento: ReactPointerEvent<SVGSVGElement>) {
    const caixa = svgRef.current?.getBoundingClientRect();
    if (!caixa || total === 0) return;

    const px = ((evento.clientX - caixa.left) / caixa.width) * LARGURA;
    const razao = (px - MARGEM.esquerda) / plotW;
    const indice = Math.round(razao * (total - 1));

    setAtivo(Math.max(0, Math.min(total - 1, indice)));
  }

  function teclado(evento: ReactKeyboardEvent<SVGSVGElement>) {
    if (total === 0) return;
    const atual = ativo ?? total - 1;

    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      setAtivo(Math.max(0, atual - 1));
    } else if (evento.key === "ArrowRight") {
      evento.preventDefault();
      setAtivo(Math.min(total - 1, atual + 1));
    } else if (evento.key === "Escape") {
      setAtivo(null);
    }
  }

  return (
    <figure className={cn("relative m-0", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="h-auto w-full touch-pan-y rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
        role="img"
        tabIndex={0}
        aria-label={`Gráfico dos últimos ${total} dias: ${dados
          .reduce((soma, ponto) => soma + ponto.visualizacoes, 0)
          .toLocaleString("pt-BR")} visualizações e ${dados
          .reduce((soma, ponto) => soma + ponto.cliques, 0)
          .toLocaleString("pt-BR")} contatos.`}
        onPointerMove={mover}
        onPointerLeave={() => setAtivo(null)}
        onKeyDown={teclado}
        onBlur={() => setAtivo(null)}
      >
        <defs>
          <linearGradient id={`visitas-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d018f6" stopOpacity="0.30" />
            <stop offset="70%" stopColor="#d018f6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#d018f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {faixas.map((faixa) => (
          <g key={faixa.valor}>
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={faixa.y}
              y2={faixa.y}
              stroke="rgb(255 255 255 / 0.06)"
              strokeDasharray={faixa.valor === 0 ? undefined : "3 5"}
            />
            <text
              x={MARGEM.esquerda - 8}
              y={faixa.y + 3.5}
              textAnchor="end"
              className="fill-panel-muted text-[10px]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatarCompacto(faixa.valor)}
            </text>
          </g>
        ))}

        <g className="pl-draw">
          {areaVisitas && (
            <path d={areaVisitas} fill={`url(#visitas-${id})`} className="pl-fade" />
          )}
          {linhaContatos && (
            <path
              d={linhaContatos}
              fill="none"
              stroke="#d8ff4a"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.75"
            />
          )}
          {linhaVisitas && (
            <path
              d={linhaVisitas}
              fill="none"
              stroke="#d018f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </g>

        {dados.map((ponto, indice) => {
          const visivel = indice % intervaloRotulos === 0 || indice === total - 1;
          if (!visivel) return null;
          return (
            <text
              key={ponto.data}
              x={x(indice)}
              y={ALTURA - 6}
              textAnchor={indice === 0 ? "start" : indice === total - 1 ? "end" : "middle"}
              className="fill-panel-muted text-[10px]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {ponto.rotulo}
            </text>
          );
        })}

        {ativo !== null && (
          <g pointerEvents="none">
            <line
              x1={posicaoAtiva}
              x2={posicaoAtiva}
              y1={MARGEM.topo}
              y2={MARGEM.topo + plotH}
              stroke="rgb(255 255 255 / 0.18)"
              strokeDasharray="3 4"
            />
            <circle
              cx={posicaoAtiva}
              cy={y(dados[ativo].cliques)}
              r="3.2"
              fill="#d8ff4a"
              stroke="#07060b"
              strokeWidth="1.5"
            />
            <circle
              cx={posicaoAtiva}
              cy={y(dados[ativo].visualizacoes)}
              r="3.6"
              fill="#d018f6"
              stroke="#07060b"
              strokeWidth="1.5"
            />
          </g>
        )}

        {vazio && (
          <text
            x={MARGEM.esquerda + plotW / 2}
            y={MARGEM.topo + plotH / 2}
            textAnchor="middle"
            className="fill-panel-muted text-[11px]"
          >
            Sem visitas no período
          </text>
        )}
      </svg>

      {pontoAtivo && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 min-w-[132px] rounded-md border border-white/10 bg-[#0b0910]/95 px-2.5 py-2 shadow-lg shadow-black/40 backdrop-blur"
          style={{
            left: `${(posicaoAtiva / LARGURA) * 100}%`,
            top: `${(alturaAtiva / ALTURA) * 100}%`,
            transform:
              posicaoAtiva > LARGURA * 0.72
                ? "translate(-100%, -118%)"
                : posicaoAtiva < LARGURA * 0.16
                  ? "translate(0%, -118%)"
                  : "translate(-50%, -118%)",
          }}
        >
          <p className="text-[10px] text-panel-muted">{pontoAtivo.rotulo}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-panel-text">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
            <span className="tabular">{pontoAtivo.visualizacoes}</span> visitas
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-panel-text">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-acid"
              aria-hidden="true"
            />
            <span className="tabular">{pontoAtivo.cliques}</span> contatos
          </p>
        </div>
      )}
    </figure>
  );
}
