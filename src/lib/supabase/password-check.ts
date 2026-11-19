import { createClient } from "@supabase/supabase-js";

/**
 * Confere a senha atual do usuário antes de uma ação destrutiva (issue #29).
 *
 * Usa um cliente avulso, sem cookies e sem persistência: `signInWithPassword`
 * aqui serve só como verificação de credencial, não abre sessão para a request
 * (a sessão que vale continua sendo a do cookie). Isso mantém a rota
 * funcionando com a anon key — nenhuma service role key no servidor.
 *
 * O GoTrue aplica rate limit próprio em `/token?grant_type=password`, o que
 * cobre a tentativa de força bruta neste endpoint.
 */
export async function senhaConfere(email: string, senha: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  return !error;
}
