import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { perfilSchema } from "@/lib/validators/perfil";
import { contatoSchema } from "@/lib/validators/contato";

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
    ...(parsed.data.foto_url ? { foto_url: parsed.data.foto_url } : {}),
    ...(parsed.data.whatsapp !== undefined ? { whatsapp: parsed.data.whatsapp || null } : {}),
    ...(parsed.data.email_booking !== undefined ? { email_booking: parsed.data.email_booking || null } : {}),
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

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  if ("whatsapp" in body || "email_booking" in body) {
    const parsed = contatoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { data: existing, error: findError } = await supabase
      .from("perfil")
      .select("id")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });

    if (!existing) {
      return NextResponse.json(
        { error: "Salve a página Perfil antes de configurar o contato." },
        { status: 409 },
      );
    }

    const payload = {
      usuario_id: user.id,
      whatsapp: parsed.data.whatsapp || null,
      email_booking: parsed.data.email_booking || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("perfil")
      .upsert(payload, { onConflict: "usuario_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ perfil: data });
  }

  return NextResponse.json({ error: "Nenhum campo reconhecido para atualização" }, { status: 400 });
}
