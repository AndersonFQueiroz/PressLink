"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Mail,
  Menu,
  Play,
  Plus,
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
  { id: "bio", index: "01", label: "Bio" },
  { id: "musica", index: "02", label: "Música" },
  { id: "galeria", index: "03", label: "Galeria" },
  { id: "agenda", index: "04", label: "Agenda" },
  { id: "booking", index: "05", label: "Booking" },
];

export function DarkMinimalTemplate({ data }: TemplateComponentProps) {
  const { perfil, fotos, midias, shows } = data;
  const [lang, setLang] = useState<TemplateLang>(perfil.biografia_pt ? "pt" : "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openMedia, setOpenMedia] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "spotify" | "soundcloud" | "youtube">("all");
  const stripRef = useRef<HTMLDivElement>(null);

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
  const nameWords = artistName.trim().split(/\s+/);
  const nameLines =
    nameWords.length > 2
      ? [
          nameWords.slice(0, Math.ceil(nameWords.length / 2)).join(" "),
          nameWords.slice(Math.ceil(nameWords.length / 2)).join(" "),
        ]
      : [artistName];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useTemplateTheme("#070708", "#e9e7df", "dark");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollStrip = (direction: number) => {
    const node = stripRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.78, behavior: "smooth" });
  };

  const stats = [
    { value: String(sortedPhotos.length).padStart(2, "0"), label: lang === "pt" ? "fotos" : "photos" },
    { value: String(midias.length).padStart(2, "0"), label: lang === "pt" ? "faixas" : "tracks" },
    { value: String(sortedShows.length).padStart(2, "0"), label: lang === "pt" ? "datas" : "dates" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070708] text-[#e9e7df] [color-scheme:dark]">
      <ScrollProgress className="bg-acid" />
      <ScrollCue href="#bio" label={lang === "pt" ? "Role para ver mais" : "Scroll for more"} tone="dark" />

      {/* HEADER */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[70] transition-colors duration-500",
          scrolled ? "border-b border-white/10 bg-[#070708]/85 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="#top" className="group flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-acid/50 text-acid transition group-hover:bg-acid group-hover:text-black">
              <Disc3 className="h-4 w-4" />
            </span>
            <span className="font-mono text-[10px] uppercase leading-tight tracking-[0.28em] text-white/60">
              Electronic
              <br />
              Press Kit
            </span>
          </Link>

          <nav aria-label="Seções" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex items-baseline gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 transition hover:text-white"
              >
                <span className="text-acid/70">{item.index}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#booking"
              className="hidden rounded-full border border-acid/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-acid transition hover:bg-acid hover:text-black sm:inline-flex"
            >
              Available for booking
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#070708]/98 px-5 py-5 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-12 flex flex-1 flex-col justify-center gap-1">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-white/10 py-4"
              >
                <span className="font-display text-4xl font-medium tracking-tight text-white/85 transition group-hover:text-acid">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-white/30">{item.index}</span>
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60"
                >
                  <SocialIcon name={social.key} className="h-4 w-4" />
                </a>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              {new Date().getFullYear()} ©
            </span>
          </div>
        </div>
      )}

      <main id="top">
        {/* HERO */}
        <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-28">
          <div className="absolute inset-0">
            {perfil.foto_url ? (
              <Parallax className="absolute inset-0" speed={10} scale={1.14}>
                <Image
                  src={perfil.foto_url}
                  alt={artistName}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center grayscale contrast-[1.08]"
                />
              </Parallax>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,#2c2c28_0%,#0b0b0c_65%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/45 to-[#070708]/35" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#070708_0%,transparent_55%)]" />
          </div>

          <div className="relative z-10 px-5 sm:px-8 lg:px-12">
            <Reveal variant="fade" delay={200} className="mb-8 flex flex-wrap items-center gap-3 sm:gap-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-acid/35 bg-black/30 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-acid backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
                {lang === "pt" ? "Disponível para booking" : "Available for booking"}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                Electronic Press Kit — {new Date().getFullYear()}
              </span>
            </Reveal>

            <SplitText
              lines={nameLines.map((line) => line.toUpperCase())}
              className="font-display font-bold uppercase leading-[0.82] tracking-[-0.05em] text-[#f3f1e9] text-[clamp(3.4rem,12.5vw,12rem)]"
              delay={250}
              stagger={90}
            />

            <div className="mt-8 flex flex-col gap-6 border-t border-white/15 pt-6 sm:mt-12 sm:flex-row sm:items-end sm:justify-between">
              <Reveal variant="up" delay={650} className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
                  DJ / Producer
                </span>
                <span className="hidden h-3 w-px bg-white/20 sm:block" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
                  {next
                    ? `${lang === "pt" ? "Próxima data" : "Next date"} — ${formatShowDate(next.data, lang).day}.${formatShowDate(next.data, lang).monthShort}`
                    : lang === "pt"
                      ? "Turnê 2026"
                      : "2026 tour"}
                </span>
              </Reveal>

              <Reveal variant="fade" delay={800} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-acid hover:text-acid"
                    >
                      <SocialIcon name={social.key} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
                <a
                  href="#bio"
                  aria-label="Rolar para a bio"
                  className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-acid hover:text-acid"
                >
                  <ArrowDown className="h-5 w-5 transition group-hover:translate-y-1" />
                </a>
              </Reveal>
            </div>
          </div>

          <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 xl:block">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow">
                <defs>
                  <path id="ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
                </defs>
                <text className="fill-white/35 font-mono text-[8px] uppercase tracking-[0.32em]">
                  <textPath href="#ring">scroll to explore • press kit • </textPath>
                </text>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
              </span>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="relative z-10 border-y border-white/10 bg-[#0b0b0c] py-4">
          <Marquee speed={38} className="text-white/70">
            {[
              artistName.toUpperCase(),
              "BOOKING OPEN",
              "ELECTRONIC PRESS KIT",
              "WORLDWIDE",
              "DJ SET",
            ].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-6 sm:gap-10">
                <span className="font-display text-lg font-medium uppercase tracking-[0.1em] sm:text-2xl">
                  {item}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
              </span>
            ))}
          </Marquee>
        </div>

        {/* BIO */}
        <section id="bio" aria-labelledby="bio-title" className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-3">
              <Reveal variant="up" className="lg:sticky lg:top-28">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-acid/80">01 — Profile</p>
                <h2
                  id="bio-title"
                  className="mt-4 font-display text-3xl font-medium uppercase leading-none tracking-tight sm:text-4xl"
                >
                  {lang === "pt" ? "Quem está por trás" : "Behind the sound"}
                </h2>
                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 lg:grid-cols-1 lg:gap-5">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <span className="font-display text-2xl font-medium text-white sm:text-3xl">{stat.value}</span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              {bothLanguages && (
                <Reveal variant="fade" className="mb-8 flex items-center gap-2">
                  {(["pt", "en"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      aria-pressed={lang === code}
                      className={cn(
                        "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition",
                        lang === code
                          ? "border-acid bg-acid text-black"
                          : "border-white/15 text-white/45 hover:border-white/40 hover:text-white",
                      )}
                    >
                      {code === "pt" ? "Português" : "English"}
                    </button>
                  ))}
                </Reveal>
              )}

              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <Reveal key={paragraph.slice(0, 24)} variant="up" delay={index * 90}>
                    <p
                      className={cn(
                        "max-w-4xl leading-[1.45] tracking-[-0.01em] text-[#d8d5cb]",
                        index === 0
                          ? "text-[clamp(1.35rem,2.6vw,2.35rem)] font-light"
                          : "mt-6 text-base leading-relaxed text-white/55 sm:text-lg",
                      )}
                    >
                      {paragraph}
                    </p>
                  </Reveal>
                ))
              ) : (
                <p className="text-lg text-white/50">
                  {lang === "pt" ? "Biografia em breve." : "Biography coming soon."}
                </p>
              )}

              {socials.length > 0 && (
                <Reveal variant="up" delay={150} className="mt-12 flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 transition hover:border-acid hover:text-acid"
                    >
                      <SocialIcon name={social.key} className="h-3.5 w-3.5" />
                      {social.label}
                      <ArrowUpRight className="h-3 w-3 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  ))}
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* MÚSICA */}
        <section
          id="musica"
          aria-labelledby="music-title"
          className="relative border-t border-white/10 bg-[#0a0a0b] px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
        >
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-acid/80">02 — Listen</p>
                <h2
                  id="music-title"
                  className="mt-4 font-display text-4xl font-medium uppercase leading-none tracking-tight sm:text-6xl"
                >
                  {lang === "pt" ? "Seleção sonora" : "Selected sounds"}
                </h2>
              </Reveal>

              <Reveal variant="fade" delay={120} className="flex flex-wrap gap-2">
                {(["all", "spotify", "soundcloud", "youtube"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition",
                      filter === item
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/45 hover:border-white/40 hover:text-white",
                    )}
                  >
                    {item === "all" ? (lang === "pt" ? "Tudo" : "All") : providerLabel(item)}
                  </button>
                ))}
              </Reveal>
            </div>

            <div className="mt-12">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media, index) => {
                  const isOpen = openMedia === media.id;
                  return (
                    <div key={media.id} className="border-t border-white/10 last:border-b">
                      <button
                        type="button"
                        onClick={() => setOpenMedia(isOpen ? null : media.id)}
                        aria-expanded={isOpen}
                        className="group grid w-full grid-cols-[2.2rem_1fr_auto] items-center gap-3 py-5 text-left sm:grid-cols-[3.5rem_1fr_10rem_auto] sm:gap-5 sm:py-6"
                      >
                        <span className="font-mono text-[11px] text-white/25">{trackNumber(index)}</span>
                        <span
                          className={cn(
                            "font-display text-lg font-medium leading-tight tracking-tight transition sm:text-2xl lg:text-3xl",
                            isOpen ? "text-acid" : "text-[#e9e7df] group-hover:text-acid",
                          )}
                        >
                          {media.titulo || `${providerLabel(media.tipo)} — ${artistName}`}
                        </span>
                        <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 sm:block">
                          {providerLabel(media.tipo)}
                        </span>
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border transition sm:h-11 sm:w-11",
                            isOpen
                              ? "border-acid bg-acid text-black"
                              : "border-white/15 text-white/60 group-hover:border-acid group-hover:text-acid",
                          )}
                        >
                          {isOpen ? <X className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pb-8 pl-0 sm:pl-[5.25rem]">
                          <div className="max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2">
                            <MediaEmbed tipo={media.tipo} url={media.url} titulo={media.titulo} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 border-y border-white/10 py-16 text-center">
                  <Disc3 className="h-8 w-8 text-white/25" />
                  <p className="text-white/50">
                    {lang === "pt" ? "Nenhuma faixa neste filtro." : "No tracks in this filter."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria" aria-labelledby="gallery-title" className="relative py-24 sm:py-32">
          <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-5 sm:flex-row sm:items-end sm:px-8 lg:px-12">
            <Reveal variant="up">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-acid/80">03 — Visual</p>
              <h2
                id="gallery-title"
                className="mt-4 font-display text-4xl font-medium uppercase leading-none tracking-tight sm:text-6xl"
              >
                {lang === "pt" ? "Registros" : "Frames"}
              </h2>
            </Reveal>
            <Reveal variant="fade" delay={100} className="flex items-center gap-2">
              <span className="mr-2 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 sm:block">
                {lang === "pt" ? "Arraste ou use as setas" : "Drag or use arrows"}
              </span>
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                aria-label="Fotos anteriores"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-acid hover:text-acid"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                aria-label="Próximas fotos"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-acid hover:text-acid"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </Reveal>
          </div>

          {sortedPhotos.length > 0 ? (
            <Reveal variant="up" className="mt-10">
              <div
                ref={stripRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:gap-6 sm:px-8 lg:px-12"
              >
                {sortedPhotos.map((photo, index) => (
                  <div key={photo.id} className="group relative shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => setLightbox(index)}
                    aria-label={`Abrir foto ${index + 1}`}
                    className="relative block h-[52vh] w-[76vw] overflow-hidden rounded-sm bg-white/5 sm:h-[62vh] sm:w-[40vw] lg:h-[68vh] lg:w-[30vw]"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt_text || `${artistName} — foto ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 76vw, (max-width: 1024px) 40vw, 30vw"
                      className="object-cover grayscale transition duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
                    <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-left">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                        {String(index + 1).padStart(2, "0")} / {String(sortedPhotos.length).padStart(2, "0")}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                        <Plus className="h-4 w-4" />
                      </span>
                    </span>
                  </button>
                  {photo.alt_text && (
                    <p className="mt-3 max-w-[30vw] truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                      {photo.alt_text}
                    </p>
                  )}
                  </div>
                ))}
              </div>
            </Reveal>
          ) : (
            <div className="mx-5 mt-10 flex flex-col items-center gap-3 border border-white/10 py-16 text-center sm:mx-8 lg:mx-12">
              <Disc3 className="h-8 w-8 text-white/25" />
              <p className="text-white/50">
                {lang === "pt" ? "Galeria em breve." : "Gallery coming soon."}
              </p>
            </div>
          )}
        </section>

        {/* AGENDA */}
        <section
          id="agenda"
          aria-labelledby="agenda-title"
          className="relative border-t border-white/10 bg-[#0a0a0b] px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
        >
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-acid/80">04 — Dates</p>
                <h2
                  id="agenda-title"
                  className="mt-4 font-display text-4xl font-medium uppercase leading-none tracking-tight sm:text-6xl"
                >
                  {lang === "pt" ? "Agenda" : "Tour dates"}
                </h2>
              </Reveal>
              <Reveal variant="fade" delay={100}>
                <a
                  href="#booking"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-acid"
                >
                  <Calendar className="h-4 w-4" />
                  {lang === "pt" ? "Contratar uma data" : "Book a date"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Reveal>
            </div>

            <div className="mt-12">
              {sortedShows.length > 0 ? (
                sortedShows.map((show, index) => {
                  const date = formatShowDate(show.data, lang);
                  const isNext = next?.id === show.id;
                  return (
                    <Reveal key={show.id} variant="up" delay={index * 60}>
                      <div
                        className={cn(
                          "group grid grid-cols-[3.6rem_1fr_auto] items-center gap-4 border-t border-white/10 py-5 transition sm:grid-cols-[5rem_1fr_1fr_10rem_auto] sm:gap-6 sm:py-6",
                          date.isPast && "opacity-40",
                        )}
                      >
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-2xl font-medium tracking-tight sm:text-4xl">
                            {date.day}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                            {date.monthShort}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-medium text-[#e9e7df] transition group-hover:text-acid sm:text-xl">
                            {show.nome_evento}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                            {date.weekday} · {date.year}
                          </p>
                        </div>
                        <p className="hidden truncate text-sm text-white/50 sm:block">{show.local || "—"}</p>
                        <p className="hidden truncate font-mono text-[11px] uppercase tracking-[0.16em] text-white/40 sm:block">
                          {show.cidade || "—"}
                        </p>
                        <div className="flex items-center gap-3">
                          {isNext ? (
                            <span className="rounded-full border border-acid/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-acid">
                              {lang === "pt" ? "Próximo" : "Next"}
                            </span>
                          ) : (
                            <span className="hidden font-mono text-[10px] text-white/20 sm:block">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                          <ArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:text-acid" />
                        </div>
                      </div>
                    </Reveal>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 border-y border-white/10 py-16 text-center">
                  <Calendar className="h-8 w-8 text-white/25" />
                  <p className="text-white/50">
                    {lang === "pt"
                      ? "Novas datas de turnê em breve."
                      : "New tour dates coming soon."}
                  </p>
                </div>
              )}
              <div className="border-t border-white/10" />
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" aria-labelledby="booking-title" className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
          <div className="pointer-events-none absolute -right-32 top-0 h-[30rem] w-[30rem] rounded-full bg-acid/[0.06] blur-[120px]" />
          <div className="relative mx-auto max-w-[1500px]">
            <Reveal variant="up">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-acid/80">05 — Booking</p>
              <h2
                id="booking-title"
                className="mt-4 max-w-5xl font-display text-[clamp(2.6rem,7vw,6.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.04em]"
              >
                {lang === "pt" ? "Vamos fazer barulho." : "Let's make noise."}
              </h2>
            </Reveal>

            <div className="mt-14">
              {waUrl && (
                <Reveal variant="up">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 border-t border-white/15 py-7 transition hover:border-acid sm:py-9"
                  >
                    <span className="flex items-center gap-4 sm:gap-6">
                      <SocialIcon name="whatsapp" className="h-6 w-6 text-white/45 transition group-hover:text-acid sm:h-8 sm:w-8" />
                      <span className="font-display text-2xl font-medium uppercase tracking-tight transition group-hover:text-acid sm:text-4xl">
                        WhatsApp
                      </span>
                      <span className="hidden font-mono text-[11px] text-white/35 sm:block">{perfil.whatsapp}</span>
                    </span>
                    <ArrowUpRight className="h-6 w-6 shrink-0 text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid sm:h-8 sm:w-8" />
                  </a>
                </Reveal>
              )}

              {perfil.email_booking && (
                <Reveal variant="up" delay={80}>
                  <a
                    href={`mailto:${perfil.email_booking}`}
                    className="group flex items-center justify-between gap-4 border-t border-white/15 py-7 transition hover:border-acid sm:py-9"
                  >
                    <span className="flex min-w-0 items-center gap-4 sm:gap-6">
                      <Mail className="h-6 w-6 shrink-0 text-white/45 transition group-hover:text-acid sm:h-8 sm:w-8" />
                      <span className="min-w-0">
                        <span className="block font-display text-2xl font-medium uppercase tracking-tight transition group-hover:text-acid sm:text-4xl">
                          E-mail
                        </span>
                        <span className="mt-1 block truncate font-mono text-[11px] text-white/35">
                          {perfil.email_booking}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-6 w-6 shrink-0 text-white/30 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid sm:h-8 sm:w-8" />
                  </a>
                </Reveal>
              )}

              {!waUrl && !perfil.email_booking && (
                <p className="border-t border-white/15 py-10 text-white/50">
                  {lang === "pt"
                    ? "Informações de contato serão disponibilizadas em breve."
                    : "Contact information coming soon."}
                </p>
              )}
              <div className="border-t border-white/15" />
            </div>

            <Reveal variant="fade" className="mt-12 flex flex-col gap-4 border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  Technical specs / rider
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                  {lang === "pt"
                    ? "2–3x Pioneer CDJ-3000 / DJM-V10 ou Allen & Heath Xone:96 + monitoração estéreo de alta pressão."
                    : "2–3x Pioneer CDJ-3000 / DJM-V10 or Allen & Heath Xone:96 + high-pressure stereo monitoring."}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                {lang === "pt" ? "Rider sob demanda" : "Rider on request"}
              </span>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg font-medium uppercase tracking-tight">
                {artistName}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                © {new Date().getFullYear()} — {lang === "pt" ? "Todos os direitos reservados" : "All rights reserved"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 transition hover:border-acid hover:text-acid"
                >
                  <SocialIcon name={social.key} className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 transition hover:text-acid"
            >
              Made with press<span className="text-acid">link</span>
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
