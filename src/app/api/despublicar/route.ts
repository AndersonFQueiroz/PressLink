import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePublicPages } from "@/lib/revalidate-public";

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
    .select("id, username, publicado")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (perfilError) {
    return NextResponse.json({ error: perfilError.message }, { status: 500 });
  }

  if (!perfil) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  // 2. Atualiza estado para publicado = false
  const { error: updateError } = await supabase
    .from("perfil")
    .update({
      publicado: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", perfil.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Invalida cache imediato da página pública para refletir 404/despublicação
  revalidatePublicPages(perfil.username);

  return NextResponse.json({
    success: true,
    publicado: false,
    message: "Portfólio despublicado com sucesso.",
  });
}
