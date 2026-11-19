import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarPlus,
  Check,
  ChevronRight,
  Circle,
  ExternalLink,
  Images,
  Mail,
  MessageCircle,
  Music,
  Palette,
  User,
} from "lucide-react";

import type { ResumoEstatisticas } from "@/lib/estatisticas";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/CountUp";
import { CopiarLink } from "./CopiarLink";
import { PublicPageLink } from "./PublicPageLink";
import { GraficoArea } from "./GraficoArea";
import { Sparkline } from "./Sparkline";

type Show = {
  id: string;
  nome_evento: string;
  data: string;
  horario: string | null;
  local: string | null;
  cidade: string | null;
};

type ItemProntidao = {
  label: string;
  done: boolean;
  href: string;
  hint?: string;
};

export type VisaoGeralProps = {
  nome: string;
  username: string | null;
  fotoUrl: string | null;
  publicado: boolean;
  temaNome: string;
  urlPublica: string;
  enderecoPublico: string;
  resumo: ResumoEstatisticas;
  shows: Show[];
  itensProntidao: ItemProntidao[];
  prontos: number;
  totalItens: number;
};

function formatarDataCurta(data: string) {
  const d = new Date(`${data}T12:00:00Z`);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "UTC" }).format(d);
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
  return { dia, mes };
}

function Variacao({ valor, sufixo = "%" }: { valor: number | null; sufixo?: string }) {
  if (valor === null) return null;

  const positivo = valor > 0;
  const neutro = valor === 0;
  const Icone = neutro ? ArrowUpRight : positivo ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
        neutro
          ? "bg-white/[0.04] text-panel-muted"
          : positivo
            ? "bg-ok/10 text-ok"
            : "bg-danger/10 text-danger",
      )}
      title={`${positivo ? "Alta" : neutro ? "Estável" : "Queda"} contra os 30 dias anteriores`}
    >
      <Icone className="h-3 w-3" aria-hidden="true" />
      {positivo ? "+" : ""}
      {valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
      {sufixo}
    </span>
  );
}

function SparkKpi({
  rotulo,
  valor,
  casas = 0,
  sufixo = "",
  variacao,
  serie,
  cor,
  id,
  nota,
  indice,
}: {
  rotulo: string;
  valor: number;
  casas?: number;
  sufixo?: string;
  variacao: number | null;
  serie: number[];
  cor: string;
  id: string;
  nota: string;
  indice: number;
}) {
  return (
    <div
      className="pl-kpi flex min-w-0 flex-col p-4 sm:p-5"
      style={{ "--pl-i": indice } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] text-panel-muted">{rotulo}</p>
        <Variacao valor={variacao} />
      </div>
      <p className="tabular mt-2 font-sans text-[30px] font-medium leading-none tracking-[-0.03em] text-panel-text">
        <CountUp value={valor} casas={casas} sufixo={sufixo} />
      </p>
      <Sparkline
        key={serie.join("|")}
        dados={serie}
        id={id}
        cor={cor}
        className="mt-3 h-9 w-full"
      />
      <p className="mt-auto pt-2 text-[11px] leading-snug text-panel-muted">{nota}</p>
    </div>
  );
}

export function VisaoGeral({
  nome,
  username,
  fotoUrl,
  publicado,
  temaNome,
  urlPublica,
  enderecoPublico,
  resumo,
  shows,
  itensProntidao,
  prontos,
  totalItens,
}: VisaoGeralProps) {
  const { totais, variacoes, serie } = resumo;
  const pctProntos = totalItens > 0 ? Math.round((prontos / totalItens) * 100) : 0;
  const pendentes = itensProntidao.filter((item) => !item.done);

  const canais = [
    { label: "WhatsApp", valor: totais.whatsapp, icone: MessageCircle },
    { label: "E-mail", valor: totais.email, icone: Mail },
  ].sort((a, b) => b.valor - a.valor);
  const canalTop = canais[0];
  const temContatos = totais.cliques > 0;

  const raio = 40;

  const serieConversao = serie.map((ponto) =>
    ponto.visualizacoes > 0 ? (ponto.cliques / ponto.visualizacoes) * 100 : 0,
  );

  return (
    <div>
      {/* Topo: identidade + estado da página */}
      <section aria-label="Sua página" className="pl-board-hero pl-rise pl-rise-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] text-[14px] font-semibold text-panel-muted">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              nome.slice(0, 2).toUpperCase()
            )}
          </span>

          <div className="min-w-0 flex-1 basis-[200px]">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-[20px] font-bold leading-tight tracking-[-0.02em] text-panel-text">
                {nome}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10px] font-medium",
                  publicado
                    ? "border-acid/25 bg-acid/10 text-acid"
                    : "border-white/10 bg-white/[0.04] text-panel-muted",
                )}
              >
                {publicado ? (
                  <span className="pl-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-panel-muted/60"
                    aria-hidden="true"
                  />
                )}
                {publicado ? "No ar" : "Rascunho"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-panel-muted">
              {username && <span>@{username}</span>}
              {username && <span aria-hidden="true" className="h-3 w-px bg-white/10" />}
              <span className="font-mono text-[11px] text-panel-muted/90">
                {username ? enderecoPublico : "Endereço ainda não definido"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {username ? (
              <PublicPageLink
                username={username}
                className="pl-press inline-flex h-8 items-center gap-1.5 rounded border border-panel-line px-3 text-[12px] font-medium text-panel-text transition-[background-color,border-color,transform] hover:border-panel-line-strong hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
              >
                Abrir página
                <ExternalLink className="h-3.5 w-3.5 text-panel-muted" aria-hidden="true" />
              </PublicPageLink>
            ) : (
              <Link
                href="/painel/perfil"
                className="inline-flex h-8 items-center rounded border border-panel-line px-3 text-[12px] font-medium text-panel-text transition-colors hover:border-panel-line-strong hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
              >
                Escolher endereço
              </Link>
            )}
            {username && <CopiarLink url={urlPublica} />}
            <Link
              href="/painel/perfil"
              className="pl-press inline-flex h-8 items-center gap-1.5 rounded bg-signal px-3 text-[12px] font-semibold text-ink transition-[background-color,transform] hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              Editar perfil
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3.5 text-[12px] text-panel-muted">
          <span className="inline-flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            Aparência: <span className="text-panel-text">{temaNome}</span>
          </span>
          <Link
            href="/painel/template"
            className="rounded text-[12px] text-panel-muted underline-offset-4 transition-colors hover:text-panel-text hover:underline"
          >
            Trocar
          </Link>
          <span className="ml-auto text-[11px] text-panel-muted/80">
            {publicado ? "Sua página está recebendo visitas." : "Publique para começar a receber visitas."}
          </span>
        </div>
      </section>

      {/* Segunda faixa: prontidão + números */}
      <div className="pl-rise pl-rise-2 grid border-t border-white/[0.06] lg:grid-cols-12">
        <section
          aria-label="Prontidão da página"
          className="border-b border-white/[0.06] p-5 lg:col-span-4 lg:border-b-0 lg:border-r"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[14px] font-medium text-panel-text">Prontidão</h2>
            <Link
              href="/painel/perfil"
              className="rounded text-[11px] text-panel-muted transition-colors hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              Revisar
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="relative h-[92px] w-[92px] shrink-0">
              <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                  cx="48"
                  cy="48"
                  r={raio}
                  fill="none"
                  stroke="rgb(255 255 255 / 0.07)"
                  strokeWidth="6"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={raio}
                  fill="none"
                  stroke="#d018f6"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - Math.max(0, Math.min(100, pctProntos)) / 100}
                  className="pl-ring"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular font-sans text-[21px] font-medium leading-none text-panel-text">
                  {prontos}
                  <span className="text-panel-muted">/{totalItens}</span>
                </span>
                <span className="mt-1 text-[10px] text-panel-muted">itens</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] leading-snug text-panel-text">
                {pendentes.length === 0
                  ? "Tudo pronto para publicar."
                  : `${pendentes.length} ${pendentes.length === 1 ? "item falta" : "itens faltam"} para publicar.`}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-panel-muted">
                {pendentes.length === 0
                  ? "Sua página tem o essencial para receber produtores."
                  : "Complete o que falta para o perfil passar confiança."}
              </p>
            </div>
          </div>

          {pendentes.length > 0 ? (
            <ul className="mt-3">
              {pendentes.slice(0, 4).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="pl-row group -ml-3 flex items-center justify-between gap-3 rounded-md border-b border-white/[0.05] py-2 pl-3 last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Circle
                        className="h-3.5 w-3.5 shrink-0 text-panel-muted/50"
                        aria-hidden="true"
                      />
                      <span className="truncate text-[12px] text-panel-text">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-panel-muted transition-colors group-hover:text-signal-soft">
                      Completar
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-ok/[0.06] px-2.5 py-2 text-[12px] text-ok">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Nenhum item pendente
            </div>
          )}
        </section>

        <div className="pl-stagger grid divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:col-span-8">
          <SparkKpi
            rotulo="Visualizações"
            valor={totais.visualizacoes}
            variacao={variacoes.visualizacoes}
            serie={serie.map((ponto) => ponto.visualizacoes)}
            cor="#d018f6"
            id="visitas"
            nota="Visitas à sua página nos últimos 30 dias."
            indice={0}
          />
          <SparkKpi
            rotulo="Contatos"
            valor={totais.cliques}
            variacao={variacoes.cliques}
            serie={serie.map((ponto) => ponto.cliques)}
            cor="#d8ff4a"
            id="contatos"
            nota="Cliques em WhatsApp e e-mail."
            indice={1}
          />
          <SparkKpi
            rotulo="Conversão"
            valor={totais.taxaConversao}
            casas={1}
            sufixo="%"
            variacao={variacoes.conversao}
            serie={serieConversao}
            cor="#f2a8ff"
            id="conversao"
            nota="Contatos divididos pelas visitas do período."
            indice={2}
          />
        </div>
      </div>

      {/* Terceira faixa: gráfico + canal */}
      <div className="pl-rise pl-rise-3 grid border-t border-white/[0.06] lg:grid-cols-12">
        <section
          aria-label="Visitas e contatos nos últimos 30 dias"
          className="border-b border-white/[0.06] p-5 lg:col-span-8 lg:border-b-0 lg:border-r"
        >
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="font-display text-[14px] font-medium text-panel-text">
                Visitas e contatos
              </h2>
              <p className="mt-1 text-[11px] text-panel-muted">
                Últimos 30 dias · {resumo.diasComDados}{" "}
                {resumo.diasComDados === 1 ? "dia com movimento" : "dias com movimento"}
              </p>
            </div>
            <Link
              href="/painel/estatisticas"
              className="group inline-flex items-center gap-1 rounded text-[11px] text-panel-muted transition-colors hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              Estatísticas completas
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <GraficoArea
            key={serie.map((ponto) => ponto.visualizacoes).join("|")}
            serie={serie}
            className="mt-4"
          />

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-panel-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
              Visitas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-acid" aria-hidden="true" />
              Contatos
            </span>
            <span className="text-panel-muted/70">Passe o mouse para ver o dia.</span>
          </div>
        </section>

        <section aria-label="Canal que mais converte" className="flex flex-col p-5 lg:col-span-4">
          <h2 className="font-display text-[14px] font-medium text-panel-text">
            Canal que mais converte
          </h2>

          {temContatos ? (
            <>
              <div className="mt-3">
                <p className="font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-panel-text">
                  {canalTop.label}
                </p>
                <p className="mt-1.5 text-[12px] text-panel-muted">
                  {canalTop.valor} {canalTop.valor === 1 ? "contato" : "contatos"} ·{" "}
                  {Math.round((canalTop.valor / totais.cliques) * 100)}% do total
                </p>
              </div>

              <ul className="mt-4 space-y-2.5">
                {canais.map((canal) => {
                  const Icone = canal.icone;
                  const fatia = totais.cliques > 0 ? (canal.valor / totais.cliques) * 100 : 0;
                  return (
                    <li key={canal.label}>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 text-panel-muted">
                          <Icone className="h-3 w-3" aria-hidden="true" />
                          {canal.label}
                        </span>
                        <span className="tabular text-panel-text">{canal.valor}</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="pl-bar h-full rounded-full bg-signal/70"
                          style={{ width: `${fatia}%`, "--pl-i": canais.indexOf(canal) } as CSSProperties}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center py-6">
              <p className="text-[13px] leading-relaxed text-panel-text">Ainda sem contatos.</p>
              <p className="mt-1 text-[11px] leading-relaxed text-panel-muted">
                Quando alguém clicar em WhatsApp ou e-mail, o canal campeão aparece aqui.
              </p>
            </div>
          )}

          <Link
            href="/painel/contato"
            className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11px] text-panel-muted transition-colors hover:text-panel-text"
          >
            Configurar contato
            <ChevronRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </section>
      </div>

      {/* Quarta faixa: agenda + atalhos */}
      <div className="pl-rise pl-rise-4 grid border-t border-white/[0.06] lg:grid-cols-12">
        <section
          aria-label="Próximos shows"
          className="border-b border-white/[0.06] p-5 lg:col-span-8 lg:border-b-0 lg:border-r"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[14px] font-medium text-panel-text">
              Próximos shows
            </h2>
            <Link
              href="/painel/agenda"
              className="group inline-flex items-center gap-1 rounded text-[11px] text-panel-muted transition-colors hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              Agenda
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {shows.length === 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-white/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-panel-muted">
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[13px] text-panel-text">Nenhuma data marcada.</p>
                  <p className="mt-0.5 text-[11px] text-panel-muted">
                    A agenda é o que mais converte visita em contratação.
                  </p>
                </div>
              </div>
              <Link
                href="/painel/agenda"
                className="inline-flex h-8 items-center rounded border border-panel-line px-3 text-[12px] font-medium text-panel-text transition-colors hover:border-panel-line-strong hover:bg-white/[0.04]"
              >
                Adicionar show
              </Link>
            </div>
          ) : (
            <div className="pl-stagger mt-3 grid gap-2.5 sm:grid-cols-3">
              {shows.map((show, indice) => {
                const { dia, mes } = formatarDataCurta(show.data);
                return (
                  <Link
                    key={show.id}
                    href="/painel/agenda"
                    style={{ "--pl-i": indice } as CSSProperties}
                    className="pl-press pl-lift group rounded-[10px] border border-white/[0.07] bg-white/[0.02] p-3 hover:border-white/[0.14] hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                  >
                    <div className="flex items-baseline gap-1.5">
                      <span className="tabular font-sans text-[26px] font-medium leading-none text-panel-text">
                        {dia}
                      </span>
                      <span className="text-[11px] text-panel-muted">{mes}</span>
                      {show.horario && (
                        <span className="ml-auto text-[10px] text-panel-muted">
                          {show.horario.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-[12px] font-medium text-panel-text">
                      {show.nome_evento}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-panel-muted">
                      {[show.local, show.cidade].filter(Boolean).join(", ") || "Local a definir"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section aria-label="Ações rápidas" className="flex flex-col p-5 lg:col-span-4">
          <h2 className="font-display text-[14px] font-medium text-panel-text">Ações rápidas</h2>
          <ul className="pl-stagger mt-2">
            {[
              { href: "/painel/agenda", label: "Agendar show", icone: CalendarPlus },
              { href: "/painel/musica", label: "Enviar música", icone: Music },
              { href: "/painel/galeria", label: "Adicionar fotos", icone: Images },
              { href: "/painel/template", label: "Trocar aparência", icone: Palette },
            ].map((acao, indice) => {
              const Icone = acao.icone;
              return (
                <li key={acao.href} style={{ "--pl-i": indice } as CSSProperties}>
                  <Link
                    href={acao.href}
                    className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-panel-muted transition-[color,transform] duration-200 group-hover:scale-110 group-hover:text-panel-text">
                      <Icone className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="flex-1 text-[12px] text-panel-text">{acao.label}</span>
                    <ChevronRight
                      className="h-3.5 w-3.5 text-panel-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-panel-muted"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
