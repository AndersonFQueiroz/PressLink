/**
 * URL pública canônica do site (issue #22).
 *
 * Usada por `metadataBase` (Open Graph/Twitter exigem URL absoluta) e pelo link
 * de compartilhamento do EPK. Ordem de preferência:
 *
 * 1. `NEXT_PUBLIC_APP_URL` — domínio de produção/preview configurado à mão;
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — domínio estável do projeto na Vercel;
 * 3. `VERCEL_URL` — URL do deploy atual (preview);
 * 4. `http://localhost:3000` — desenvolvimento.
 *
 * O retorno nunca termina com `/` e sempre tem protocolo, para poder ser
 * concatenado com `/{username}` sem barra dupla.
 */
const FALLBACK = "http://localhost:3000";

function comProtocolo(host: string): string {
  return /^https?:\/\//i.test(host) ? host : `https://${host}`;
}

export function siteUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configurada) return comProtocolo(configurada).replace(/\/+$/, "");

  const vercelProducao = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProducao) return comProtocolo(vercelProducao).replace(/\/+$/, "");

  const vercelAtual = process.env.VERCEL_URL?.trim();
  if (vercelAtual) return comProtocolo(vercelAtual).replace(/\/+$/, "");

  return FALLBACK;
}

/**
 * Host para exibir em texto (sem protocolo): `localhost:3000` em dev,
 * `presslink.vercel.app` (ou o domínio configurado) em produção.
 */
export function siteHost(): string {
  return siteUrl().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

/** Caminho absoluto de um perfil: `https://.../dj-presslink`. */
export function publicProfileUrl(username: string): string {
  return `${siteUrl()}/${encodeURIComponent(username)}`;
}
