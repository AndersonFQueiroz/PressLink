import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").toLowerCase().trim();

  if (!username || !usernameRegex.test(username) || username.length < 3 || username.length > 30) {
    return NextResponse.json({ available: false, reason: "Formato inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("perfil").select("usuario_id").eq("username", username).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data) return NextResponse.json({ available: true });
  if (user && data.usuario_id === user.id) return NextResponse.json({ available: true, own: true });

  return NextResponse.json({ available: false });
}
