"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Mail,
  MessageCircle,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PublicPageLink } from "@/components/features/painel/PublicPageLink";
import { PageHeader } from "@/components/features/painel/PageHeader";
import { GraficoDiario } from "@/components/features/estatisticas/GraficoDiario";
import {
  PERIODOS_ESTATISTICAS,
  PERIODO_PADRAO,
  type PeriodoEstatisticas,
  type PontoSerie,
} from "@/lib/estatisticas";

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

function VariacaoBadge({ valor, sufixo }: { valor: number | null; sufixo: string }) {
  if (valor === null) {
    return (
      <span className="text-[11px] font-medium text-white/30">sem base anterior</span>
    );
  }

  const neutro = valor === 0;
  const positivo = valor > 0;
  const Icone = neutro ? Minus : positivo ? TrendingUp : TrendingDown;

  return (
    <span
      className={`tabular inline-flex items-center gap-1 text-[11px] font-semibold ${
        neutro ? "text-white/40" : positivo ? "text-[#a4edaf]" : "text-[#ff9a9a]"
      }`}
    >
      <Icone className="h-3 w-3" aria-hidden="true" />
      {formatarVariacao(valor)}
      {sufixo}
    </span>
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
        title="Estatísticas"
        description="Quanta gente viu sua página e quantas pessoas clicaram para falar com você. Os números vêm só de visitas reais à sua página pública."
        actions={
          <>
            <div
              role="group"
              aria-label="Período das estatísticas"
              className="inline-flex rounded-md border border-panel-line bg-panel-raised p-0.5"
            >
              {PERIODOS_ESTATISTICAS.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => trocarPeriodo(opcao)}
                  aria-pressed={periodo === opcao}
                  className={`tabular rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 ${
                    periodo === opcao
                      ? "bg-brand text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {opcao} dias
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={atualizando}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-panel-line bg-panel-raised px-2.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${atualizando ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Atualizar dados
            </button>
          </>
        }
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center" aria-busy="true">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-brand"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div
          className={`space-y-6 transition-opacity ${
            atualizando ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
          aria-busy={atualizando}
        >
          {erro ? (
            <div
              role="alert"
              className="rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.08] p-3.5 text-[13px] text-[#ff9a9a]"
            >
              {erro}
            </div>
          ) : null}

          {despublicado ? (
            <div
              role="status"
              className="rounded-lg border border-[#e8c468]/25 bg-[#e8c468]/[0.07] p-3.5 text-[13px] text-[#f0d58e]"
            >
              Seu portfólio está despublicado — novos acessos não estão sendo
              contabilizados. Publique no painel para voltar a somar métricas.
            </div>
          ) : null}

          {data?.truncado ? (
            <div
              role="status"
              className="rounded-lg border border-panel-line bg-panel-raised p-3.5 text-[13px] text-white/55"
            >
              Volume muito alto de eventos: os números mostram os primeiros 20.000
              registros do período.
            </div>
          ) : null}

          {semDados ? (
            <section className="rounded-xl border border-panel-line bg-panel-surface px-6 py-12 text-center">
              <BarChart3
                className="mx-auto h-6 w-6 text-white/25"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-white">
                Ainda não há dados neste período
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-white/50">
                {despublicado
                  ? "Seu portfólio está despublicado: os acessos só são contados enquanto ele está no ar. Publique para voltar a registrar visualizações e cliques."
                  : "Assim que alguém visitar sua página pública, as visualizações e os cliques aparecem aqui. Divulgue o link oficial para começar."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <PublicPageLink
                  username={data?.username}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                >
                  Ver meu portfólio
                </PublicPageLink>
                <Link
                  href="/painel"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-panel-line px-4 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white whitespace-nowrap"
                >
                  Voltar ao painel
                </Link>
              </div>
              <p className="mx-auto mt-6 max-w-md text-[12px] leading-relaxed text-white/30">
                Cada visitante conta uma visualização por sessão; cliques repetidos
                no mesmo link também contam uma única vez.
              </p>
            </section>
          ) : (
            <>
              {/* Métricas */}
              <section
                aria-label="Resumo do período"
                className="rounded-xl border border-panel-line bg-panel-surface"
              >
                <dl className="grid divide-y divide-panel-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="p-5">
                    <dt className="text-[12px] text-white/45">
                      Total de Visualizações
                    </dt>
                    <dd className="mt-2 flex items-baseline gap-2">
                      <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                        {formatar(data?.totalVisualizacoes ?? 0)}
                      </span>
                      <VariacaoBadge
                        valor={data?.variacoes.visualizacoes ?? null}
                        sufixo="%"
                      />
                    </dd>
                    <p className="mt-2 text-[12px] text-white/35">
                      Visitas à sua página nos últimos {periodo} dias
                    </p>
                  </div>

                  <div className="p-5">
                    <dt className="text-[12px] text-white/45">
                      Cliques em Contato
                    </dt>
                    <dd className="mt-2 flex items-baseline gap-2">
                      <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                        {formatar(data?.totalCliques ?? 0)}
                      </span>
                      <VariacaoBadge
                        valor={data?.variacoes.cliques ?? null}
                        sufixo="%"
                      />
                    </dd>
                    <p className="mt-2 text-[12px] text-white/35">
                      Interações diretas em WhatsApp e e-mail
                    </p>
                  </div>

                  <div className="p-5">
                    <dt className="text-[12px] text-white/45">
                      Taxa de Conversão
                    </dt>
                    <dd className="mt-2 flex items-baseline gap-2">
                      <span className="tabular font-display text-[30px] font-semibold leading-none text-white">
                        {formatar(data?.taxaConversao ?? 0)}%
                      </span>
                      <VariacaoBadge
                        valor={data?.variacoes.conversao ?? null}
                        sufixo=" p.p."
                      />
                    </dd>
                    <p className="mt-2 text-[12px] text-white/35">
                      Proporção de visitantes que iniciaram contato
                    </p>
                  </div>
                </dl>
                <p className="border-t border-panel-line px-5 py-2.5 text-[11px] text-white/30">
                  Comparado com os {periodo} dias anteriores ·{" "}
                  {data?.diasComDados ?? 0} de {periodo} dias com atividade
                </p>
              </section>

              {/* Gráfico */}
              <section className="rounded-xl border border-panel-line bg-panel-surface">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-line px-5 py-3.5">
                  <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
                    Visualizações e interações por dia
                  </h2>
                  <span className="text-[12px] text-white/35">Últimos {periodo} dias</span>
                </div>
                <div className="px-5 py-5">
                  {data ? <GraficoDiario serie={data.serie} periodo={periodo} /> : null}
                </div>
              </section>

              {/* Canais */}
              <section className="rounded-xl border border-panel-line bg-panel-surface">
                <div className="border-b border-panel-line px-5 py-3.5">
                  <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
                    Canais de Conversão
                  </h2>
                </div>

                <ul className="divide-y divide-panel-line">
                  <li className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-panel-line bg-panel-raised text-white/50">
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-white/85">
                          WhatsApp Direto
                        </span>
                        <span className="block text-[12px] text-white/35">
                          Cliques para conversa comercial
                        </span>
                      </span>
                    </span>
                    <span className="tabular font-display text-lg font-semibold text-white">
                      {formatar(data?.detalhes.whatsapp ?? 0)}
                    </span>
                  </li>

                  <li className="flex items-center justify-between gap-4 px-5 py-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-panel-line bg-panel-raised text-white/50">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-white/85">
                          E-mail de Booking
                        </span>
                        <span className="block text-[12px] text-white/35">
                          Cliques no botão de e-mail
                        </span>
                      </span>
                    </span>
                    <span className="tabular font-display text-lg font-semibold text-white">
                      {formatar(data?.detalhes.email ?? 0)}
                    </span>
                  </li>
                </ul>
              </section>

              {/* Divulgação */}
              <section className="flex flex-col items-start justify-between gap-4 rounded-xl border border-panel-line bg-panel-surface p-5 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h2 className="font-display text-[15px] font-semibold tracking-tight text-white">
                    Divulgue seu portfólio para gerar mais estatísticas
                  </h2>
                  <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-white/45">
                    Use o link oficial na bio do Instagram, no YouTube e nas propostas
                    enviadas para contratantes.
                  </p>
                </div>

                <PublicPageLink
                  username={data?.username}
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-panel-line bg-panel-raised px-4 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
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
