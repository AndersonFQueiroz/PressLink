import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  detectTipoMidia,
  linkMidiaUpdateSchema,
} from "@/lib/validators/links";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
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

  const parsed = linkMidiaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verifica se o perfil pertence ao usuário logado
  const { data: perfil } = await supabase
    .from("perfil")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!perfil) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (parsed.data.titulo !== undefined) {
    updatePayload.titulo = parsed.data.titulo;
  }
  if (parsed.data.url !== undefined) {
    updatePayload.url = parsed.data.url;
    const tipo = detectTipoMidia(parsed.data.url);
    if (tipo) {
      updatePayload.tipo = tipo;
    }
  }
  if (parsed.data.ordem !== undefined) {
    updatePayload.ordem = parsed.data.ordem;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar informado" }, { status: 400 });
  }

  const { data: updatedLink, error: updateError } = await supabase
    .from("link_de_midia")
    .update(updatePayload)
    .eq("id", id)
    .eq("perfil_id", perfil.id)
    .select("*")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updatedLink) {
    return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ link: updatedLink });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!perfil) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("link_de_midia")
    .delete()
    .eq("id", id)
    .eq("perfil_id", perfil.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Link excluído com sucesso" });
}
