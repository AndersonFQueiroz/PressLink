import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  agregarEventos,
  intervaloEstatisticas,
  normalizarPeriodo,
  type EventoEstatistica,
} from "@/lib/estatisticas";

const TAMANHO_PAGINA = 1000;
/** Teto de segurança para não varrer uma base gigante em uma única requisição. */
const MAXIMO_EVENTOS = 20_000;

type ClienteSupabase = Awaited<ReturnType<typeof createClient>>;

type ResultadoEventos = {
  eventos: EventoEstatistica[];
  erro: string | null;
  truncado: boolean;
};

/**
 * Lê os eventos do período atual + anterior. O PostgREST limita cada resposta a
 * 1000 linhas, por isso a leitura pagina até acabar (ou até o teto).
 */
async function carregarEventos(
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

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const periodo = normalizarPeriodo(
    new URL(request.url).searchParams.get("periodo"),
  );

  // Busca perfil do usuário logado
  const { data: perfil, error: perfilError } = await supabase
    .from("perfil")
    .select("id, username, publicado")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return NextResponse.json({ error: perfilError.message }, { status: 500 });
  }

  if (!perfil) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const agora = new Date();
  const { desdeAnterior } = intervaloEstatisticas(periodo, agora);
  const { eventos, erro, truncado } = await carregarEventos(
    supabase,
    perfil.id,
    desdeAnterior,
  );

  if (erro) {
    return NextResponse.json({ error: erro }, { status: 500 });
  }

  const resumo = agregarEventos(eventos, periodo, agora);

  return NextResponse.json(
    {
      perfil_id: perfil.id,
      username: perfil.username,
      publicado: perfil.publicado,
      periodo,
      // Contrato anterior (totais do período selecionado) — mantido para os
      // consumidores existentes.
      totalVisualizacoes: resumo.totais.visualizacoes,
      totalCliques: resumo.totais.cliques,
      taxaConversao: resumo.totais.taxaConversao,
      detalhes: {
        whatsapp: resumo.totais.whatsapp,
        email: resumo.totais.email,
        formulario: resumo.totais.formulario,
      },
      anterior: {
        totalVisualizacoes: resumo.anterior.visualizacoes,
        totalCliques: resumo.anterior.cliques,
        taxaConversao: resumo.anterior.taxaConversao,
      },
      variacoes: resumo.variacoes,
      serie: resumo.serie,
      diasComDados: resumo.diasComDados,
      totalEventos: resumo.totalEventos,
      truncado,
      geradoEm: agora.toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
