import { revalidatePath } from "next/cache";

/**
 * Invalidação do cache das páginas públicas (issue #22 — RNF-16).
 *
 * A página `/[username]` é estática com `revalidate = 300`. As rotas do painel
 * chamam esta função depois de gravar para a alteração aparecer na hora, sem
 * esperar a janela de 5 minutos (mesmo espírito do `revalidatePath` do UC01 em
 * `specs.md`).
 *
 * O padrão de rota `/[username]` derruba todas as páginas de perfil já
 * geradas; quando o username é conhecido, o caminho concreto também é
 * invalidado (importante em troca de username, que precisa limpar a URL antiga).
 */
export function revalidatePublicPages(username?: string | null): void {
  revalidatePath("/[username]", "page");

  const limpo = username?.trim();
  if (limpo) {
    revalidatePath(`/${encodeURIComponent(limpo)}`);
  }
}
