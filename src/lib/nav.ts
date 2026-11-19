/**
 * Regra única de item ativo do menu.
 *
 * O bug relatado ("dois itens acesos") vinha de comparar prefixo em todos os
 * itens: `/painel` casava com qualquer rota filha. `exact` existe para o item
 * raiz; as demais seções casam com prefixo de segmento (`/painel/perfil/editar`
 * continua em Perfil), nunca com um pedaço de palavra.
 */
export function isNavActive(pathname: string, href: string, exact = false): boolean {
  const limpar = (valor: string) => valor.replace(/\/+$/, "") || "/";
  const atual = limpar(pathname);
  const alvo = limpar(href);

  if (atual === alvo) return true;
  if (exact) return false;
  return atual.startsWith(`${alvo}/`);
}
