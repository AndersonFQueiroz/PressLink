import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { galeriaDeleteSchema, MAX_FILE_SIZE, ALLOWED_TYPES, MAX_FILES } from "@/lib/validators/galeria";

// GET /api/galeria — lista fotos do usuário logado ordenadas por ordem
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const { data, error } = await supabase
    .from("foto_galeria")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fotos: data ?? [] });
}

// POST /api/galeria — upload múltiplo (FormData files)
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: `Máximo ${MAX_FILES} arquivos` }, { status: 400 });

  // valida tipo/tamanho antes de upload
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${f.name} excede 5MB` }, { status: 400 });
    if (!ALLOWED_TYPES.includes(f.type)) return NextResponse.json({ error: `${f.name}: tipo não permitido` }, { status: 400 });
  }

  // ordem = max existente +1
  const { data: existentes } = await supabase.from("foto_galeria").select("ordem").eq("perfil_id", perfil.id).order("ordem", { ascending: false }).limit(1);
  let nextOrdem = (existentes?.[0]?.ordem ?? -1) + 1;

  const inserted: unknown[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage.from("galeria").upload(key, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadErr) return NextResponse.json({ error: `Upload falhou: ${uploadErr.message}` }, { status: 500 });

    const { data: pub } = supabase.storage.from("galeria").getPublicUrl(key);
    const { data, error } = await supabase
      .from("foto_galeria")
      .insert({ perfil_id: perfil.id, url: pub.publicUrl, ordem: nextOrdem++, alt_text: file.name })
      .select()
      .single();
    if (error) {
      // rollback storage
      await supabase.storage.from("galeria").remove([key]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    inserted.push(data);
  }

  return NextResponse.json({ fotos: inserted }, { status: 201 });
}

// DELETE /api/galeria?id=uuid — remove registro + arquivo Storage
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const parsed = galeriaDeleteSchema.safeParse({ id });
  if (!parsed.success) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const { data: foto, error: findErr } = await supabase
    .from("foto_galeria")
    .select("id,url,perfil_id")
    .eq("id", parsed.data.id)
    .eq("perfil_id", perfil.id)
    .single();
  if (findErr || !foto) return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });

  // extrai key do publicUrl: .../galeria/<uid>/file
  const urlParts = foto.url.split("/galeria/");
  const storageKey = urlParts[1] ? decodeURIComponent(urlParts[1]) : null;

  const { error: delErr } = await supabase.from("foto_galeria").delete().eq("id", foto.id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (storageKey) {
    await supabase.storage.from("galeria").remove([storageKey]);
  }

  return NextResponse.json({ ok: true });
}
