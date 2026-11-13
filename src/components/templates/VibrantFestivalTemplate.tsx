"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Calendar,
  Disc3,
  Mail,
  MapPin,
  Menu,
  Play,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import type { TemplateComponentProps } from "@/types/template";
import { MediaEmbed } from "@/components/features/painel/MediaEmbed";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Parallax } from "@/components/motion/Parallax";
import { Marquee } from "@/components/motion/Marquee";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { ScrollCue } from "@/components/motion/ScrollCue";
import { Countdown } from "@/components/motion/Countdown";
import { PhotoLightbox } from "@/components/templates/PhotoLightbox";
import { useTemplateTheme } from "@/components/templates/useTemplateTheme";
import { SocialIcon } from "@/components/templates/SocialIcon";
import {
  bioFor,
  buildWhatsAppUrl,
  displayName,
  formatShowDate,
  getSocialLinks,
  hasBothLanguages,
  nextShow,
  providerLabel,
  sortShows,
  splitParagraphs,
  trackNumber,
  type TemplateLang,
} from "@/lib/template-utils";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "bio", label: "Bio" },
  { id: "musica", label: "Tracks" },
  { id: "galeria", label: "Gallery" },
  { id: "agenda", label: "Dates" },
  { id: "booking", label: "Booking" },
];

const CARD_GRADIENTS = [
  "from-[#ff3d8b] via-[#ff6b4a] to-[#d8ff4a]",
  "from-[#6c4cff] via-[#a855f7] to-[#ff3d8b]",
  "from-[#00d4ff] via-[#6c4cff] to-[#ff3d8b]",
  "from-[#d8ff4a] via-[#ffb800] to-[#ff3d8b]",
];

export function VibrantFestivalTemplate({ data }: TemplateComponentProps) {
  const { perfil, fotos, midias, shows } = data;
  const [lang, setLang] = useState<TemplateLang>(perfil.biografia_pt ? "pt" : "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openMedia, setOpenMedia] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "spotify" | "soundcloud" | "youtube">("all");

  const bio = bioFor(perfil, lang);
  const paragraphs = splitParagraphs(bio);
  const bothLanguages = hasBothLanguages(perfil);
  const socials = getSocialLinks(perfil);
  const waUrl = buildWhatsAppUrl(perfil, lang);
  const sortedPhotos = [...fotos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const sortedShows = sortShows(shows);
  const next = nextShow(shows);
  const filteredMedia = midias
    .filter((media) => (filter === "all" ? true : media.tipo === filter))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const artistName = displayName(perfil.nome_artistico);
  const words = artistName.trim().split(/\s+/);
  const nameLines =
    words.length > 2
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(" "),
          words.slice(Math.ceil(words.length / 2)).join(" "),
        ]
      : [artistName];

  useTemplateTheme("#0b0614", "#fff6e9", "dark");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0b0614] text-[#fff6e9] [color-scheme:dark]">
      <ScrollProgress className="bg-[#ff3d8b]" />
      <ScrollCue href="#bio" label={lang === "pt" ? "Role para ver mais" : "Scroll for more"} tone="festival" />

      {/* HEADER */}
      <header className="absolute inset-x-0 top-0 z-[70] px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="#top" className="group flex items-center gap-2 rounded-full border-2 border-[#fff6e9] bg-[#0b0614] px-4 py-2">
            <Asterisk className="h-4 w-4 text-[#d8ff4a] transition group-hover:rotate-90" />
            <span className="font-poster text-sm uppercase tracking-[0.08em]">
              {artistName}
            </span>
          </Link>

          <nav aria-label="Seções" className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur-md md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#booking"
              className="hidden rounded-full bg-[#ff3d8b] px-5 py-2.5 font-poster text-xs uppercase tracking-[0.08em] text-[#0b0614] transition hover:-rotate-2 hover:bg-[#d8ff4a] sm:inline-flex"
            >
              Book now
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/25 bg-[#0b0614]/70 text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-[#ff3d8b] px-5 py-5 text-[#0b0614]">
          <div className="flex items-center justify-between">
            <span className="font-poster text-sm uppercase tracking-[0.1em]">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0b0614]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="border-b-2 border-[#0b0614]/25 py-3 font-poster text-5xl uppercase leading-none tracking-[-0.02em] transition hover:pl-3"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t-2 border-[#0b0614]/25 pt-4">
            <div className="flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0b0614]"
                >
                  <SocialIcon name={social.key} className="h-4 w-4" />
                </a>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">EPK / 2026</span>
          </div>
        </div>
      )}

      <main id="top">
        {/* HERO */}
        <section className="relative min-h-[100svh] overflow-hidden px-4 pb-0 pt-24 sm:px-8 sm:pt-28">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 top-10 h-[34rem] w-[34rem] rounded-full bg-[#6c4cff]/35 blur-[120px]" />
            <div className="absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[#ff3d8b]/30 blur-[120px]" />
            <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-[#d8ff4a]/15 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff6e9 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[1500px] items-end gap-6 lg:grid-cols-12 lg:gap-0">
            <div className="relative z-20 lg:col-span-8 lg:pb-12">
              <Reveal variant="fade" delay={100} className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#d8ff4a] px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b0614]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {lang === "pt" ? "Disponível para booking" : "Available for booking"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
                  <MapPin className="h-3.5 w-3.5 text-[#ff3d8b]" />
                  {lang === "pt" ? "Datas em 2026" : "2026 dates"}
                </span>
              </Reveal>

              <SplitText
                lines={nameLines.map((line) => line.toUpperCase())}
                className="font-poster uppercase leading-[0.82] tracking-[-0.02em] text-[clamp(4rem,15vw,13rem)]"
                delay={180}
                stagger={80}
              />

              <Reveal variant="up" delay={700} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-2 border-white/15 pt-5">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
                  <Disc3 className="h-4 w-4 text-[#ff3d8b]" />
                  DJ Set / Live
                </span>
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
                  <Ticket className="h-4 w-4 text-[#d8ff4a]" />
                  {next
                    ? `${lang === "pt" ? "Próximo show" : "Next show"} — ${formatShowDate(next.data, lang).day} ${formatShowDate(next.data, lang).monthShort}`
                    : lang === "pt"
                      ? "Turnê em breve"
                      : "Tour soon"}
                </span>
                <a
                  href="#bio"
                  className="group ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-[#d8ff4a]"
                >
                  Scroll
                  <ArrowDown className="h-4 w-4 transition group-hover:translate-y-1" />
                </a>
              </Reveal>
            </div>

            <div className="relative lg:col-span-4">
              <Reveal variant="scale" delay={350} className="relative mx-auto w-[82%] max-w-sm lg:w-full lg:max-w-none">
                <div className="absolute -inset-2 rotate-3 rounded-[2.5rem] bg-[#ff3d8b]" />
                <div className="absolute -inset-2 -rotate-3 rounded-[2.5rem] bg-[#d8ff4a]" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] border-4 border-[#0b0614] bg-[#1a0f2e]">
                  {perfil.foto_url ? (
                    <Parallax className="absolute inset-0" speed={7} scale={1.2}>
                      <Image
                        src={perfil.foto_url}
                        alt={artistName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 82vw, 32vw"
                        className="object-cover"
                      />
                    </Parallax>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#6c4cff_0%,#0b0614_70%)]">
                      <Disc3 className="h-24 w-24 animate-spin-slow text-[#ff3d8b]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0614]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.18em] text-white/80">
                      {lang === "pt" ? "Press photo" : "Press photo"}
                      <br />
                      {perfil.username}
                    </span>
                    <Asterisk className="h-8 w-8 animate-spin-slow text-[#d8ff4a]" />
                  </div>
                </div>
              </Reveal>

              <Reveal
                variant="scale"
                delay={700}
                className="absolute -left-6 top-8 hidden rotate-[-10deg] rounded-2xl bg-[#d8ff4a] px-4 py-2 font-poster text-sm uppercase leading-none text-[#0b0614] shadow-[6px_6px_0_#0b0614] motion-safe:animate-float sm:block"
              >
                {lang === "pt" ? "Ao vivo" : "Live"}
              </Reveal>
              <Reveal
                variant="scale"
                delay={850}
                className="absolute -right-3 bottom-16 hidden rotate-[8deg] rounded-full border-2 border-[#0b0614] bg-[#fff6e9] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0b0614] shadow-[5px_5px_0_#ff3d8b] md:block"
              >
                {lang === "pt" ? "Som pesado" : "Loud & proud"}
              </Reveal>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-y-4 border-[#0b0614] bg-[#ff3d8b] py-3 text-[#0b0614] sm:mt-14">
            <Marquee speed={26}>
              {[
                lang === "pt" ? "Booking aberto" : "Booking open",
                artistName,
                "Main stage",
                lang === "pt" ? "Não perca" : "Don't miss it",
              ].map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-6 sm:gap-10">
                  <span className="font-poster text-xl uppercase tracking-[0.04em] sm:text-3xl">{item}</span>
                  <Asterisk className="h-5 w-5 sm:h-7 sm:w-7" />
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* BIO */}
        <section id="bio" aria-labelledby="bio-title" className="relative overflow-hidden bg-[#6c4cff] px-4 py-20 text-[#fff6e9] sm:px-8 sm:py-28">
          <div className="pointer-events-none absolute -right-10 top-0 select-none font-poster text-[26vw] uppercase leading-none text-white/[0.06]">
            Bio
          </div>
          <div className="relative mx-auto max-w-[1500px]">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <Reveal variant="up">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d8ff4a]">
                    01 / {lang === "pt" ? "Sobre" : "About"}
                  </p>
                  <h2
                    id="bio-title"
                    className="mt-3 font-poster text-5xl uppercase leading-[0.85] tracking-[-0.01em] sm:text-7xl"
                  >
                    {lang === "pt" ? "Quem faz a festa" : "The one behind the decks"}
                  </h2>
                </Reveal>

                {bothLanguages && (
                  <Reveal variant="fade" delay={120} className="mt-7 inline-flex rounded-full border-2 border-[#fff6e9] p-1">
                    {(["pt", "en"] as const).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLang(code)}
                        aria-pressed={lang === code}
                        className={cn(
                          "rounded-full px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition",
                          lang === code ? "bg-[#d8ff4a] text-[#0b0614]" : "text-[#fff6e9]/60 hover:text-[#fff6e9]",
                        )}
                      >
                        {code}
                      </button>
                    ))}
                  </Reveal>
                )}

                <Reveal variant="up" delay={180} className="mt-8 flex flex-wrap gap-3">
                  {[
                    { value: String(sortedPhotos.length).padStart(2, "0"), label: lang === "pt" ? "fotos" : "photos" },
                    { value: String(midias.length).padStart(2, "0"), label: "tracks" },
                    { value: String(sortedShows.length).padStart(2, "0"), label: lang === "pt" ? "datas" : "dates" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border-2 border-[#0b0614] bg-[#fff6e9] px-4 py-3 text-[#0b0614] shadow-[4px_4px_0_#0b0614]"
                    >
                      <span className="block font-poster text-2xl leading-none">{stat.value}</span>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em]">{stat.label}</span>
                    </div>
                  ))}
                </Reveal>
              </div>

              <div className="lg:col-span-7 lg:col-start-6">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <Reveal key={paragraph.slice(0, 24)} variant="up" delay={index * 100}>
                      <p
                        className={cn(
                          "max-w-3xl leading-snug",
                          index === 0
                            ? "text-[clamp(1.5rem,3vw,2.6rem)] font-medium"
                            : "mt-6 text-base leading-relaxed text-white/70 sm:text-lg",
                        )}
                      >
                        {paragraph}
                      </p>
                    </Reveal>
                  ))
                ) : (
                  <p className="text-lg text-white/70">
                    {lang === "pt" ? "Biografia em breve." : "Biography coming soon."}
                  </p>
                )}

                {socials.length > 0 && (
                  <Reveal variant="up" delay={200} className="mt-10 flex flex-wrap gap-2">
                    {socials.map((social) => (
                      <a
                        key={social.key}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0b0614] bg-[#fff6e9] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0b0614] shadow-[3px_3px_0_#0b0614] transition hover:-translate-y-0.5 hover:bg-[#d8ff4a]"
                      >
                        <SocialIcon name={social.key} className="h-3.5 w-3.5" />
                        {social.label}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ))}
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MÚSICA */}
        <section id="musica" aria-labelledby="music-title" className="relative bg-[#fff6e9] px-4 py-20 text-[#0b0614] sm:px-8 sm:py-28">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff3d8b]">
                  02 / {lang === "pt" ? "Ouça" : "Listen"}
                </p>
                <h2 id="music-title" className="mt-3 font-poster text-5xl uppercase leading-[0.85] tracking-[-0.01em] sm:text-8xl">
                  {lang === "pt" ? "No repeat" : "On repeat"}
                </h2>
              </Reveal>

              <Reveal variant="fade" delay={100} className="flex flex-wrap gap-2">
                {(["all", "spotify", "soundcloud", "youtube"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={cn(
                      "rounded-full border-2 border-[#0b0614] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition",
                      filter === item
                        ? "bg-[#0b0614] text-[#fff6e9]"
                        : "bg-transparent text-[#0b0614]/55 hover:bg-[#0b0614]/[0.06]",
                    )}
                  >
                    {item === "all" ? (lang === "pt" ? "Tudo" : "All") : providerLabel(item)}
                  </button>
                ))}
              </Reveal>
            </div>

            {filteredMedia.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMedia.map((media, index) => {
                  const isOpen = openMedia === media.id;
                  return (
                    <Reveal
                      key={media.id}
                      variant="scale"
                      delay={index * 70}
                      className={cn("group", isOpen && "sm:col-span-2 lg:col-span-3")}
                    >
                      <div className="overflow-hidden rounded-3xl border-2 border-[#0b0614] bg-[#0b0614] shadow-[6px_6px_0_#0b0614]">
                        <button
                          type="button"
                          onClick={() => setOpenMedia(isOpen ? null : media.id)}
                          aria-expanded={isOpen}
                          className="block w-full text-left"
                        >
                          <div className={cn("relative overflow-hidden bg-gradient-to-br p-5 sm:p-6", CARD_GRADIENTS[index % CARD_GRADIENTS.length])}>
                            <span className="absolute -right-3 -top-6 select-none font-poster text-[7rem] leading-none text-[#0b0614]/15">
                              {trackNumber(index)}
                            </span>
                            <div className="relative flex items-start justify-between gap-4">
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0b0614]/30 bg-[#0b0614]/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#0b0614]">
                                  <SocialIcon name={media.tipo} className="h-3 w-3" />
                                  {providerLabel(media.tipo)}
                                </span>
                                <p className="mt-6 max-w-[16rem] font-poster text-2xl uppercase leading-[0.95] tracking-[-0.01em] text-[#0b0614] sm:text-3xl">
                                  {media.titulo || `${providerLabel(media.tipo)} — ${artistName}`}
                                </p>
                              </div>
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#0b0614] bg-[#fff6e9] text-[#0b0614] transition group-hover:rotate-12 group-hover:bg-[#d8ff4a]">
                                {isOpen ? <X className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                              </span>
                            </div>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t-2 border-[#0b0614] bg-[#0b0614] p-3">
                            <MediaEmbed tipo={media.tipo} url={media.url} titulo={media.titulo} />
                          </div>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border-2 border-dashed border-[#0b0614]/30 py-16 text-center">
                <Disc3 className="mx-auto h-9 w-9 text-[#0b0614]/30" />
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-[#0b0614]/50">
                  {lang === "pt" ? "Nenhuma faixa neste filtro" : "No tracks in this filter"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria" aria-labelledby="gallery-title" className="relative overflow-hidden bg-[#0b0614] px-4 py-20 sm:px-8 sm:py-28">
          <div className="pointer-events-none absolute -left-16 top-20 h-[22rem] w-[22rem] rounded-full bg-[#6c4cff]/25 blur-[110px]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#d8ff4a]">
                  03 / {lang === "pt" ? "Galeria" : "Gallery"}
                </p>
                <h2 id="gallery-title" className="mt-3 font-poster text-5xl uppercase leading-[0.85] tracking-[-0.01em] sm:text-8xl">
                  {lang === "pt" ? "Caos bonito" : "Beautiful chaos"}
                </h2>
              </Reveal>
              <Reveal variant="fade" delay={100} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {lang === "pt" ? "Clique para ampliar" : "Click to enlarge"}
              </Reveal>
            </div>

            {sortedPhotos.length > 0 ? (
              <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-5">
                {sortedPhotos.map((photo, index) => {
                  const tilt =
                    index % 4 === 0
                      ? "sm:-rotate-[1.6deg]"
                      : index % 4 === 1
                        ? "sm:rotate-[1.2deg]"
                        : index % 4 === 2
                          ? "sm:-rotate-[0.8deg]"
                          : "sm:rotate-[1.8deg]";
                  return (
                    <Reveal
                      key={photo.id}
                      variant="scale"
                      delay={(index % 4) * 70}
                      className="mb-3 break-inside-avoid sm:mb-5"
                    >
                      <button
                        type="button"
                        onClick={() => setLightbox(index)}
                        aria-label={`Abrir foto ${index + 1}`}
                        className={cn(
                          "group relative block w-full overflow-hidden rounded-xl border-2 border-[#fff6e9]/20 bg-white/5 shadow-[5px_5px_0_rgba(255,61,139,0.55)] transition duration-500 hover:rotate-0 hover:border-[#d8ff4a] sm:rounded-2xl",
                          tilt,
                        )}
                        style={{
                          aspectRatio:
                            index % 5 === 0 ? "4/5" : index % 3 === 0 ? "1/1" : "4/3",
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.alt_text || `${artistName} — foto ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:saturate-150"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-[#0b0614]/70 via-transparent to-transparent opacity-60 transition group-hover:opacity-30" />
                        <span className="absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/75">
                          <Asterisk className="h-3 w-3 text-[#d8ff4a]" />
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {photo.alt_text && (
                          <span className="absolute bottom-3 right-3 hidden max-w-[45%] truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 sm:block">
                            {photo.alt_text}
                          </span>
                        )}
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border-2 border-dashed border-white/15 py-16 text-center">
                <Disc3 className="mx-auto h-9 w-9 text-white/25" />
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-white/40">
                  {lang === "pt" ? "Galeria em breve" : "Gallery coming soon"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* AGENDA */}
        <section id="agenda" aria-labelledby="agenda-title" className="relative bg-[#d8ff4a] px-4 py-20 text-[#0b0614] sm:px-8 sm:py-28">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b0614]/55">
                  04 / {lang === "pt" ? "Datas" : "Dates"}
                </p>
                <h2 id="agenda-title" className="mt-3 font-poster text-5xl uppercase leading-[0.85] tracking-[-0.01em] sm:text-8xl">
                  {lang === "pt" ? "Onde me ver" : "See me live"}
                </h2>
              </Reveal>

              {next && (
                <Reveal variant="scale" delay={100}>
                  <Countdown
                    show={next}
                    className="flex gap-2"
                    tileClassName="flex min-w-[3.4rem] flex-col items-center rounded-xl border-2 border-[#0b0614] bg-[#0b0614] px-2 py-2 text-[#d8ff4a]"
                    labelClassName="font-mono text-[8px] uppercase tracking-[0.14em] text-[#d8ff4a]/60"
                  />
                </Reveal>
              )}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {sortedShows.length > 0 ? (
                sortedShows.map((show, index) => {
                  const date = formatShowDate(show.data, lang);
                  const isNext = next?.id === show.id;
                  return (
                    <Reveal
                      key={show.id}
                      variant="up"
                      delay={(index % 2) * 80}
                      className={cn(
                        "relative",
                        date.isPast && "opacity-45",
                        sortedShows.length % 2 === 1 &&
                          index === sortedShows.length - 1 &&
                          "md:col-span-2",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex items-stretch overflow-hidden rounded-2xl border-2 border-[#0b0614] bg-[#fff6e9] shadow-[5px_5px_0_#0b0614] transition duration-300 hover:-translate-y-1",
                          index % 2 === 0 ? "md:-rotate-[0.6deg]" : "md:rotate-[0.6deg]",
                        )}
                      >
                        <div className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-[#0b0614]/30 bg-[#ff3d8b] px-2 py-4 text-[#0b0614] sm:w-24">
                          <span className="font-poster text-3xl leading-none sm:text-4xl">{date.day}</span>
                          <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                            {date.monthShort}
                          </span>
                          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] opacity-60">
                            {date.weekday}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-poster text-lg uppercase leading-[0.95] tracking-[-0.01em] sm:text-xl">
                              {show.nome_evento}
                            </p>
                            {isNext && (
                              <span className="shrink-0 rounded-full bg-[#0b0614] px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[#d8ff4a]">
                                {lang === "pt" ? "Próximo" : "Next"}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#0b0614]/60">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {show.local || "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {show.cidade || "—"} · {date.year}
                            </span>
                          </div>
                        </div>
                        <span className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#0b0614] bg-[#d8ff4a]" />
                      </div>
                    </Reveal>
                  );
                })
              ) : (
                <div className="col-span-full rounded-3xl border-2 border-dashed border-[#0b0614]/30 py-16 text-center">
                  <Ticket className="mx-auto h-9 w-9 text-[#0b0614]/30" />
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-[#0b0614]/55">
                    {lang === "pt" ? "Novas datas em breve" : "New dates coming soon"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" aria-labelledby="booking-title" className="relative overflow-hidden bg-[#ff3d8b] px-4 py-20 text-[#0b0614] sm:px-8 sm:py-28">
          <div className="pointer-events-none absolute -right-8 top-6 select-none font-poster text-[24vw] uppercase leading-none text-[#0b0614]/[0.07]">
            Book
          </div>
          <div className="relative mx-auto max-w-[1500px]">
            <Reveal variant="up">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b0614]/55">
                05 / Booking
              </p>
              <h2
                id="booking-title"
                className="mt-3 font-poster text-[clamp(3.2rem,11vw,10rem)] uppercase leading-[0.8] tracking-[-0.02em]"
              >
                {lang === "pt" ? "Bora fazer barulho" : "Let's get loud"}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {waUrl && (
                <Reveal variant="scale">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col justify-between rounded-3xl border-2 border-[#0b0614] bg-[#0b0614] p-6 text-[#fff6e9] shadow-[6px_6px_0_#6c4cff] transition hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <SocialIcon name="whatsapp" className="h-9 w-9 text-[#d8ff4a]" />
                      <ArrowUpRight className="h-6 w-6 text-white/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#d8ff4a]" />
                    </div>
                    <div className="mt-10">
                      <p className="font-poster text-3xl uppercase leading-none">WhatsApp</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                        {perfil.whatsapp} · {lang === "pt" ? "resposta rápida" : "fast reply"}
                      </p>
                    </div>
                  </a>
                </Reveal>
              )}

              {perfil.email_booking && (
                <Reveal variant="scale" delay={80}>
                  <a
                    href={`mailto:${perfil.email_booking}`}
                    className="group flex h-full flex-col justify-between rounded-3xl border-2 border-[#0b0614] bg-[#fff6e9] p-6 text-[#0b0614] shadow-[6px_6px_0_#0b0614] transition hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <Mail className="h-9 w-9 text-[#ff3d8b]" />
                      <ArrowUpRight className="h-6 w-6 text-[#0b0614]/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#ff3d8b]" />
                    </div>
                    <div className="mt-10">
                      <p className="font-poster text-3xl uppercase leading-none">E-mail</p>
                      <p className="mt-2 break-all font-mono text-[10px] uppercase tracking-[0.12em] text-[#0b0614]/55">
                        {perfil.email_booking}
                      </p>
                    </div>
                  </a>
                </Reveal>
              )}
            </div>

            {!waUrl && !perfil.email_booking && (
              <p className="mt-10 font-mono text-xs uppercase tracking-[0.16em] text-[#0b0614]/55">
                {lang === "pt" ? "Contato em breve" : "Contact coming soon"}
              </p>
            )}

            <Reveal variant="fade" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#0b0614]/25 pt-6">
              <div className="flex flex-wrap gap-2">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0b0614] bg-[#d8ff4a] text-[#0b0614] transition hover:-rotate-6 hover:bg-[#fff6e9]"
                  >
                    <SocialIcon name={social.key} className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0b0614]/55">
                {lang === "pt" ? "Rider técnico sob demanda" : "Technical rider on request"}
              </p>
            </Reveal>
          </div>
        </section>

        <footer className="bg-[#0b0614] px-4 py-8 sm:px-8">
          <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="font-poster text-lg uppercase tracking-[0.04em]">{artistName}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              © {new Date().getFullYear()} · {lang === "pt" ? "Todos os direitos reservados" : "All rights reserved"}
            </p>
            <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 transition hover:text-[#d8ff4a]">
              Made with press<span className="text-[#ff3d8b]">link</span>
            </Link>
          </div>
        </footer>
      </main>

      {lightbox !== null && (
        <PhotoLightbox
          photos={sortedPhotos}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
          variant="dark"
        />
      )}
    </div>
  );
}
