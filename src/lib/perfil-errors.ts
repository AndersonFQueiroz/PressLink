/**
 * Tradução dos erros do `PUT /api/perfil` para texto de tela.
 *
 * Motivo (18/11/2026): sem a migration `03_perfil_template_slug.sql` aplicada
 * no Supabase, o Postgres responde `42703 Could not find the 'template_slug'
 * column of 'perfil' in the schema cache` e esse texto cru aparecia no painel
 * do DJ — sem dizer o que fazer a respeito.
 */

/** Mensagem exibida quando o banco está atrás do código. */
export const MENSAGEM_MIGRATION_PENDENTE =
  "O banco ainda não tem a coluna do template. Rode supabase/migrations/03_perfil_template_slug.sql no SQL Editor do Supabase e tente de novo.";

export const MENSAGEM_SESSAO_EXPIRADA =
  "Sua sessão expirou. Entre novamente para salvar o template.";

/**
 * Converte (status HTTP + mensagem devolvida pela API) em texto para o DJ.
 * Função pura para poder ser testada sem servidor.
 */
export function explainPerfilSaveError(
  status: number,
  mensagem?: string | null,
): string {
  const texto = (mensagem ?? "").trim();

  // Código 42703 / "schema cache" = coluna (ou tabela) inexistente no banco.
  if (/template_slug/i.test(texto) && /(does not exist|schema cache|42703)/i.test(texto)) {
    return MENSAGEM_MIGRATION_PENDENTE;
  }

  if (status === 401) return MENSAGEM_SESSAO_EXPIRADA;

  if (status === 400 && !texto) {
    return "Dados inválidos. Revise as informações do perfil antes de trocar o template.";
  }

  return texto || `Falha ao salvar (HTTP ${status})`;
}
