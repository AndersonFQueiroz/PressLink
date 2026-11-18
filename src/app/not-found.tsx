import Link from "next/link";

/**
 * 404 personalizada do PressLink (issue #22).
 *
 * Cobre o perfil inexistente/despublicado (`notFound()` em `/[username]`) e
 * qualquer URL desconhecida. Mantém a identidade escura do produto e dá saída
 * clara: voltar para a landing ou entrar no painel.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] px-6 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.16),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.14),transparent_55%)]"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <span className="rounded-full border border-white/15 px-4 py-1 text-xs font-medium uppercase tracking-[0.32em] text-zinc-400">
          PressLink
        </span>

        <p className="mt-10 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-7xl font-semibold tracking-tight text-transparent sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-balance text-2xl font-semibold sm:text-3xl">
          Esse palco está vazio
        </h1>
        <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
          A página que você tentou abrir não existe ou o DJ ainda não publicou o EPK dele.
          Confira o link ou volte para o início.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Voltar para o início
          </Link>
          <Link
            href="/painel"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-zinc-100 transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Acessar meu painel
          </Link>
        </div>
      </div>
    </main>
  );
}
