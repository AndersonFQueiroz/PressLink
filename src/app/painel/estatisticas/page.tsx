"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  Mail,
  MessageCircle,
  Minus,
  MousePointerClick,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PublicPageLink } from "@/components/features/painel/PublicPageLink";
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
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        neutro ? "text-white/40" : positivo ? "text-emerald-400" : "text-rose-400"
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
    <div className="space-y-8">
      {/* Navigation Breadcrumb + ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/painel"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao painel</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Período das estatísticas"
            className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1"
          >
            {PERIODOS_ESTATISTICAS.map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => trocarPeriodo(opcao)}
                aria-pressed={periodo === opcao}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  periodo === opcao
                    ? "bg-fuchsia-600 text-white shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {opcao} dias
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={atualizando}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${atualizando ? "animate-spin" : ""}`} />
            <span>Atualizar dados</span>
          </button>
        </div>
      </div>

      {/* Page Header */}
      <section className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-400">
          Métricas & Desempenho
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Estatísticas do Portfólio
        </h1>
        <p className="mt-2 text-base text-white/60 max-w-2xl">
          Acompanhe o engajamento dos contratantes com o seu EPK, incluindo alcance de
          visualizações e taxa de conversão em contatos diretos.
        </p>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />
        </div>
      ) : (
        <div
          className={`space-y-10 transition-opacity ${
            atualizando ? "pointer-events-none opacity-50" : "opacity-100"
          }`}
          aria-busy={atualizando}
        >
          {erro ? (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200"
            >
              {erro}
            </div>
          ) : null}

          {despublicado ? (
            <div
              role="status"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"
            >
              Seu portfólio está despublicado — novos acessos não estão sendo
              contabilizados. Publique no painel para voltar a somar métricas.
            </div>
          ) : null}

          {data?.truncado ? (
            <div
              role="status"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60"
            >
              Volume muito alto de eventos: os números mostram os primeiros 20.000
              registros do período.
            </div>
          ) : null}

          <p className="text-xs text-white/40 -mt-4">
            Últimos {periodo} dias
            {data ? (
              <>
                {" "}
                · {data.diasComDados} de {periodo} dias com atividade
              </>
            ) : null}
          </p>

          {semDados ? (
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Ainda não há dados neste período
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
                {despublicado
                  ? "Seu portfólio está despublicado: os acessos só são contados enquanto ele está no ar. Publique para voltar a registrar visualizações e cliques."
                  : "Assim que alguém visitar sua página pública, as visualizações e os cliques aparecem aqui. Divulgue o link oficial para começar."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <PublicPageLink
                  username={data?.username}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/30 transition hover:bg-fuchsia-500 whitespace-nowrap"
                >
                  Ver meu portfólio
                </PublicPageLink>
                <Link
                  href="/painel"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white whitespace-nowrap"
                >
                  Voltar ao painel
                </Link>
              </div>
              <p className="mt-5 text-xs text-white/35">
                Dica: cada visitante conta uma visualização por sessão; cliques
                repetidos no mesmo link também contam uma única vez.
              </p>
            </section>
          ) : (
            <>
              {/* Top Metrics Grid (RF-28, RF-29, RF-30) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1: Visualizações */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                      <Eye className="w-6 h-6" />
                    </div>
                    <VariacaoBadge valor={data?.variacoes.visualizacoes ?? null} sufixo="%" />
                  </div>
                  <p className="text-sm font-medium text-white/60">Total de Visualizações</p>
                  <p className="mt-2 text-4xl font-extrabold font-display text-white">
                    {formatar(data?.totalVisualizacoes ?? 0)}
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Visitas à sua URL pública nos últimos {periodo} dias
                  </p>
                </div>

                {/* Metric 2: Cliques em Contato */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MousePointerClick className="w-6 h-6" />
                    </div>
                    <VariacaoBadge valor={data?.variacoes.cliques ?? null} sufixo="%" />
                  </div>
                  <p className="text-sm font-medium text-white/60">Cliques em Contato</p>
                  <p className="mt-2 text-4xl font-extrabold font-display text-white">
                    {formatar(data?.totalCliques ?? 0)}
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Interações diretas em WhatsApp e e-mail
                  </p>
                </div>

                {/* Metric 3: Taxa de Conversão */}
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <VariacaoBadge valor={data?.variacoes.conversao ?? null} sufixo=" p.p." />
                  </div>
                  <p className="text-sm font-medium text-white/60">Taxa de Conversão</p>
                  <p className="mt-2 text-4xl font-extrabold font-display text-white">
                    {formatar(data?.taxaConversao ?? 0)}%
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Proporção de visitantes que iniciaram contato
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/40 -mt-4">
                Variação comparada com os {periodo} dias anteriores.
              </p>

              {/* Daily Chart (RF-30) */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
                <h2 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-fuchsia-400" />
                  <span>Visualizações e interações por dia</span>
                </h2>

                {data ? <GraficoDiario serie={data.serie} periodo={periodo} /> : null}
              </section>

              {/* Channels Breakdown Section */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
                <h2 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-fuchsia-400" />
                  <span>Canais de Conversão</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">WhatsApp Direto</p>
                        <p className="text-xs text-white/50">Cliques para conversa comercial</p>
                      </div>
                    </div>
                    <span className="font-display text-2xl font-bold text-emerald-400">
                      {formatar(data?.detalhes.whatsapp ?? 0)}
                    </span>
                  </div>

                  {/* E-mail de Booking */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">E-mail de Booking</p>
                        <p className="text-xs text-white/50">Cliques no botão de e-mail</p>
                      </div>
                    </div>
                    <span className="font-display text-2xl font-bold text-fuchsia-400">
                      {formatar(data?.detalhes.email ?? 0)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Public Page Quick Link CTA */}
              <section className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950/30 to-purple-950/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-display text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    <span>Divulgue seu portfólio para gerar mais estatísticas</span>
                  </p>
                  <p className="text-sm text-white/60">
                    Compartilhe seu link oficial na bio do Instagram, YouTube e propostas
                    para contratantes.
                  </p>
                </div>

                <PublicPageLink
                  username={data?.username}
                  className="rounded-full bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-600/30 hover:bg-fuchsia-500 transition whitespace-nowrap"
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
