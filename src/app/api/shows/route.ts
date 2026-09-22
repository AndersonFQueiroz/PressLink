import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { showCreateSchema, showUpdateSchema, showDeleteSchema } from "@/lib/validators/shows";

async function getPerfilOrError(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) as unknown as null, user: null, perfil: null };
  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return { error: NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 }) as unknown as null, user: null, perfil: null };
  return { error: null, user, perfil };
}

// GET /api/shows — lista cronológica (data asc, horario asc, created_at)
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { data: perfil } = await supabase.from("perfil").select("id").eq("usuario_id", user.id).single();
  if (!perfil) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const { data, error } = await supabase
    .from("data_de_show")
    .select("*")
    .eq("perfil_id", perfil.id)
    .order("data", { ascending: true })
    .order("horario", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shows: data ?? [] });
}

// POST /api/shows — cria show
export async function POST(req: Request) {
  const supabase = await createClient();
  const auth = await getPerfilOrError(supabase);
  if (auth.error) return auth.error;
  const perfil = auth.perfil!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = showCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { data, error } = await supabase
    .from("data_de_show")
    .insert({ perfil_id: perfil.id, ...parsed.data })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ show: data }, { status: 201 });
}

// PUT /api/shows?id=uuid — atualiza show
export async function PUT(req: Request) {
  const supabase = await createClient();
  const auth = await getPerfilOrError(supabase);
  if (auth.error) return auth.error;
  const perfil = auth.perfil!;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const idCheck = showDeleteSchema.safeParse({ id });
  if (!idCheck.success) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = showBaseParse(body, idCheck.data.id);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { data: existente, error: findErr } = await supabase
    .from("data_de_show")
    .select("id")
    .eq("id", idCheck.data.id)
    .eq("perfil_id", perfil.id)
    .single();
  if (findErr || !existente) return NextResponse.json({ error: "Show não encontrado" }, { status: 404 });

  const { data, error } = await supabase
    .from("data_de_show")
    .update({ nome_evento: parsed.data.nome_evento, data: parsed.data.data, horario: parsed.data.horario, local: parsed.data.local, cidade: parsed.data.cidade })
    .eq("id", idCheck.data.id)
    .eq("perfil_id", perfil.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ show: data });
}

function showBaseParse(body: unknown, id: string) {
  return showUpdateSchema.safeParse({ ...(body as Record<string, unknown>), id });
}

// DELETE /api/shows?id=uuid
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const auth = await getPerfilOrError(supabase);
  if (auth.error) return auth.error;
  const perfil = auth.perfil!;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const parsed = showDeleteSchema.safeParse({ id });
  if (!parsed.success) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { error } = await supabase.from("data_de_show").delete().eq("id", parsed.data.id).eq("perfil_id", perfil.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // verifica se deletou (opcional: checa count)
  return NextResponse.json({ ok: true });
}
