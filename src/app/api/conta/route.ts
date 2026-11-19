import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { senhaConfere } from "@/lib/supabase/password-check";
import { excluirContaSchema } from "@/lib/validators/conta";
import { revalidatePublicPages } from "@/lib/revalidate-public";

/** Buckets que guardam arquivos do DJ (issue #29 / RNF-12). */
const BUCKETS = ["avatars", "galeria"] as const;

/** Teto de segurança da paginação do Storage (10 arquivos por página). */
const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/**
 * Lista todas as chaves do usuário num bucket.
 *
 * O Storage lista por "pasta" com paginação de no máximo 100 itens; os
 * caminhos do app são sempre `<user_id>/<arquivo>`, então basta uma consulta
 * paginada na pasta do usuário. Itens sem `id` são subpastas (não usadas pelo
 * app) e ficam de fora.
 */
async function listarChaves(
  supabase: SupabaseClient,
  bucket: string,
  usuarioId: string,
): Promise<string[]> {
  const chaves: string[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(usuarioId, { limit: PAGE_SIZE, offset: page * PAGE_SIZE });

    if (error) throw new Error(`Falha ao listar ${bucket}: ${error.message}`);
    if (!data?.length) break;

    for (const item of data) {
      if (item.id) chaves.push(`${usuarioId}/${item.name}`);
    }

    if (data.length < PAGE_SIZE) break;
  }

  return chaves;
}

/**
 * DELETE /api/conta — exclusão permanente da conta do próprio usuário (#29).
 *
 * Ordem deliberada:
 *  1. sessão válida;
 *  2. senha confere (confirmação explícita do critério de aceite);
 *  3. arquivos saem do Storage **antes** do banco — se o Storage falhar, nada
 *     é apagado e nenhum arquivo público fica órfão;
 *  4. `excluir_minha_conta()` remove a linha em auth.users (SECURITY DEFINER)
 *     e o cascade leva perfil, links, fotos, shows e estatísticas;
 *  5. logout + redirect para a landing com a mensagem de confirmação.
 */
export async function DELETE(req: Request) {
  const supabase = await createClient();

  let user: { id: string; email?: string | null } | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    user = data.user;
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const parsed = excluirContaSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "Conta sem e-mail não pode ser excluída por aqui. Fale com o suporte." },
      { status: 400 },
    );
  }

  let senhaOk = false;
  try {
    senhaOk = await senhaConfere(user.email, parsed.data.senha);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível confirmar sua senha agora. Tente novamente." },
      { status: 503 },
    );
  }
  if (!senhaOk) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });
  }

  // Username antes da exclusão: serve para invalidar a URL pública concreta
  // (`/nome`) além do padrão `/[username]`.
  const { data: perfil } = await supabase
    .from("perfil")
    .select("username")
    .eq("usuario_id", user.id)
    .maybeSingle();

  // 1) Storage primeiro (a conta só é apagada se os arquivos saírem).
  try {
    for (const bucket of BUCKETS) {
      const chaves = await listarChaves(supabase, bucket, user.id);

      // `remove` do Storage aceita no máximo 100 caminhos por chamada.
      for (let i = 0; i < chaves.length; i += PAGE_SIZE) {
        const { error } = await supabase.storage
          .from(bucket)
          .remove(chaves.slice(i, i + PAGE_SIZE));
        if (error) {
          return NextResponse.json(
            {
              error: `Não foi possível remover seus arquivos de ${bucket}. Sua conta não foi excluída — tente novamente.`,
            },
            { status: 500 },
          );
        }
      }
    }
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : "erro desconhecido";
    return NextResponse.json(
      {
        error: `Não foi possível remover seus arquivos. Sua conta não foi excluída — tente novamente. (${detalhe})`,
      },
      { status: 500 },
    );
  }

  // 2) auth.users (cascade cobre o resto). SECURITY DEFINER + auth.uid().
  const { error: rpcError } = await supabase.rpc("excluir_minha_conta");
  if (rpcError) {
    const faltandoFuncao =
      rpcError.code === "PGRST202" || rpcError.code === "42883";
    return NextResponse.json(
      {
        error: faltandoFuncao
          ? "Função de exclusão ausente no banco. Aplique supabase/migrations/04_exclusao_conta.sql."
          : `Não foi possível excluir a conta: ${rpcError.message}`,
      },
      { status: 500 },
    );
  }

  // 3) Logout. Se o GoTrue reclamar (sessão já órfã), o middleware trata o
  // cookie inválido no próximo request — o usuário cai em /login de qualquer forma.
  try {
    await supabase.auth.signOut();
  } catch {
    // silencioso de propósito
  }

  revalidatePublicPages(perfil?.username ?? null);

  return NextResponse.json({ ok: true, redirect: "/?conta=excluida" });
}
