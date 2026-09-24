import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  detectTipoMidia,
  linkMidiaSchema,
} from "@/lib/validators/links";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Busca o perfil do usuário
  const { data: perfil, error: perfilError } = await supabase
    .from("perfil")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return NextResponse.json({ error: perfilError.message }, { status: 500 });
  }

  if (!perfil) {
    return NextResponse.json({ links: [] });
  }

  const { data: links, error: linksError } = await supabase
    .from("link_de_midia")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 500 });
  }

  return NextResponse.json({ links: links ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = linkMidiaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Localiza ou garante que o perfil exista
  let { data: perfil } = await supabase
    .from("perfil")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!perfil) {
    // Cria perfil básico se ainda não tiver sido salvo no banco
    const fallbackUsername =
      user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || `dj${Date.now()}`;
    const { data: novoPerfil, error: createPerfilError } = await supabase
      .from("perfil")
      .insert({
        usuario_id: user.id,
        username: fallbackUsername.slice(0, 30),
      })
      .select("id")
      .single();

    if (createPerfilError || !novoPerfil) {
      return NextResponse.json(
        { error: "Não foi possível vincular o perfil ao usuário" },
        { status: 500 }
      );
    }
    perfil = novoPerfil;
  }

  const tipo = parsed.data.tipo || detectTipoMidia(parsed.data.url);
  if (!tipo) {
    return NextResponse.json(
      { error: "Não foi possível identificar a plataforma da URL fornecida." },
      { status: 400 }
    );
  }

  // Determina a ordem do novo link caso não tenha sido informada
  let ordem = parsed.data.ordem;
  if (ordem === undefined) {
    const { count } = await supabase
      .from("link_de_midia")
      .select("id", { count: "exact", head: true })
      .eq("perfil_id", perfil.id);
    ordem = count ?? 0;
  }

  const { data: novoLink, error: insertError } = await supabase
    .from("link_de_midia")
    .insert({
      perfil_id: perfil.id,
      tipo,
      url: parsed.data.url,
      titulo: parsed.data.titulo,
      ordem,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ link: novoLink }, { status: 201 });
}
