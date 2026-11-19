import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  agregarEventos,
  intervaloEstatisticas,
  normalizarPeriodo,
} from "@/lib/estatisticas";
import { carregarEventos } from "@/lib/estatisticas-servidor";

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
