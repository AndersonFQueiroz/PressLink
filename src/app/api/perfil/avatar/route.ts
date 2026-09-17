import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { avatarUrlSchema } from "@/lib/validators/avatar";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = avatarUrlSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "URL inválida", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase
    .from("perfil")
    .update({ foto_url: parsed.data.foto_url })
    .eq("usuario_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ foto_url: parsed.data.foto_url });
}
