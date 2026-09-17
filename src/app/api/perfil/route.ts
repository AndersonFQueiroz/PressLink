import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { perfilSchema } from "@/lib/validators/perfil";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabase.from("perfil").select("*").eq("usuario_id", user.id).single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ perfil: data ?? null });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = perfilSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    usuario_id: user.id,
    nome_artistico: parsed.data.nome_artistico,
    username: parsed.data.username,
    biografia_pt: parsed.data.biografia_pt || null,
    biografia_en: parsed.data.biografia_en || null,
    instagram: parsed.data.instagram || null,
    tiktok: parsed.data.tiktok || null,
    twitter_x: parsed.data.twitter_x || null,
    facebook: parsed.data.facebook || null,
  };

  const { data, error } = await supabase
    .from("perfil")
    .upsert(payload, { onConflict: "usuario_id" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Username já está em uso" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ perfil: data });
}
