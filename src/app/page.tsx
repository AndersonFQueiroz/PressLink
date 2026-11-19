import Link from "next/link";
import { PressLinkLogo } from "@/components/brand/PressLinkLogo";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
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
      <ScrollProgress className="bg-signal" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="PressLink — início"
            className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
          >
            <PressLinkLogo size={22} />
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="pl-press rounded-md px-3 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="pl-sheen inline-flex h-9 items-center rounded-md bg-signal px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              Criar página
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <Suspense fallback={null}>
          <ContaExcluidaAviso />
        </Suspense>

        <main>
          {/* Hero: manchete de cartaz + o próprio cartaz */}
          <section className="grid gap-14 border-b border-white/10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
            <div>
              <SplitText
                as="h1"
                lines={["Sua carreira", "em cartaz"]}
                className="font-poster font-extrabold text-[clamp(3rem,7.2vw,5.5rem)] uppercase leading-[0.86] tracking-[-0.03em]"
                delay={80}
                stagger={90}
              />
              <Reveal variant="fade" delay={260}>
                <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/55">
                  Perfil, fotos, sets e agenda num link só. É o material que o
                  contratante abre quando pergunta pelo seu portfólio.
                </p>
              </Reveal>

              <Reveal variant="up" delay={340} className="mt-8 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/cadastro"
                  className="pl-sheen group inline-flex h-10 items-center gap-1.5 rounded-md bg-signal px-4 text-[13px] font-semibold text-ink transition-[background-color,transform] duration-200 hover:-translate-y-[1px] hover:bg-signal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                >
                  Criar minha página
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <a
                  href="#saiba-mais"
                  className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-[13px] font-medium text-white/70 transition-[border-color,color,transform] duration-200 hover:-translate-y-[1px] hover:border-white/30 hover:text-white"
                >
                  Ver por dentro
                </a>
              </Reveal>

              <Reveal as="ul" variant="fade" delay={430} className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-white/40">
                {["Pronto em minutos", "Um link para tudo", "Feito para celular"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="h-1 w-1 bg-signal-soft" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </Reveal>
            </div>

            {/* O cartaz: prévia da página pública */}
            <Reveal
              variant="blur"
              delay={200}
              className="w-full max-w-[360px] justify-self-start lg:justify-self-end"
            >
              <Parallax speed={5} className="w-full">
                <div className="rounded-sm border border-white/12 bg-[#0f0b1b]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
                    Press kit / 2026
                  </span>
                  <span className="border border-stage/60 px-1.5 py-0.5 font-poster font-bold text-[11px] uppercase leading-none text-stage">
                    EPK
                  </span>
                </div>

                <div className="px-4 pb-4 pt-5">
                  <p className="font-poster font-bold text-[38px] uppercase leading-[0.9] tracking-tight">
                    Seu nome
                    <br />
                    artístico
                  </p>
                  <p className="mt-2 text-[11px] text-white/40">
                    House / Techno / São Paulo
                  </p>

                  <div className="relative mt-4 h-24 overflow-hidden border border-white/10 bg-[#1b1230]">
                    <span className="absolute inset-0 flex items-center justify-center font-poster font-bold text-[64px] uppercase leading-none text-white/[0.06]">
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
                          <span className="font-poster font-bold text-[11px] text-white/30">
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
              </Parallax>
              <p className="mt-2 text-[11px] text-white/30">
                Exemplo de página pública. A sua usa seus dados e o visual que você escolher.
              </p>
            </Reveal>
          </section>

          {/* O que tem dentro — papel lilás, leitura editorial */}
          <section id="saiba-mais" className="scroll-mt-6 border-b border-white/10 py-16 lg:py-20">
            <div className="-mx-6 bg-lilac px-6 py-14 text-graphite sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 lg:py-16">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <Reveal variant="up">
                  <h2 className="font-poster font-extrabold text-[clamp(2.1rem,4.2vw,3rem)] uppercase leading-[0.92] tracking-[-0.03em]">
                    O que o contratante vê
                  </h2>
                  <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-graphite/70">
                    Quatro informações decidem se ele chama você ou o próximo da
                    lista. Todas ficam na mesma página, na ordem em que ele procura.
                  </p>
                </Reveal>

                <ul className="border-t border-graphite/20">
                  {secoes.map((secao, i) => (
                    <Reveal
                      as="li"
                      key={secao.titulo}
                      variant="fade"
                      delay={i * 70}
                      className="grid gap-1.5 border-b border-graphite/20 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6"
                    >
                      <h3 className="text-[15px] font-semibold text-graphite">
                        {secao.titulo}
                      </h3>
                      <p className="max-w-lg text-[13px] leading-relaxed text-graphite/70">
                        {secao.texto}
                      </p>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Como funciona — sequência real, por isso numerada */}
          <section className="border-b border-white/10 py-16 lg:py-20">
            <Reveal variant="up" className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="max-w-2xl font-poster font-bold text-[clamp(2.4rem,5vw,3.6rem)] uppercase leading-[0.9] tracking-[-0.02em]">
                Do zero ao link
                <br />
                em uma tarde
              </h2>
              <p className="max-w-xs text-[13px] leading-relaxed text-white/45">
                Sem editor de bloco, sem tema quebrado no celular. Você preenche,
                escolhe o visual e publica.
              </p>
            </Reveal>

            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
              {passos.map((passo, i) => (
                <Reveal
                  as="li"
                  key={passo.numero}
                  variant="up"
                  delay={i * 90}
                  className="group border-t border-white/15 pt-4 transition-colors duration-200 hover:border-signal/50"
                >
                  <span className="inline-block font-poster font-bold text-[46px] leading-none text-signal-soft transition-transform duration-300 group-hover:-translate-y-1">
                    {passo.numero}
                  </span>
                  <h3 className="mt-4 text-[14px] font-medium text-white/90">
                    {passo.titulo}
                  </h3>
                  <p className="mt-1.5 max-w-[26ch] text-[13px] leading-relaxed text-white/45">
                    {passo.texto}
                  </p>
                </Reveal>
              ))}
            </ol>
          </section>

          {/* CTA em forma de ingresso */}
          <section className="py-16 lg:py-20">
            <Reveal variant="up">
            <div className="relative bg-signal px-7 py-9 text-ink sm:px-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="max-w-xl font-poster font-bold text-[clamp(2rem,4vw,2.9rem)] uppercase leading-[0.92]">
                    Pronto antes do
                    <br />
                    próximo convite
                  </h2>
                  <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink/90">
                    Crie a conta, monte a página e publique o link. O próximo
                    contratante já está procurando.
                  </p>
                </div>
                <Link
                  href="/cadastro"
                  className="inline-flex h-11 shrink-0 items-center rounded-md bg-ink px-5 text-[13px] font-semibold text-panel-text transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/70 focus-visible:ring-offset-2 focus-visible:ring-offset-signal"
                >
                  Criar minha página
                </Link>
              </div>

              <div className="relative mt-8 border-t border-dashed border-ink/25">
                {/* Picote de ingresso: meia-lua na borda do cartão, sem estourar a página */}
                <span
                  className="absolute -left-7 -top-3 h-6 w-6 -translate-x-1/2 rounded-full bg-ink sm:-left-10"
                  aria-hidden="true"
                />
                <span
                  className="absolute -right-7 -top-3 h-6 w-6 translate-x-1/2 rounded-full bg-ink sm:-right-10"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-[11px] text-ink/60">
                  <span>Admissão imediata</span>
                  <span>presslink.app/seu-nome</span>
                </div>
              </div>
            </div>
            </Reveal>
          </section>
        </main>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-8 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              aria-label="PressLink — início"
              className="transition-opacity hover:opacity-85"
            >
              <PressLinkLogo size={15} />
            </Link>
            <span aria-hidden="true" className="h-3 w-px bg-white/15" />
            <p>Press kit digital para DJs.</p>
          </div>
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
