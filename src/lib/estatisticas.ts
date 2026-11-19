/**
 * Agregação das estatísticas do portfólio (RF-28, RF-29, RF-30).
 *
 * Os eventos são gravados em UTC (`created_at timestamptz`), mas o DJ pensa em
 * dias de Brasília — por isso todo agrupamento diário acontece no fuso
 * `America/Sao_Paulo`, independente do fuso do servidor.
 */

export const FUSO_ESTATISTICAS = "America/Sao_Paulo";

export type PeriodoEstatisticas = 7 | 30;

export const PERIODOS_ESTATISTICAS: readonly PeriodoEstatisticas[] = [7, 30];

export const PERIODO_PADRAO: PeriodoEstatisticas = 30;

export type EventoEstatistica = {
  tipo: string;
  created_at: string;
};

export type TotaisEstatisticas = {
  /** Visualizações da página pública (`page_view`). */
  visualizacoes: number;
  whatsapp: number;
  email: number;
  formulario: number;
  /** Soma dos três tipos de clique. */
  cliques: number;
  /** Cliques / visualizações, em %. */
  taxaConversao: number;
};

export type PontoSerie = {
  /** Dia no formato `YYYY-MM-DD` (fuso de Brasília). */
  data: string;
  /** Rótulo curto para o eixo do gráfico (`DD/MM`). */
  rotulo: string;
  visualizacoes: number;
  cliques: number;
};

export type ResumoEstatisticas = {
  periodo: PeriodoEstatisticas;
  totais: TotaisEstatisticas;
  /** Mesmo período imediatamente anterior, usado para a variação. */
  anterior: TotaisEstatisticas;
  variacoes: {
    /** Variação percentual (%). `null` quando não há base de comparação. */
    visualizacoes: number | null;
    cliques: number | null;
    /** Diferença em pontos percentuais da taxa de conversão. */
    conversao: number | null;
  };
  /** Um ponto por dia do período, em ordem crescente. */
  serie: PontoSerie[];
  diasComDados: number;
  /** Total de eventos considerados (visualizações + cliques). */
  totalEventos: number;
};

const DIA_EM_MS = 86_400_000;

const TIPOS_DE_CLIQUE = new Set(["click_whatsapp", "click_email", "click_formulario"]);
const TIPOS_VALIDOS = new Set(["page_view", ...TIPOS_DE_CLIQUE]);

const FORMATADOR_DIA = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_ESTATISTICAS,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const FORMATADOR_OFFSET = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO_ESTATISTICAS,
  timeZoneName: "longOffset",
});

/** Deslocamento do fuso (em minutos) no instante informado. */
function offsetMinutos(data: Date): number {
  const parte = FORMATADOR_OFFSET.formatToParts(data).find(
    (p) => p.type === "timeZoneName",
  )?.value;

  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(parte ?? "");

  if (!match) return 0;

  const sinal = match[1] === "-" ? -1 : 1;
  return sinal * (Number(match[2]) * 60 + Number(match[3]));
}

/** Dia de Brasília no formato `YYYY-MM-DD`. */
export function diaNoFuso(data: Date): string {
  return FORMATADOR_DIA.format(data);
}

/**
 * Meia-noite de Brasília do dia em que `data` cai, representada como instante
 * UTC (ex.: `2026-11-18T03:00:00.000Z`).
 */
export function inicioDoDia(data: Date): Date {
  const [ano, mes, dia] = diaNoFuso(data).split("-").map(Number);
  const meiaNoiteUtc = Date.UTC(ano, mes - 1, dia);

  // Duas passadas: a primeira estima o offset no palpite, a segunda confirma
  // com o horário já ajustado.
  let instante = meiaNoiteUtc;

  for (let i = 0; i < 2; i++) {
    instante = meiaNoiteUtc - offsetMinutos(new Date(instante)) * 60_000;
  }

  return new Date(instante);
}

export function normalizarPeriodo(valor: unknown): PeriodoEstatisticas {
  const numero = Number(valor);
  return PERIODOS_ESTATISTICAS.includes(numero as PeriodoEstatisticas)
    ? (numero as PeriodoEstatisticas)
    : PERIODO_PADRAO;
}

export type IntervaloEstatisticas = {
  /** Primeiro instante do período (inclusive). */
  desde: Date;
  /** Primeiro instante depois do período (exclusivo). */
  ate: Date;
  /** Primeiro instante do período anterior de comparação (inclusive). */
  desdeAnterior: Date;
};

export function intervaloEstatisticas(
  periodo: PeriodoEstatisticas,
  agora: Date = new Date(),
): IntervaloEstatisticas {
  const hoje = inicioDoDia(agora);
  const desde = new Date(hoje.getTime() - (periodo - 1) * DIA_EM_MS);
  const ate = new Date(hoje.getTime() + DIA_EM_MS);

  return {
    desde,
    ate,
    desdeAnterior: new Date(desde.getTime() - periodo * DIA_EM_MS),
  };
}

function totaisVazios(): TotaisEstatisticas {
  return {
    visualizacoes: 0,
    whatsapp: 0,
    email: 0,
    formulario: 0,
    cliques: 0,
    taxaConversao: 0,
  };
}

function somarEvento(totais: TotaisEstatisticas, tipo: string): void {
  if (tipo === "page_view") {
    totais.visualizacoes += 1;
    return;
  }

  if (tipo === "click_whatsapp") totais.whatsapp += 1;
  else if (tipo === "click_email") totais.email += 1;
  else if (tipo === "click_formulario") totais.formulario += 1;

  totais.cliques += 1;
}

function fecharTotais(totais: TotaisEstatisticas): TotaisEstatisticas {
  return {
    ...totais,
    taxaConversao:
      totais.visualizacoes > 0
        ? Number(((totais.cliques / totais.visualizacoes) * 100).toFixed(1))
        : 0,
  };
}

function variacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior <= 0) return null;
  return Number((((atual - anterior) / anterior) * 100).toFixed(1));
}

export function agregarEventos(
  eventos: readonly EventoEstatistica[],
  periodo: PeriodoEstatisticas,
  agora: Date = new Date(),
): ResumoEstatisticas {
  const { desde, ate, desdeAnterior } = intervaloEstatisticas(periodo, agora);

  const serie: PontoSerie[] = [];

  for (let i = 0; i < periodo; i++) {
    const instante = new Date(desde.getTime() + i * DIA_EM_MS);
    const data = diaNoFuso(instante);
    serie.push({
      data,
      rotulo: `${data.slice(8, 10)}/${data.slice(5, 7)}`,
      visualizacoes: 0,
      cliques: 0,
    });
  }

  const indicePorDia = new Map(serie.map((ponto, indice) => [ponto.data, indice]));

  const totais = totaisVazios();
  const anterior = totaisVazios();
  let totalEventos = 0;

  for (const evento of eventos) {
    if (!TIPOS_VALIDOS.has(evento.tipo)) continue;

    const quando = new Date(evento.created_at);

    if (Number.isNaN(quando.getTime())) continue;

    if (quando >= desde && quando < ate) {
      somarEvento(totais, evento.tipo);
      totalEventos += 1;

      const indice = indicePorDia.get(diaNoFuso(quando));

      if (indice !== undefined) {
        if (evento.tipo === "page_view") serie[indice].visualizacoes += 1;
        else serie[indice].cliques += 1;
      }
    } else if (quando >= desdeAnterior && quando < desde) {
      somarEvento(anterior, evento.tipo);
    }
  }

  const totaisFechados = fecharTotais(totais);
  const anteriorFechado = fecharTotais(anterior);

  return {
    periodo,
    totais: totaisFechados,
    anterior: anteriorFechado,
    variacoes: {
      visualizacoes: variacaoPercentual(
        totaisFechados.visualizacoes,
        anteriorFechado.visualizacoes,
      ),
      cliques: variacaoPercentual(totaisFechados.cliques, anteriorFechado.cliques),
      conversao:
        anteriorFechado.visualizacoes > 0
          ? Number(
              (totaisFechados.taxaConversao - anteriorFechado.taxaConversao).toFixed(1),
            )
          : null,
    },
    serie,
    diasComDados: serie.filter(
      (ponto) => ponto.visualizacoes > 0 || ponto.cliques > 0,
    ).length,
    totalEventos,
  };
}
