"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  Disc3,
  Mail,
  MapPin,
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

const CHAPTERS = [
  { id: "bio", numeral: "I", label: "Biography" },
  { id: "musica", numeral: "II", label: "Listening" },
  { id: "galeria", numeral: "III", label: "Lookbook" },
  { id: "agenda", numeral: "IV", label: "Calendar" },
  { id: "booking", numeral: "V", label: "Inquiries" },
];

export function CleanEditorialTemplate({ data }: TemplateComponentProps) {
  const { perfil, fotos, midias, shows } = data;
  const [lang, setLang] = useState<TemplateLang>(perfil.biografia_pt ? "pt" : "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openMedia, setOpenMedia] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "spotify" | "soundcloud" | "youtube">("all");

  const bio = bioFor(perfil, lang);
  const paragraphs = splitParagraphs(bio);
  const lead = paragraphs[0] ?? null;
  const bothLanguages = hasBothLanguages(perfil);
  const socials = getSocialLinks(perfil);
  const waUrl = buildWhatsAppUrl(perfil, lang);
  const sortedPhotos = [...fotos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const lookbookPhotos = sortedPhotos.slice(1);
  const sortedShows = sortShows(shows);
  const next = nextShow(shows);
  const filteredMedia = midias
    .filter((media) => (filter === "all" ? true : media.tipo === filter))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const artistName = displayName(perfil.nome_artistico);
  const words = artistName.trim().split(/\s+/);
  const nameLines =
    words.length > 3
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(" "),
          words.slice(Math.ceil(words.length / 2)).join(" "),
        ]
      : [artistName];

  useTemplateTheme("#f4efe6", "#1a1712", "light");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f4efe6] text-[#1a1712] [color-scheme:light] selection:bg-[#b8472b] selection:text-[#f4efe6]">
      <ScrollProgress className="bg-[#b8472b]" />
      <ScrollCue href="#bio" label={lang === "pt" ? "Role para ver mais" : "Scroll for more"} tone="light" />

      {/* HEADER / MASTHEAD */}
      <header className="sticky top-0 z-[70] border-b border-[#1a1712]/15 bg-[#f4efe6]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <Link href="#top" className="group flex items-baseline gap-2">
            <span className="font-serif text-xl leading-none tracking-tight sm:text-2xl">
              Press<span className="italic text-[#b8472b]">link</span>
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.24em] text-[#1a1712]/45 sm:inline">
              The artist issue
            </span>
          </Link>

          <nav aria-label="Capítulos" className="hidden items-center gap-6 lg:flex">
            {CHAPTERS.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className="group flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1a1712]/55 transition hover:text-[#1a1712]"
              >
                <span className="text-[#b8472b]">{chapter.numeral}</span>
                {chapter.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-[#1a1712]/40 md:inline">
              Issue 01 / {new Date().getFullYear()}
            </span>
            <a
              href="#booking"
              className="hidden items-center gap-1.5 border border-[#1a1712] px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] transition hover:bg-[#1a1712] hover:text-[#f4efe6] sm:inline-flex"
            >
              Book the artist
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir índice"
              className="flex h-9 w-9 items-center justify-center border border-[#1a1712]/25 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ÍNDICE MOBILE */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-[#f4efe6] px-5 py-5">
          <div className="flex items-center justify-between border-b border-[#1a1712]/20 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#1a1712]/50">
              Index
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar índice"
              className="flex h-10 w-10 items-center justify-center border border-[#1a1712]/25"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center">
            {CHAPTERS.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                onClick={() => setMenuOpen(false)}
                className="group flex items-baseline justify-between border-b border-[#1a1712]/10 py-3"
              >
                <span className="font-serif text-4xl leading-none tracking-tight transition group-hover:italic group-hover:text-[#b8472b]">
                  {chapter.label}
                </span>
                <span className="font-mono text-xs text-[#b8472b]">{chapter.numeral}</span>
              </a>
            ))}
          </nav>
          <p className="border-t border-[#1a1712]/20 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/45">
            {perfil.username} — electronic press kit
          </p>
        </div>
      )}

      <main id="top">
        {/* HERO */}
        <section className="relative mx-auto max-w-[1600px] px-4 pt-8 sm:px-8 sm:pt-12 lg:px-12">
          <div className="flex items-center justify-between border-b border-[#1a1712]/20 pb-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#1a1712]/50">
              Electronic Press Kit
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#1a1712]/50">
              {lang === "pt" ? "Edição" : "Edition"} 01 — {new Date().getFullYear()}
            </p>
          </div>

          <div className="grid gap-8 pt-8 lg:grid-cols-12 lg:gap-10 lg:pt-12">
            <div className="relative z-10 lg:col-span-7">
              <Reveal variant="fade" delay={100} className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 border border-[#1a1712]/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b8472b]" />
                  {lang === "pt" ? "Disponível para booking" : "Available for booking"}
                </span>
                {next && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/50">
                    {lang === "pt" ? "Próxima data" : "Next date"}: {formatShowDate(next.data, lang).day}—
                    {formatShowDate(next.data, lang).monthShort}
                  </span>
                )}
              </Reveal>

              <SplitText
                lines={nameLines}
                className="font-serif leading-[0.88] tracking-[-0.035em] text-[clamp(3.2rem,8.8vw,8.5rem)]"
                delay={200}
                stagger={90}
              />

              <Reveal variant="up" delay={520} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#1a1712]/20 pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1712]/60">
                  DJ / Producer
                </span>
                <span className="h-3 w-px bg-[#1a1712]/20" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1a1712]/60">
                  {perfil.username}
                </span>
              </Reveal>

              {lead && (
                <Reveal variant="up" delay={600} className="mt-7 max-w-xl">
                  <p className="text-base leading-relaxed text-[#1a1712]/70 sm:text-lg">
                    {lead.length > 260 ? `${lead.slice(0, 260).trimEnd()}…` : lead}
                  </p>
                  <a
                    href="#bio"
                    className="group mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b8472b]"
                  >
                    {lang === "pt" ? "Ler a história" : "Read the story"}
                    <ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-1" />
                  </a>
                </Reveal>
              )}
            </div>

            <div className="relative lg:col-span-5">
              <Reveal variant="clip" delay={300} className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ddd5c7] lg:aspect-[3/4]">
                  {perfil.foto_url ? (
                    <Parallax className="absolute inset-0" speed={6} scale={1.12}>
                      <Image
                        src={perfil.foto_url}
                        alt={artistName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover object-center grayscale-[35%] contrast-[1.02] saturate-[0.85]"
                      />
                    </Parallax>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#e6ded1]">
                      <Disc3 className="h-20 w-20 text-[#1a1712]/20" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                  <span>
                    {lang === "pt" ? "Retrato" : "Portrait"} — {artistName}
                  </span>
                  <span>Fig. 01</span>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 border-y border-[#1a1712]/20 py-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/50">
                {String(sortedPhotos.length).padStart(2, "0")} {lang === "pt" ? "fotos" : "photos"}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/50">
                {String(midias.length).padStart(2, "0")} tracks
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/50">
                {String(sortedShows.length).padStart(2, "0")} {lang === "pt" ? "datas" : "dates"}
              </span>
            </div>
            <a
              href="#bio"
              className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#1a1712]/45 transition hover:text-[#b8472b]"
            >
              {lang === "pt" ? "Folhear" : "Browse"}
              <ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-1" />
            </a>
          </div>
        </section>

        {/* BIO */}
        <section id="bio" aria-labelledby="bio-title" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <Reveal variant="up" className="lg:sticky lg:top-24">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8472b]">Chapter I</p>
                <h2 id="bio-title" className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-5xl">
                  {lang === "pt" ? "A história" : "The story"}
                </h2>
                <div className="mt-6 h-px w-16 origin-left bg-[#1a1712]/30" />
                {bothLanguages && (
                  <div className="mt-6 flex gap-3 font-mono text-[9px] uppercase tracking-[0.18em]">
                    {(["pt", "en"] as const).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLang(code)}
                        aria-pressed={lang === code}
                        className={cn(
                          "border-b pb-1 transition",
                          lang === code
                            ? "border-[#b8472b] text-[#b8472b]"
                            : "border-transparent text-[#1a1712]/40 hover:text-[#1a1712]",
                        )}
                      >
                        {code === "pt" ? "Português" : "English"}
                      </button>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              {paragraphs.length > 0 ? (
                <div className="lg:columns-2 lg:gap-12">
                  {paragraphs.map((paragraph, index) => (
                    <Reveal key={paragraph.slice(0, 24)} variant="up" delay={index * 80}>
                      <p
                        className={cn(
                          "mb-5 break-inside-avoid text-[15px] leading-[1.75] text-[#1a1712]/75 sm:text-base",
                          index === 0 &&
                            "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[4.5rem] first-letter:leading-[0.72] first-letter:text-[#b8472b]",
                        )}
                      >
                        {paragraph}
                      </p>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <p className="text-base text-[#1a1712]/60">
                  {lang === "pt" ? "Biografia em breve." : "Biography coming soon."}
                </p>
              )}

              {socials.length > 0 && (
                <Reveal variant="fade" delay={160} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#1a1712]/15 pt-4">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/55 transition hover:text-[#b8472b]"
                    >
                      <SocialIcon name={social.key} className="h-3.5 w-3.5" />
                      {social.label}
                      <ArrowUpRight className="h-3 w-3 opacity-40 transition group-hover:opacity-100" />
                    </a>
                  ))}
                </Reveal>
              )}
            </div>
          </div>

          {sortedPhotos[0] && (
            <figure className="mt-14">
              <button
                type="button"
                onClick={() => setLightbox(0)}
                className="group relative block aspect-[16/10] w-full overflow-hidden bg-[#ddd5c7] sm:aspect-[21/9]"
              >
                <Image
                  src={sortedPhotos[0].url}
                  alt={sortedPhotos[0].alt_text || `${artistName} — foto de destaque`}
                  fill
                  sizes="(max-width: 640px) 100vw, 90vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/85">
                    {sortedPhotos[0].alt_text || artistName}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4efe6]/90 text-[#1a1712] opacity-0 backdrop-blur transition group-hover:opacity-100">
                    <Plus className="h-4 w-4" />
                  </span>
                </span>
              </button>
              <figcaption className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                Fig. 02 — {sortedPhotos[0].alt_text || artistName}
              </figcaption>
            </figure>
          )}
        </section>

        {/* MÚSICA */}
        <section id="musica" aria-labelledby="music-title" className="border-y border-[#1a1712]/15 bg-[#ece5d8]">
          <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8472b]">Chapter II</p>
                <h2 id="music-title" className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-6xl">
                  {lang === "pt" ? "Escutas selecionadas" : "Selected listening"}
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
                      "border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition",
                      filter === item
                        ? "border-[#1a1712] bg-[#1a1712] text-[#f4efe6]"
                        : "border-[#1a1712]/20 text-[#1a1712]/50 hover:border-[#1a1712]/50 hover:text-[#1a1712]",
                    )}
                  >
                    {item === "all" ? (lang === "pt" ? "Tudo" : "All") : providerLabel(item)}
                  </button>
                ))}
              </Reveal>
            </div>

            <div className="mt-8">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media, index) => {
                  const isOpen = openMedia === media.id;
                  return (
                    <div key={media.id} className="border-t border-[#1a1712]/20 last:border-b">
                      <button
                        type="button"
                        onClick={() => setOpenMedia(isOpen ? null : media.id)}
                        aria-expanded={isOpen}
                        className="group grid w-full grid-cols-[2rem_1fr_auto] items-baseline gap-3 py-5 text-left sm:grid-cols-[3rem_1fr_12rem_auto] sm:items-center sm:gap-5 sm:py-6"
                      >
                        <span className="font-mono text-[10px] text-[#1a1712]/35">{trackNumber(index)}</span>
                        <span
                          className={cn(
                            "font-serif text-2xl leading-none tracking-tight transition sm:text-4xl",
                            isOpen ? "italic text-[#b8472b]" : "group-hover:italic group-hover:text-[#b8472b]",
                          )}
                        >
                          {media.titulo || `${providerLabel(media.tipo)} — ${artistName}`}
                        </span>
                        <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/40 sm:block">
                          {providerLabel(media.tipo)}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1712]/25 text-[#1a1712]/60 transition group-hover:border-[#b8472b] group-hover:text-[#b8472b]">
                          {isOpen ? <X className="h-4 w-4" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="pb-8 sm:pl-[4.5rem]">
                          <div className="max-w-3xl border border-[#1a1712]/15 bg-[#f4efe6] p-2">
                            <MediaEmbed tipo={media.tipo} url={media.url} titulo={media.titulo} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="border-y border-[#1a1712]/20 py-14 text-center">
                  <Disc3 className="mx-auto h-8 w-8 text-[#1a1712]/25" />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                    {lang === "pt" ? "Nenhuma faixa neste filtro" : "No tracks in this filter"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria" aria-labelledby="gallery-title" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal variant="up">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8472b]">Chapter III</p>
              <h2 id="gallery-title" className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-6xl">
                {lang === "pt" ? "Lookbook" : "The lookbook"}
              </h2>
            </Reveal>
            <Reveal variant="fade" delay={100} className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/40">
              {lang === "pt" ? "Clique para ampliar" : "Click to enlarge"}
            </Reveal>
          </div>

          {lookbookPhotos.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-6">
              {lookbookPhotos.map((photo, index) => {
                const alone = index === lookbookPhotos.length - 1 && lookbookPhotos.length % 3 === 1;
                const widePair =
                  lookbookPhotos.length % 3 === 2 && index >= lookbookPhotos.length - 2;
                const span = alone
                  ? "col-span-2 sm:col-span-6"
                  : widePair
                    ? "col-span-2 sm:col-span-3"
                    : "col-span-1 sm:col-span-2";
                const ratio = alone
                  ? "aspect-[16/10] sm:aspect-[21/9]"
                  : widePair
                    ? "aspect-[4/3] sm:aspect-[4/5]"
                    : "aspect-[4/5]";
                return (
                  <div key={photo.id} className={span}>
                    <button
                      type="button"
                      onClick={() => setLightbox(index + 1)}
                      className={cn(
                        "group relative block w-full overflow-hidden bg-[#ddd5c7]",
                        ratio,
                      )}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt_text || `${artistName} — foto ${index + 2}`}
                        fill
                        sizes={alone ? "100vw" : "(max-width: 640px) 50vw, 33vw"}
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                      <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f4efe6]/90 text-[#1a1712] opacity-0 backdrop-blur transition group-hover:opacity-100">
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                    <p className="mt-2 truncate font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/40">
                      Fig. {String(index + 3).padStart(2, "0")} — {photo.alt_text || artistName}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-[#1a1712]/25 py-16 text-center">
              <Disc3 className="mx-auto h-8 w-8 text-[#1a1712]/25" />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                {lang === "pt" ? "Galeria em breve" : "Gallery coming soon"}
              </p>
            </div>
          )}
        </section>

        {/* AGENDA */}
        <section id="agenda" aria-labelledby="agenda-title" className="border-y border-[#1a1712]/15 bg-[#ece5d8]">
          <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8472b]">Chapter IV</p>
                <h2 id="agenda-title" className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-6xl">
                  {lang === "pt" ? "Calendário" : "The calendar"}
                </h2>
              </Reveal>
              <Reveal variant="fade" delay={100} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                <Calendar className="h-3.5 w-3.5" />
                {lang === "pt" ? "Próximas apresentações" : "Upcoming performances"}
              </Reveal>
            </div>

            <div className="mt-8">
              <div className="grid grid-cols-[3.2rem_1fr_auto] gap-3 border-b border-[#1a1712]/30 pb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-[#1a1712]/40 sm:grid-cols-[6rem_1.4fr_1fr_0.8fr_3rem] sm:gap-4">
                <span>Date</span>
                <span>Event</span>
                <span className="hidden sm:block">Venue</span>
                <span className="hidden sm:block">City</span>
                <span />
              </div>

              {sortedShows.length > 0 ? (
                sortedShows.map((show, index) => {
                  const date = formatShowDate(show.data, lang);
                  const isNext = next?.id === show.id;
                  return (
                    <Reveal key={show.id} variant="up" delay={index * 50}>
                      <div
                        className={cn(
                          "group grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 border-b border-[#1a1712]/15 py-4 transition sm:grid-cols-[6rem_1.4fr_1fr_0.8fr_3rem] sm:gap-4 sm:py-5",
                          date.isPast && "opacity-40",
                        )}
                      >
                        <div className="flex items-baseline gap-1.5 sm:block">
                          <span className="font-serif text-2xl leading-none tracking-tight sm:text-3xl">{date.day}</span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/50 sm:ml-1">
                            {date.monthShort}
                          </span>
                          <span className="hidden font-mono text-[8px] uppercase tracking-[0.14em] text-[#1a1712]/35 sm:mt-1 sm:block">
                            {date.weekday} · {date.year}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-serif text-lg leading-tight tracking-tight transition group-hover:italic group-hover:text-[#b8472b] sm:text-2xl">
                            {show.nome_evento}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#1a1712]/40 sm:hidden">
                            {show.local || "—"} · {show.cidade || "—"}
                          </p>
                          {isNext && (
                            <span className="mt-1 inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#b8472b]">
                              <span className="h-1 w-1 rounded-full bg-[#b8472b]" />
                              {lang === "pt" ? "Próxima data" : "Next date"}
                            </span>
                          )}
                        </div>
                        <p className="hidden truncate text-sm text-[#1a1712]/60 sm:block">{show.local || "—"}</p>
                        <p className="hidden truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#1a1712]/45 sm:block">
                          {show.cidade || "—"}
                        </p>
                        <span className="flex justify-end">
                          <ArrowUpRight className="h-4 w-4 text-[#1a1712]/25 transition group-hover:text-[#b8472b]" />
                        </span>
                      </div>
                    </Reveal>
                  );
                })
              ) : (
                <div className="border-b border-[#1a1712]/15 py-14 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-[#1a1712]/20" />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1a1712]/45">
                    {lang === "pt" ? "Novas datas em breve" : "New dates coming soon"}
                  </p>
                </div>
              )}
            </div>

            {next && (
              <Reveal variant="fade" className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#1a1712]/40">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {next.local || next.cidade}
                </span>
                <span>{next.nome_evento}</span>
              </Reveal>
            )}
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" aria-labelledby="booking-title" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-3">
              <Reveal variant="up">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8472b]">Chapter V</p>
                <h2 id="booking-title" className="mt-2 font-serif text-4xl leading-[0.95] tracking-tight sm:text-5xl">
                  {lang === "pt" ? "Contato" : "Inquiries"}
                </h2>
                <div className="mt-6 h-px w-16 bg-[#1a1712]/30" />
              </Reveal>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal variant="up">
                <p className="max-w-3xl font-serif text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.02] tracking-[-0.02em]">
                  {lang === "pt" ? (
                    <>
                      Vamos criar algo <span className="italic text-[#b8472b]">memorável</span>.
                    </>
                  ) : (
                    <>
                      Let&apos;s create something <span className="italic text-[#b8472b]">memorable</span>.
                    </>
                  )}
                </p>
              </Reveal>

              <div className="mt-8">
                {perfil.email_booking && (
                  <Reveal variant="up">
                    <a
                      href={`mailto:${perfil.email_booking}`}
                      className="group flex items-center justify-between gap-4 border-t border-[#1a1712]/20 py-5 transition hover:border-[#b8472b]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Mail className="h-5 w-5 shrink-0 text-[#b8472b]" />
                        <span className="truncate font-serif text-xl tracking-tight transition group-hover:italic group-hover:text-[#b8472b] sm:text-2xl">
                          {perfil.email_booking}
                        </span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-[#1a1712]/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b8472b]" />
                    </a>
                  </Reveal>
                )}

                {waUrl && (
                  <Reveal variant="up" delay={70}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 border-y border-[#1a1712]/20 py-5 transition hover:border-[#b8472b]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <SocialIcon name="whatsapp" className="h-5 w-5 shrink-0 text-[#b8472b]" />
                        <span className="font-serif text-xl tracking-tight transition group-hover:italic group-hover:text-[#b8472b] sm:text-2xl">
                          WhatsApp — {perfil.whatsapp}
                        </span>
                      </span>
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-[#1a1712]/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b8472b]" />
                    </a>
                  </Reveal>
                )}

                {!waUrl && !perfil.email_booking && (
                  <p className="border-y border-[#1a1712]/20 py-8 text-[#1a1712]/55">
                    {lang === "pt" ? "Informações de contato em breve." : "Contact information coming soon."}
                  </p>
                )}
              </div>

              {socials.length > 0 && (
                <Reveal variant="fade" delay={120} className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#1a1712]/55 transition hover:text-[#b8472b]"
                    >
                      <SocialIcon name={social.key} className="h-3.5 w-3.5" />
                      {social.label}
                      <ArrowUpRight className="h-3 w-3 opacity-40 transition group-hover:opacity-100" />
                    </a>
                  ))}
                </Reveal>
              )}

              <Reveal variant="fade" delay={160} className="mt-8 border-t border-[#1a1712]/15 pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/40">
                  {lang === "pt" ? "Rider técnico disponível sob demanda" : "Technical rider available on request"}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* MARQUEE + FOOTER */}
        <div className="overflow-hidden border-y border-[#1a1712]/20 py-3">
          <Marquee speed={46}>
            {[artistName, "Electronic Press Kit", lang === "pt" ? "Disponível para booking" : "Available for booking", "Presslink"].map(
              (item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-6 sm:gap-10">
                  <span className="font-serif text-lg italic tracking-tight text-[#1a1712]/55 sm:text-xl">{item}</span>
                  <span className="h-1 w-1 rounded-full bg-[#b8472b]" />
                </span>
              ),
            )}
          </Marquee>
        </div>

        <footer className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12">
          <div className="grid gap-6 border-t border-[#1a1712]/15 pt-5 sm:grid-cols-3">
            <div>
              <p className="font-serif text-lg tracking-tight">
                Press<span className="italic text-[#b8472b]">link</span>
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/40">
                {lang === "pt" ? "O portfólio do artista" : "The artist portfolio"}
              </p>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/40">
              <p>Issue 01 — {new Date().getFullYear()}</p>
              <p className="mt-1">{perfil.username}</p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#1a1712]/40">
                © {new Date().getFullYear()} {artistName}
              </p>
              <Link
                href="#top"
                aria-label="Voltar ao topo"
                className="flex h-8 w-8 items-center justify-center border border-[#1a1712]/20 text-[#1a1712]/50 transition hover:border-[#b8472b] hover:text-[#b8472b]"
              >
                <ChevronLeft className="h-4 w-4 rotate-90" />
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {lightbox !== null && (
        <PhotoLightbox
          photos={sortedPhotos}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
          variant="light"
        />
      )}
    </div>
  );
}
