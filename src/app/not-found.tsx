import Link from "next/link";
import { PressLinkLogo } from "@/components/brand/PressLinkLogo";

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
            aria-label="PressLink — início"
            className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
          >
            <PressLinkLogo size={22} />
          </Link>
          <Link
            className="inline-flex h-9 items-center rounded-md border border-panel-line px-4 text-[13px] font-medium text-panel-text transition-colors hover:bg-white/[0.05] hover:text-panel-text"
            href="/login"
          >
            Entrar
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center py-16 lg:py-24">
          <p
            aria-hidden="true"
            className="font-poster font-bold text-[clamp(6rem,24vw,13rem)] uppercase leading-[0.78] tracking-[-0.01em] text-panel-text"
          >
            4<span className="text-signal-soft">0</span>4
          </p>

          <h1 className="mt-8 font-poster font-bold text-[clamp(1.7rem,3.4vw,2.6rem)] uppercase leading-[0.95] text-panel-text">
            Esse palco está vazio
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-panel-muted">
            A página que você tentou abrir não existe ou o DJ ainda não publicou o
            EPK dele. Confira o link ou volte para o início.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg bg-signal px-6 text-sm font-semibold text-ink transition-colors hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              href="/"
            >
              Voltar para o início
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-panel-line px-6 text-sm font-medium text-panel-text transition-colors hover:bg-white/[0.05] hover:text-panel-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
              href="/painel"
            >
              Acessar meu painel
            </Link>
          </div>

          <p className="mt-14 text-[13px] text-panel-muted">
            É DJ e ainda não tem seu PressLink?{" "}
            <Link
              href="/cadastro"
              className="text-panel-text underline underline-offset-4 transition-colors hover:text-signal-soft"
            >
              Crie o seu
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
