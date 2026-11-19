"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { PublicPageLink } from "@/components/features/painel/PublicPageLink";
import { PageHeader } from "@/components/features/painel/PageHeader";
import { GraficoDiario } from "@/components/features/estatisticas/GraficoDiario";
import {
  PERIODOS_ESTATISTICAS,
  PERIODO_PADRAO,
  type PeriodoEstatisticas,
  type PontoSerie,
} from "@/lib/estatisticas";
import { cn } from "@/lib/utils";

type EstatisticasData = {
  totalVisualizacoes: number;
  totalCliques: number;
  taxaConversao: number;
  username?: string;
  publicado?: boolean;
  periodo: PeriodoEstatisticas;
  detalhes: {
    whatsapp: number;
    email: number;
    formulario: number;
  };
  anterior: {
    totalVisualizacoes: number;
    totalCliques: number;
    taxaConversao: number;
  };
  variacoes: {
    visualizacoes: number | null;
    cliques: number | null;
    conversao: number | null;
  };
  serie: PontoSerie[];
  diasComDados: number;
  totalEventos: number;
  truncado?: boolean;
};

function formatar(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

function formatarVariacao(valor: number): string {
  const sinal = valor > 0 ? "+" : "";
  return `${sinal}${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`;
}

function Variacao({ valor, sufixo }: { valor: number | null; sufixo: string }) {
  // Sem base de comparação não é um dado: esconder evita repetir
  // "sem base anterior" em cada métrica e deixar a tela negativa à toa.
  if (valor === null) return null;

  const neutro = valor === 0;
  const positivo = valor > 0;
  const Icone = neutro ? Minus : positivo ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 text-[12px] font-medium",
        neutro ? "text-panel-muted" : positivo ? "text-ok" : "text-danger",
      )}
    >
      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
      {formatarVariacao(valor)}
      {sufixo}
    </span>
  );
}

function Metrica({
  rotulo,
  valor,
  casas = 0,
  sufixoValor = "",
  variacao,
  sufixo,
  nota,
  className,
  indice,
}: {
  rotulo: string;
  valor: number;
  /** Casas decimais do valor principal. */
  casas?: number;
  /** Sufixo do valor principal (ex.: "%"). */
  sufixoValor?: string;
  variacao: number | null;
  sufixo: string;
  nota: string;
  className?: string;
  indice: number;
}) {
  return (
    <div
      className={cn("pl-kpi py-4 sm:py-5", className)}
      style={{ "--pl-i": indice } as React.CSSProperties}
    >
      <dt className="text-[12px] text-panel-muted">{rotulo}</dt>
      <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="tabular font-display text-[38px] font-medium leading-none tracking-[-0.02em] text-panel-text">
          <CountUp value={valor} casas={casas} sufixo={sufixoValor} />
        </span>
        <Variacao valor={variacao} sufixo={sufixo} />
      </dd>
      <p className="mt-2 text-[12px] text-panel-muted">{nota}</p>
    </div>
  );
}

export default function EstatisticasPage() {
  const [data, setData] = useState<EstatisticasData | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoEstatisticas>(PERIODO_PADRAO);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const requisicaoAtual = useRef(0);

  const fetchStats = useCallback(async (periodoAtual: PeriodoEstatisticas) => {
    const id = ++requisicaoAtual.current;

    try {
      const res = await fetch(`/api/estatisticas?periodo=${periodoAtual}`);

      // Descarta respostas antigas quando o DJ troca de período rapidamente.
      if (id !== requisicaoAtual.current) return;

      if (res.ok) {
        const json = await res.json();
        setData(json);
        setErro(null);
      } else {
        const json = await res.json().catch(() => ({}));
        setErro(json.error || "Não foi possível carregar as estatísticas.");
      }
    } catch {
      if (id === requisicaoAtual.current) {
        setErro("Falha de conexão ao carregar as estatísticas.");
      }
    } finally {
      if (id === requisicaoAtual.current) {
        setLoading(false);
        setAtualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchStats(periodo);
  }, [fetchStats, periodo]);

  const trocarPeriodo = (novo: PeriodoEstatisticas) => {
    if (novo === periodo) return;
    setAtualizando(true);
    setPeriodo(novo);
  };

  const handleRefresh = () => {
    setAtualizando(true);
    void fetchStats(periodo);
  };

  const semDados = data !== null && data.totalEventos === 0;
  const despublicado = data?.publicado === false;

  return (
    <div>
      <PageHeader
        label="Resultados"
        title="Estatísticas"
        description="Quanta gente viu sua página e quantas pessoas clicaram para falar com você. Os números vêm só de visitas reais à sua página pública."
        actions={
          <>
            <div
              role="group"
              aria-label="Período das estatísticas"
              className="inline-flex h-8 items-center rounded border border-panel-line bg-panel-raised p-[3px]"
            >
              {PERIODOS_ESTATISTICAS.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => trocarPeriodo(opcao)}
                  aria-pressed={periodo === opcao}
                  className={cn(
                    "tabular h-full rounded-[3px] px-2.5 text-[12px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60",
                    periodo === opcao
                      ? "bg-signal text-ink"
                      : "text-panel-muted hover:text-panel-text",
                  )}
                >
                  {opcao} dias
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={atualizando}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-panel-line px-2.5 text-[12px] font-medium text-panel-muted transition-colors hover:border-panel-line-strong hover:text-panel-text disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", atualizando && "animate-spin")}
                aria-hidden="true"
              />
              {atualizando ? "Atualizando" : "Atualizar dados"}
            </button>
          </>
        }
      />

      {erro && !loading ? (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-danger/25 py-3 text-[13px] text-danger"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex h-7 items-center rounded border border-danger/40 px-2.5 text-[12px] font-medium transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
          >
            Tentar de novo
          </button>
        </div>
      ) : null}

      {loading ? (
        <div aria-busy="true" aria-label="Carregando estatísticas" className="pl-shimmer space-y-8">
          <div className="grid gap-px border-y border-panel-line sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-5">
                <div className="h-3 w-24 rounded bg-white/[0.06]" />
                <div className="mt-3 h-9 w-28 rounded bg-white/[0.06]" />
                <div className="mt-3 h-3 w-36 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
          <div className="h-56 rounded bg-white/[0.03]" />
        </div>
      ) : (
        <div
          className={cn(
            "transition-opacity duration-200",
            atualizando ? "pointer-events-none opacity-50" : "opacity-100",
          )}
          aria-busy={atualizando}
        >
          {despublicado ? (
            <div
              role="status"
              className="mb-6 border-y border-warn/25 py-3 text-[13px] text-warn"
            >
              Seu portfólio está despublicado — novos acessos não estão sendo
              contabilizados. Publique no painel para voltar a somar métricas.
            </div>
          ) : null}

          {data?.truncado ? (
            <div
              role="status"
              className="mb-6 border-y border-panel-line py-3 text-[13px] text-panel-muted"
            >
              Volume muito alto de eventos: os números mostram os primeiros 20.000
              registros do período.
            </div>
          ) : null}

          {semDados ? (
            <section aria-label="Sem dados no período" className="border-t border-panel-line pt-10">
              <h2 className="font-serif font-bold text-[26px] leading-tight text-panel-text">
                Ainda não há dados neste período
              </h2>
              <p className="mt-3 max-w-[58ch] text-[13px] leading-relaxed text-panel-muted">
                {despublicado
                  ? "Seu portfólio está despublicado: os acessos só são contados enquanto ele está no ar. Publique para voltar a registrar visualizações e cliques."
                  : "Assim que alguém visitar sua página pública, as visualizações e os cliques aparecem aqui. Divulgue o link oficial para começar."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <PublicPageLink
                  username={data?.username}
                  className="inline-flex h-8 items-center rounded bg-signal px-3 text-[12px] font-medium text-ink transition-colors hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                >
                  Ver meu portfólio
                </PublicPageLink>
                <Link
                  href="/painel"
                  className="inline-flex h-8 items-center rounded px-3 text-[12px] font-medium text-panel-muted transition-colors hover:bg-white/[0.05] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                >
                  Voltar ao painel
                </Link>
              </div>
              <p className="mt-5 max-w-[58ch] text-[12px] leading-relaxed text-panel-muted">
                Cada visitante conta uma visualização por sessão; cliques repetidos no
                mesmo link também contam uma única vez.
              </p>
            </section>
          ) : (
            <>
              <section aria-label="Resumo do período">
                <dl className="pl-stagger grid border-y border-panel-line sm:grid-cols-3 sm:divide-x sm:divide-panel-line">
                  <Metrica
                    rotulo="Total de Visualizações"
                    valor={data?.totalVisualizacoes ?? 0}
                    indice={0}
                    variacao={data?.variacoes.visualizacoes ?? null}
                    sufixo="%"
                    nota={`Visitas à sua página nos últimos ${periodo} dias`}
                    className="border-b border-panel-line sm:border-b-0 sm:pr-6"
                  />
                  <Metrica
                    rotulo="Cliques em Contato"
                    valor={data?.totalCliques ?? 0}
                    indice={1}
                    variacao={data?.variacoes.cliques ?? null}
                    sufixo="%"
                    nota="Interações diretas em WhatsApp e e-mail"
                    className="border-b border-panel-line sm:border-b-0 sm:px-6"
                  />
                  <Metrica
                    rotulo="Taxa de Conversão"
                    valor={data?.taxaConversao ?? 0}
                    casas={1}
                    sufixoValor="%"
                    indice={2}
                    variacao={data?.variacoes.conversao ?? null}
                    sufixo=" p.p."
                    nota="Proporção de visitantes que iniciaram contato"
                    className="sm:pl-6"
                  />
                </dl>
                <p className="mt-2 text-[12px] text-panel-muted">
                  Comparado com os {periodo} dias anteriores ·{" "}
                  {data?.diasComDados ?? 0} de {periodo} dias com atividade
                </p>
              </section>

              <section aria-label="Visualizações e interações por dia" className="mt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-panel-line pb-3">
                  <h2 className="font-display text-[15px] font-medium text-panel-text">
                    Visualizações e interações por dia
                  </h2>
                  <span className="text-[12px] text-panel-muted">Últimos {periodo} dias</span>
                </div>
                <div className="pt-4">
                  {data ? <GraficoDiario serie={data.serie} periodo={periodo} /> : null}
                </div>
              </section>

              <section aria-label="Canais de Conversão" className="mt-10">
                <div className="flex items-baseline justify-between gap-2 border-b border-panel-line pb-3">
                  <h2 className="font-display text-[15px] font-medium text-panel-text">
                    Canais de Conversão
                  </h2>
                  <span className="tabular text-[12px] text-panel-muted">
                    {formatar(data?.totalCliques ?? 0)} no total
                  </span>
                </div>

                <ul>
                  <li className="pl-row flex items-center justify-between gap-4 border-b border-panel-line py-3 pl-3 transition-colors hover:bg-white/[0.02]">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <MessageCircle
                        className="h-4 w-4 shrink-0 text-panel-muted"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-panel-text">
                          WhatsApp Direto
                        </span>
                        <span className="block text-[12px] text-panel-muted">
                          Cliques para conversa comercial
                        </span>
                      </span>
                    </span>
                    <span className="tabular font-display text-[21px] leading-none text-panel-text">
                      <CountUp value={data?.detalhes.whatsapp ?? 0} />
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-4 border-b border-panel-line py-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Mail
                        className="h-4 w-4 shrink-0 text-panel-muted"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-panel-text">
                          E-mail de Booking
                        </span>
                        <span className="block text-[12px] text-panel-muted">
                          Cliques no botão de e-mail
                        </span>
                      </span>
                    </span>
                    <span className="tabular font-display text-[21px] leading-none text-panel-text">
                      <CountUp value={data?.detalhes.email ?? 0} />
                    </span>
                  </li>
                </ul>
              </section>

              <section
                aria-label="Divulgação"
                className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-panel-line pt-5"
              >
                <div className="min-w-0">
                  <h2 className="font-display text-[15px] font-medium text-panel-text">
                    Divulgue seu portfólio para gerar mais estatísticas
                  </h2>
                  <p className="mt-1 max-w-[52ch] text-[13px] leading-relaxed text-panel-muted">
                    Use o link oficial na bio do Instagram, no YouTube e nas propostas
                    enviadas para contratantes.
                  </p>
                </div>

                <PublicPageLink
                  username={data?.username}
                  className="inline-flex h-8 shrink-0 items-center rounded border border-panel-line px-3 text-[12px] font-medium text-panel-text transition-colors hover:border-panel-line-strong hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                >
                  Ver meu portfólio
                </PublicPageLink>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
