import { createClient } from "@/lib/supabase/server";
import type { EventoEstatistica } from "@/lib/estatisticas";

const TAMANHO_PAGINA = 1000;
/** Teto de segurança para não varrer uma base gigante em uma única requisição. */
const MAXIMO_EVENTOS = 20_000;

type ClienteSupabase = Awaited<ReturnType<typeof createClient>>;

export type ResultadoEventos = {
  eventos: EventoEstatistica[];
  erro: string | null;
  truncado: boolean;
};

/**
 * Lê os eventos do período (atual + anterior) para o painel.
 * O PostgREST limita cada resposta a 1000 linhas, por isso pagina até acabar
 * (ou até o teto). Em erro devolve o que já leu — o painel mostra os números
 * parciais em vez de derrubar a tela.
 */
export async function carregarEventos(
  supabase: ClienteSupabase,
  perfilId: string,
  desde: Date,
): Promise<ResultadoEventos> {
  const eventos: EventoEstatistica[] = [];

  for (let inicio = 0; inicio < MAXIMO_EVENTOS; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from("visualizacao_de_pagina")
      .select("tipo, created_at")
      .eq("perfil_id", perfilId)
      .gte("created_at", desde.toISOString())
      .order("created_at", { ascending: true })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) {
      return { eventos, erro: error.message, truncado: false };
    }

    const lote = (data ?? []) as EventoEstatistica[];
    eventos.push(...lote);

    if (lote.length < TAMANHO_PAGINA) {
      return { eventos, erro: null, truncado: false };
    }
  }

  return { eventos, erro: null, truncado: true };
}
