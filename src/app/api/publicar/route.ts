import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublicPages } from "@/lib/revalidate-public";
import { publicProfileUrl } from "@/lib/site";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 1. Busca perfil do usuário autenticado
  const { data: perfil, error: perfilError } = await supabase
    .from("perfil")
    .select("id, username, nome_artistico, publicado")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return NextResponse.json({ error: perfilError.message }, { status: 500 });
  }

  if (!perfil) {
    return NextResponse.json(
      { error: "Perfil não encontrado. Salve as informações do perfil antes de publicar." },
      { status: 404 },
    );
  }

  // 2. Validação server-side dos pré-requisitos (RF-25 / specs.md UC01)
  const pendencias: string[] = [];

  if (!perfil.nome_artistico || !perfil.nome_artistico.trim()) {
    pendencias.push("Nome artístico é obrigatório.");
  }

  if (!perfil.username || !perfil.username.trim()) {
    pendencias.push("Username é obrigatório.");
  }

  // Consulta contagem de fotos na galeria (mínimo 1)
  const { count: fotoCount, error: fotoError } = await supabase
    .from("foto_galeria")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", perfil.id);

  if (fotoError) {
    return NextResponse.json({ error: fotoError.message }, { status: 500 });
  }

  if ((fotoCount ?? 0) < 1) {
    pendencias.push("É necessário cadastrar pelo menos 1 foto na galeria.");
  }

  // Consulta contagem de links de mídia (mínimo 1)
  const { count: midiaCount, error: midiaError } = await supabase
    .from("link_de_midia")
    .select("id", { count: "exact", head: true })
    .eq("perfil_id", perfil.id);

  if (midiaError) {
    return NextResponse.json({ error: midiaError.message }, { status: 500 });
  }

  if ((midiaCount ?? 0) < 1) {
    pendencias.push("É necessário cadastrar pelo menos 1 link de música ou vídeo.");
  }

  if (pendencias.length > 0) {
    return NextResponse.json(
      {
        error: "Pré-requisitos obrigatórios pendentes para publicação.",
        pendencias,
      },
      { status: 400 },
    );
  }

  // 3. Atualização do estado no banco (publicado = true)
  const { error: updateError } = await supabase
    .from("perfil")
    .update({
      publicado: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", perfil.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 4. Invalidação imediata do cache ISR da página pública
  revalidatePublicPages(perfil.username);

  // 5. Retorna dados e URL gerada
  const url = publicProfileUrl(perfil.username);
  // Versão curta para exibir no painel: mesma origem real, sem protocolo.
  const displayUrl = url.replace(/^https?:\/\//, "");

  return NextResponse.json({
    success: true,
    publicado: true,
    username: perfil.username,
    url,
    displayUrl,
    message: "Portfólio publicado com sucesso!",
  });
}
