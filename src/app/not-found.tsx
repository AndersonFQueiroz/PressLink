import Link from "next/link";

/**
 * 404 personalizada do PressLink (issue #22).
 *
 * Cobre o perfil inexistente/despublicado (`notFound()` em `/[username]`) e
 * qualquer URL desconhecida. Segue a linguagem da landing: cartaz em Anton,
 * fundo `ink` e um único acento roxo — sem glow.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            press<span className="text-brand-soft">link</span>
          </Link>
          <Link
            className="inline-flex h-9 items-center rounded-md border border-white/15 px-4 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            href="/login"
          >
            Entrar
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center py-16 lg:py-24">
          <p
            aria-hidden="true"
            className="font-poster text-[clamp(6rem,24vw,13rem)] uppercase leading-[0.78] tracking-[-0.01em] text-white"
          >
            4<span className="text-brand-soft">0</span>4
          </p>

          <h1 className="mt-8 font-poster text-[clamp(1.7rem,3.4vw,2.6rem)] uppercase leading-[0.95] text-white">
            Esse palco está vazio
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/45">
            A página que você tentou abrir não existe ou o DJ ainda não publicou o
            EPK dele. Confira o link ou volte para o início.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              href="/"
            >
              Voltar para o início
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              href="/painel"
            >
              Acessar meu painel
            </Link>
          </div>

          <p className="mt-14 text-[13px] text-white/40">
            É DJ e ainda não tem seu PressLink?{" "}
            <Link
              href="/cadastro"
              className="text-white underline underline-offset-4 transition-colors hover:text-brand-soft"
            >
              Crie o seu
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
