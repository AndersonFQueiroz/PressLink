import Link from "next/link";

/**
 * 404 personalizada do PressLink (issue #22).
 *
 * Cobre o perfil inexistente/despublicado (`notFound()` em `/[username]`) e
 * qualquer URL desconhecida. Usa a mesma linguagem visual da landing — fundo
 * `ink`, logo `presslink`, glow fúcsia e tipografia display — para o visitante
 * não sentir que saiu do produto. Saída clara: landing, login e cadastro.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
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

        <section className="relative flex flex-1 flex-col items-center justify-center py-16 text-center lg:py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-300">
              Erro 404
            </p>

            <p className="font-display text-[7rem] font-bold leading-[0.85] tracking-tight sm:text-[10rem] lg:text-[12rem]">
              4<span className="text-fuchsia-400">0</span>4
            </p>

            <h1 className="mt-8 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Esse palco está vazio.
            </h1>
            <p className="mt-4 max-w-md text-pretty text-base leading-7 text-white/65 sm:text-lg">
              A página que você tentou abrir não existe ou o DJ ainda não publicou o EPK dele.
              Confira o link ou volte para o início.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                className="rounded-full bg-fuchsia-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:bg-fuchsia-400"
                href="/"
              >
                Voltar para o início
              </Link>
              <Link
                className="rounded-full border border-white/20 px-7 py-3.5 font-semibold transition hover:border-white/50"
                href="/painel"
              >
                Acessar meu painel
              </Link>
            </div>

            <p className="mt-14 text-sm text-white/45">
              É DJ e ainda não tem seu PressLink?{" "}
              <Link href="/cadastro" className="text-fuchsia-300 underline-offset-4 transition hover:text-fuchsia-200 hover:underline">
                Crie o seu
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
