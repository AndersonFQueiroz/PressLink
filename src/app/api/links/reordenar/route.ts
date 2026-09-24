import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reordenarLinksSchema } from "@/lib/validators/links";

export async function PUT(req: Request) {
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

  const parsed = reordenarLinksSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!perfil) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const { ids } = parsed.data;

  // Atualiza a ordem de cada link sequencialmente
  const updates = ids.map((id, index) =>
    supabase
      .from("link_de_midia")
      .update({ ordem: index })
      .eq("id", id)
      .eq("perfil_id", perfil.id)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error !== null);

  if (hasError) {
    return NextResponse.json(
      { error: "Erro ao atualizar a ordem de alguns links" },
      { status: 500 }
    );
  }

  // Retorna os links atualizados
  const { data: linksAtualizados, error: fetchError } = await supabase
    .from("link_de_midia")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("ordem", { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ links: linksAtualizados });
}
