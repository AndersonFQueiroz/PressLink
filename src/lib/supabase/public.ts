import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase servidor SEM cookies (issue #22).
 *
 * A página pública precisa ser estática com ISR (RNF-16). O cliente de
 * `@/lib/supabase/server` lê `cookies()` e isso marca a rota como dinâmica —
 * nenhum cache, nenhuma revalidação, uma consulta ao banco por visita.
 *
 * Aqui usamos `@supabase/supabase-js` puro com a chave anon (que é pública):
 * sem sessão, sem cookie, sem refresh. A RLS continua valendo e expõe apenas
 * perfis com `publicado = true`.
 *
 * Sem as variáveis de ambiente (build de CI, por exemplo) devolvemos `null` em
 * vez de estourar — assim `generateStaticParams` consegue rodar e retorna `[]`.
 */
let cliente: SupabaseClient | null | undefined;

export function getPublicClient(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    cliente = null;
    return cliente;
  }

  cliente = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "X-Client-Info": "presslink-public-page" } },
  });

  return cliente;
}
