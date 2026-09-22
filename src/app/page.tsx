import Link from "next/link";

const highlights = ["Portfólio em minutos", "Links e agenda em um só lugar", "Sua identidade em destaque"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            press<span className="text-fuchsia-400">link</span>
          </Link>
          <Link
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium transition hover:border-white/50"
            href="/login"
          >
            Entrar
          </Link>
        </header>

        <section className="relative flex flex-1 items-center py-20 lg:py-28">
          <div className="pointer-events-none absolute -right-48 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
              Seu som merece ser descoberto
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
              A pista é sua.<br />
              <span className="text-fuchsia-400">O palco também.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/65 sm:text-xl">
              Crie um portfólio digital que traduz a sua identidade, conecta seu público e abre portas para o próximo show.
            </p>
            <div className="mt-10 flex flex-wrap gap-4" id="comece">
              <Link
                className="rounded-full bg-fuchsia-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400"
                href="/login"
              >
                Criar meu PressLink
              </Link>
              <a
                className="rounded-full border border-white/20 px-7 py-3.5 font-semibold transition hover:border-white/50"
                href="#saiba-mais"
              >
                Saiba mais
              </a>
            </div>
            <ul className="mt-16 flex flex-col gap-4 text-sm text-white/55 sm:flex-row sm:gap-8">
              {highlights.map((highlight) => (
                <li key={highlight}>✦ {highlight}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
