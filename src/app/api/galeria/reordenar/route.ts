import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { galeriaReordenarSchema } from "@/lib/validators/galeria";

// PUT /api/galeria/reordenar — atualiza ordem das fotos { ids: string[] }
export async function PUT(req: Request) {
  const supabase = await createClient();
  let user: import("@supabase/supabase-js").User | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    user = data.user;
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = galeriaReordenarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 });
  }

  const { ids } = parsed.data;

  // verifica se todos os ids pertencem ao perfil (evita reorder de outro usuário)
  const { data: fotos, error: fetchErr } = await supabase
    .from("foto_galeria")
    .select("id")
    .eq("perfil_id", perfil.id)
    .in("id", ids);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if ((fotos?.length ?? 0) !== ids.length) {
    return NextResponse.json({ error: "Alguma foto não encontrada ou não pertence ao perfil" }, { status: 404 });
  }

  // atualiza ordem sequencialmente (ordem = índice)
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase.from("foto_galeria").update({ ordem: i }).eq("id", ids[i]).eq("perfil_id", perfil.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
