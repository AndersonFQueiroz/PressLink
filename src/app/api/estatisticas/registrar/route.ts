import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

const TIPOS_VALIDOS = ["page_view", "click_whatsapp", "click_email", "click_formulario"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.tipo || !TIPOS_VALIDOS.includes(body.tipo)) {
      return NextResponse.json(
        { error: "Tipo de evento inválido ou ausente." },
        { status: 400 },
      );
    }

    const { perfil_id, username, tipo } = body;
    if (!perfil_id && !username) {
      return NextResponse.json(
        { error: "Identificador (perfil_id ou username) é obrigatório." },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    let resolvedPerfilId = perfil_id;
    if (!resolvedPerfilId && username) {
      const { data: perfil, error: perfilErr } = await supabase
        .from("perfil")
        .select("id")
        .eq("username", String(username).trim().toLowerCase())
        .eq("publicado", true)
        .maybeSingle();

      if (perfilErr || !perfil) {
        return NextResponse.json(
          { error: "Perfil não encontrado ou não publicado." },
          { status: 404 },
        );
      }
      resolvedPerfilId = perfil.id;
    }

    // Anonimização de IP conforme LGPD (SHA-256)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const rawIp = (forwardedFor ? forwardedFor.split(",")[0] : realIp) || "127.0.0.1";
    const ip_hash = createHash("sha256").update(rawIp.trim()).digest("hex");
    const user_agent = request.headers.get("user-agent") || null;

    const { error: insertError } = await supabase
      .from("visualizacao_de_pagina")
      .insert({
        perfil_id: resolvedPerfilId,
        tipo,
        ip_hash,
        user_agent,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registered: tipo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno ao registrar evento." }, { status: 500 });
  }
}
