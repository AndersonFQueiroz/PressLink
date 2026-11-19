import Link from "next/link";
import { Suspense } from "react";
import { ContaExcluidaAviso } from "@/components/features/landing/ContaExcluidaAviso";

/**
 * Landing do PressLink.
 *
 * Conceito: o EPK como cartaz de festa. Tipografia de flyer (Anton), papel
 * lilás no meio da página e um bloco de ingresso no CTA — vocabulário do mundo
 * do DJ, não o kit "SaaS dark" (cards iguais, eyebrow em caixa alta, glow).
 */

const secoes = [
  {
    titulo: "Quem você é",
    texto:
      "Nome artístico, bio em português e inglês, cidade e foto de destaque. O contratante entende seu som antes de dar play.",
  },
  {
    titulo: "Como você soa",
    texto:
      "Fotos de festa, sets e vídeos no mesmo lugar. Sem link na bio quebrado, sem pasta no Drive.",
  },
  {
    titulo: "Onde você toca",
    texto:
      "As próximas datas aparecem na página e mostram que você está em atividade agora, não no ano passado.",
  },
  {
    titulo: "Como fechar a data",
    texto:
      "WhatsApp, e-mail de booking e formulário direto. Do primeiro clique ao cachê combinado.",
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Crie sua conta",
    texto: "E-mail e senha. Sem cartão e sem instalação.",
  },
  {
    numero: "02",
    titulo: "Monte a página",
    texto: "Perfil, fotos, links e agenda. O visual você escolhe no fim.",
  },
  {
    numero: "03",
    titulo: "Publique o link",
    texto: "Um endereço curto para a bio, o story e a proposta de cachê.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <header className="flex h-20 items-center justify-between border-b border-white/10">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            press<span className="text-brand-soft">link</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex h-9 items-center rounded-md bg-brand px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              Criar página
            </Link>
          </nav>
        </header>

        <Suspense fallback={null}>
          <ContaExcluidaAviso />
        </Suspense>

        <main>
          {/* Hero: manchete de cartaz + o próprio cartaz */}
          <section className="grid gap-14 border-b border-white/10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
            <div>
              <h1 className="font-poster text-[clamp(3.2rem,9vw,7rem)] uppercase leading-[0.84] tracking-[-0.01em]">
                Sua carreira
                <br />
                em cartaz
              </h1>
              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/55">
                Perfil, fotos, sets e agenda num link só. É o material que o
                contratante abre quando pergunta pelo seu portfólio.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/cadastro"
                  className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                >
                  Criar minha página
                </Link>
                <a
                  href="#saiba-mais"
                  className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-[13px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  Ver por dentro
                </a>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-white/40">
                {["Pronto em minutos", "Um link para tudo", "Feito para celular"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="h-1 w-1 bg-brand-soft" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* O cartaz: prévia da página pública */}
            <div className="w-full max-w-[360px] justify-self-start lg:justify-self-end">
              <div className="rounded-sm border border-white/12 bg-[#0f0b1b]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
                    Press kit / 2026
                  </span>
                  <span className="border border-stage/60 px-1.5 py-0.5 font-poster text-[11px] uppercase leading-none text-stage">
                    EPK
                  </span>
                </div>

                <div className="px-4 pb-4 pt-5">
                  <p className="font-poster text-[38px] uppercase leading-[0.9] tracking-tight">
                    Seu nome
                    <br />
                    artístico
                  </p>
                  <p className="mt-2 text-[11px] text-white/40">
                    House / Techno / São Paulo
                  </p>

                  <div className="relative mt-4 h-24 overflow-hidden border border-white/10 bg-[#1b1230]">
                    <span className="absolute inset-0 flex items-center justify-center font-poster text-[64px] uppercase leading-none text-white/[0.06]">
                      DJ
                    </span>
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">
                      <span className="h-1.5 w-1.5 bg-stage" aria-hidden="true" />
                      Ao vivo
                    </span>
                  </div>

                  <ul className="mt-4 border-t border-white/10">
                    {[
                      ["Perfil", "quem você é"],
                      ["Galeria", "como você soa"],
                      ["Agenda", "onde você toca"],
                      ["Booking", "como fechar"],
                    ].map(([nome, resumo], i) => (
                      <li
                        key={nome}
                        className="flex items-baseline justify-between border-b border-white/[0.07] py-2 text-[12px]"
                      >
                        <span className="flex items-baseline gap-2">
                          <span className="font-poster text-[11px] text-white/30">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-white/80">{nome}</span>
                        </span>
                        <span className="text-[11px] text-white/30">{resumo}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-white/20 pt-3">
                    <span className="text-[10px] text-white/35">presslink.app/seu-nome</span>
                    <span className="flex h-5 items-end gap-[2px]" aria-hidden="true">
                      {[3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1].map((w, i) => (
                        <span
                          key={i}
                          className="h-full bg-white/30"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/30">
                Exemplo de página pública. A sua usa seus dados e o visual que você escolher.
              </p>
            </div>
          </section>

          {/* O que tem dentro — papel lilás, leitura editorial */}
          <section id="saiba-mais" className="scroll-mt-6 border-b border-white/10 py-16 lg:py-20">
            <div className="-mx-6 bg-lilac px-6 py-14 text-graphite sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div>
                  <h2 className="font-poster text-[clamp(2.4rem,5vw,3.6rem)] uppercase leading-[0.9]">
                    O que o contratante vê
                  </h2>
                  <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-graphite/70">
                    Quatro informações decidem se ele chama você ou o próximo da
                    lista. Todas ficam na mesma página, na ordem em que ele procura.
                  </p>
                </div>

                <ul className="border-t border-graphite/20">
                  {secoes.map((secao) => (
                    <li
                      key={secao.titulo}
                      className="grid gap-1.5 border-b border-graphite/20 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
                    >
                      <h3 className="text-[15px] font-semibold text-graphite">
                        {secao.titulo}
                      </h3>
                      <p className="max-w-lg text-[13px] leading-relaxed text-graphite/70">
                        {secao.texto}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Como funciona — sequência real, por isso numerada */}
          <section className="border-b border-white/10 py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="max-w-2xl font-poster text-[clamp(2.4rem,5vw,3.6rem)] uppercase leading-[0.9]">
                Do zero ao link
                <br />
                em uma tarde
              </h2>
              <p className="max-w-xs text-[13px] leading-relaxed text-white/45">
                Sem editor de bloco, sem tema quebrado no celular. Você preenche,
                escolhe o visual e publica.
              </p>
            </div>

            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
              {passos.map((passo) => (
                <li key={passo.numero} className="border-t border-white/15 pt-4">
                  <span className="font-poster text-[46px] leading-none text-brand-soft">
                    {passo.numero}
                  </span>
                  <h3 className="mt-4 text-[14px] font-medium text-white/90">
                    {passo.titulo}
                  </h3>
                  <p className="mt-1.5 max-w-[26ch] text-[13px] leading-relaxed text-white/45">
                    {passo.texto}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA em forma de ingresso */}
          <section className="py-16 lg:py-20">
            <div className="relative bg-brand px-7 py-9 text-white sm:px-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="max-w-xl font-poster text-[clamp(2rem,4vw,2.9rem)] uppercase leading-[0.92]">
                    Pronto antes do
                    <br />
                    próximo convite
                  </h2>
                  <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75">
                    Crie a conta, monte a página e publique o link. O próximo
                    contratante já está procurando.
                  </p>
                </div>
                <Link
                  href="/cadastro"
                  className="inline-flex h-11 shrink-0 items-center rounded-md bg-white px-5 text-[13px] font-semibold text-[#4c1d95] transition-colors hover:bg-[#f4ecff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
                >
                  Criar minha página
                </Link>
              </div>

              <div className="relative mt-8 border-t border-dashed border-white/30">
                {/* Picote de ingresso: meia-lua na borda do cartão, sem estourar a página */}
                <span
                  className="absolute -left-7 -top-3 h-6 w-6 -translate-x-1/2 rounded-full bg-ink sm:-left-10"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-7 -top-3 h-6 w-6 translate-x-1/2 rounded-full bg-ink sm:-right-10"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-white/60">
                  <span>Admissão imediata</span>
                  <span>presslink.app/seu-nome</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-8 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            press<span className="text-brand-soft">link</span>. Press kit digital para DJs.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition-colors hover:text-white/70">
              Entrar
            </Link>
            <Link href="/cadastro" className="transition-colors hover:text-white/70">
              Criar conta
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
