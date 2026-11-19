import type { Instrumentation } from "next";

/**
 * Observabilidade de produção.
 *
 * Erros não tratados de Server Component, Route Handler e Server Action caem
 * aqui e saem como **uma linha de JSON** no log da Vercel — filtrável por
 * `level:error` e sem precisar abrir o rastro de cada requisição.
 *
 * Nunca registramos `cookie`/`authorization`: só método, rota, tipo de
 * renderização, mensagem e o `digest` (o mesmo código mostrado ao usuário),
 * com o stack limitado às seis primeiras linhas. Para trocar por Sentry ou
 * outro coletor, basta enviar o mesmo objeto dentro desta função.
 */
export const onRequestError: Instrumentation.onRequestError = (erro, requisicao, contexto) => {
  const e = erro instanceof Error ? erro : new Error(String(erro));
  const digest = (e as Error & { digest?: string }).digest;

  console.error(
    JSON.stringify({
      level: "error",
      scope: "request",
      message: e.message,
      digest,
      stack: e.stack?.split("\n").slice(0, 6).join("\n"),
      path: requisicao.path,
      method: requisicao.method,
      routerKind: contexto.routerKind,
      routePath: contexto.routePath,
      routeType: contexto.routeType,
      renderSource: contexto.renderSource,
      timestamp: new Date().toISOString(),
    }),
  );
};
