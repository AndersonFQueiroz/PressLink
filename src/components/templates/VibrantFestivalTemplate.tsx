"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Flame,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Volume2,
  X,
  Disc3,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import { TemplateComponentProps, TemplateFoto } from "@/types/template";
import { MediaEmbed, ProviderBadge } from "@/components/features/painel/MediaEmbed";
import { getCleanWhatsAppDigits } from "@/lib/validators/contato";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function VibrantFestivalTemplate({ data }: TemplateComponentProps) {
  const { perfil, fotos, midias, shows } = data;

  // Idioma da bio (PT ou EN)
  const [lang, setLang] = useState<"pt" | "en">(
    perfil.biografia_pt ? "pt" : perfil.biografia_en ? "en" : "pt"
  );

  // Lightbox da galeria
  const [activePhoto, setActivePhoto] = useState<TemplateFoto | null>(null);

  // Filtro de tipo de mídia (todos, spotify, soundcloud, youtube)
  const [mediaFilter, setMediaFilter] = useState<"all" | "spotify" | "soundcloud" | "youtube">("all");

  const bioText = lang === "pt" ? perfil.biografia_pt : perfil.biografia_en;
  const hasBothLanguages = Boolean(perfil.biografia_pt && perfil.biografia_en);

  // Filtragem e ordenação de mídias
  const filteredMidias = midias
    .filter((m) => (mediaFilter === "all" ? true : m.tipo === mediaFilter))
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  // Ordenação de fotos
  const sortedFotos = [...fotos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  // Ordenação de shows (cronológica)
  const sortedShows = [...shows].sort((a, b) => {
    return new Date(a.data).getTime() - new Date(b.data).getTime();
  });

  // Link do WhatsApp
  const waDigits = perfil.whatsapp ? getCleanWhatsAppDigits(perfil.whatsapp) : "";
  const waUrl = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Olá ${perfil.nome_artistico}! Gostaria de solicitar disponibilidade e cotação para apresentação.`
      )}`
    : null;

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        const monthShort = date
          .toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { month: "short" })
          .toUpperCase()
          .replace(".", "");
        const dayFormatted = String(day).padStart(2, "0");
        const weekday = date.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
          weekday: "short",
        });
        return { dayFormatted, monthShort, year, weekday };
      }
    } catch {
      // fallback
    }
    return { dayFormatted: "--", monthShort: "---", year: "", weekday: "" };
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-zinc-100 selection:bg-fuchsia-500 selection:text-white">
      {/* Background Festival Lights / Aurora Laser Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[42rem] w-[42rem] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-600/20 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[38rem] w-[38rem] rounded-full bg-gradient-to-bl from-cyan-500/20 via-blue-600/15 to-transparent blur-[150px]" />
        <div className="absolute -bottom-32 left-1/4 h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-pink-600/20 via-purple-700/20 to-cyan-500/10 blur-[160px]" />
        
        {/* Subtle Strobe Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ec4899 1px, transparent 1px), linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* TOP STATUS BAR */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-fuchsia-500 shadow-[0_0_12px_#d946ef] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              {"FESTIVAL EPK // LIVE ON STAGE"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-purple-300">
              <Flame className="h-3.5 w-3.5 text-pink-400" />
              EDM • FESTIVAL • OPEN FORMAT
            </span>
            <a
              href="#booking"
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-1.5 font-bold text-black shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-105 hover:shadow-cyan-500/30"
            >
              BOOKING ABERTO
            </a>
          </div>
        </header>

        {/* 1. HERO FESTIVAL CARD */}
        <section className="relative mb-20 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-zinc-950/70 to-[#0c0617]/90 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
          {/* Subtle Ambient Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400" />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Foto de Perfil com Borda Neon Festival */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative group">
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-400 opacity-75 blur-md transition duration-500 group-hover:opacity-100 group-hover:blur-lg" />
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 overflow-hidden rounded-2xl border-2 border-white/10 bg-zinc-950 shadow-2xl">
                  {perfil.foto_url ? (
                    <Image
                      src={perfil.foto_url}
                      alt={perfil.nome_artistico}
                      fill
                      priority
                      unoptimized
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 256px, 320px"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 text-purple-400">
                      <Disc3 className="h-16 w-16 animate-spin-slow text-fuchsia-400" />
                      <span className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-400">
                        SEM FOTO DE PERFIL
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay & Badge */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-semibold">
                    <span className="rounded-md bg-fuchsia-500/80 px-2 py-0.5 text-black">
                      @{perfil.username}
                    </span>
                    <span className="text-cyan-300">MAIN STAGE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="flex flex-col lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-pink-300 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>OFFICIAL ARTIST EPK</span>
              </div>

              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-cyan-300 sm:text-6xl lg:text-7xl drop-shadow-sm">
                {perfil.nome_artistico}
              </h1>

              <p className="mt-4 text-base font-medium leading-relaxed text-purple-200/80 sm:text-lg">
                High-Energy Sets • Main Stage Presence • Festival Anthems
              </p>

              {/* Ações Principais de Alta Energia */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-105 hover:shadow-cyan-400/40 active:scale-95"
                >
                  <Zap className="h-4 w-4" />
                  <span>Contratar Show</span>
                </a>

                {filteredMidias.length > 0 && (
                  <a
                    href="#musica"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-900/30 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-cyan-400/60 hover:bg-purple-800/40 active:scale-95"
                  >
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                    <span>Ouvir Tracks & Sets</span>
                  </a>
                )}

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-400"
                    title="Conversar via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Redes Sociais */}
              <div className="mt-8 flex items-center gap-3 border-t border-purple-500/20 pt-6">
                <span className="font-mono text-xs uppercase tracking-wider text-purple-300/70">
                  SIGA:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {perfil.instagram && (
                    <a
                      href={perfil.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-200 transition hover:border-fuchsia-400 hover:text-fuchsia-300 hover:scale-110"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="h-4 w-4" />
                    </a>
                  )}
                  {perfil.twitter_x && (
                    <a
                      href={perfil.twitter_x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-200 transition hover:border-cyan-400 hover:text-cyan-300 hover:scale-110"
                      aria-label="Twitter / X"
                    >
                      <span className="font-display text-xs font-bold">X</span>
                    </a>
                  )}
                  {perfil.tiktok && (
                    <a
                      href={perfil.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-200 transition hover:border-pink-400 hover:text-pink-300 hover:scale-110"
                      aria-label="TikTok"
                    >
                      <TikTokIcon className="h-4 w-4" />
                    </a>
                  )}
                  {perfil.facebook && (
                    <a
                      href={perfil.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-200 transition hover:border-blue-400 hover:text-blue-300 hover:scale-110"
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="h-4 w-4" />
                    </a>
                  )}
                  {perfil.email_booking && (
                    <a
                      href={`mailto:${perfil.email_booking}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-200 transition hover:border-cyan-400 hover:text-cyan-300 hover:scale-110"
                      aria-label="Email de booking"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SEÇÃO: BIOGRAFIA */}
        {(perfil.biografia_pt || perfil.biografia_en) && (
          <section id="bio" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  {"// 01"}
                </span>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  Biografia & Release
                </h2>
              </div>

              {hasBothLanguages && (
                <div className="inline-flex rounded-xl border border-purple-500/30 bg-purple-950/60 p-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setLang("pt")}
                    className={`rounded-lg px-3 py-1 font-bold transition ${
                      lang === "pt"
                        ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/30"
                        : "text-purple-300 hover:text-white"
                    }`}
                  >
                    PT
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`rounded-lg px-3 py-1 font-bold transition ${
                      lang === "en"
                        ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/30"
                        : "text-purple-300 hover:text-white"
                    }`}
                  >
                    EN
                  </button>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-purple-950/20 p-6 sm:p-8 backdrop-blur-md">
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line text-base font-normal leading-relaxed text-purple-100/90 sm:text-lg">
                  {bioText || "Biografia não informada."}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-purple-500/20 pt-4 text-xs font-mono text-purple-300/70">
                <span>IDIOMA SELECIONADO: {lang.toUpperCase()}</span>
                <span className="text-cyan-400 font-semibold">STAGE READY</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. SEÇÃO: MÚSICA & RELEASES */}
        {midias.length > 0 && (
          <section id="musica" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  {"// 02"}
                </span>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  Música & Live Sets
                </h2>
              </div>

              {/* Filtro de Mídia */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {(["all", "spotify", "soundcloud", "youtube"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setMediaFilter(filter)}
                    className={`rounded-lg px-3 py-1 font-bold transition ${
                      mediaFilter === filter
                        ? "border border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-md shadow-cyan-500/20"
                        : "border border-purple-500/20 bg-purple-950/30 text-purple-300 hover:border-purple-400 hover:text-white"
                    }`}
                  >
                    {filter === "all" ? "TODOS" : filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredMidias.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-950/30 to-black/40 p-4 transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderBadge tipo={item.tipo} />
                      <span className="font-mono text-[11px] font-semibold text-purple-200 truncate max-w-[200px]">
                        {item.titulo || "Faixa / Release"}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 transition hover:text-cyan-300"
                      title="Abrir link original"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="w-full">
                    <MediaEmbed tipo={item.tipo} url={item.url} titulo={item.titulo} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. SEÇÃO: GALERIA DE FOTOS */}
        {sortedFotos.length > 0 && (
          <section id="galeria" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  {"// 03"}
                </span>
                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                  Galeria & Shows
                </h2>
              </div>
              <span className="font-mono text-xs text-purple-300/80">
                {sortedFotos.length} {sortedFotos.length === 1 ? "REGISTRO" : "REGISTROS"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {sortedFotos.map((foto, idx) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setActivePhoto(foto)}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-purple-500/25 bg-zinc-950 transition-all duration-300 hover:border-pink-500/60 hover:scale-[1.02] hover:shadow-xl hover:shadow-fuchsia-500/20"
                >
                  <Image
                    src={foto.url}
                    alt={foto.alt_text || `Foto de ${perfil.nome_artistico} ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100 flex items-end p-3">
                    <span className="font-mono text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-pink-400" />
                      Ampliar
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Modal Lightbox */}
            {activePhoto && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                onClick={() => setActivePhoto(null)}
              >
                <div
                  className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-purple-500/40 bg-zinc-950 p-2 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="absolute top-4 right-4 z-10 rounded-full bg-black/80 p-2 text-zinc-300 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="relative h-[70vh] w-[85vw] max-w-4xl">
                    <Image
                      src={activePhoto.url}
                      alt={activePhoto.alt_text || "Foto ampliada"}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  {activePhoto.alt_text && (
                    <p className="p-3 text-center font-mono text-xs text-purple-200">
                      {activePhoto.alt_text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. SEÇÃO: TOUR DATES / AGENDA */}
        <section id="agenda" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                {"// 04"}
              </span>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                Tour & Festival Line-up
              </h2>
            </div>
            <span className="font-mono text-xs text-purple-300/80">CONFIRMED DATES</span>
          </div>

          {sortedShows.length > 0 ? (
            <div className="space-y-3">
              {sortedShows.map((show) => {
                const { dayFormatted, monthShort, weekday } = formatDate(show.data);
                return (
                  <div
                    key={show.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/25 via-zinc-950/40 to-transparent p-5 transition-all hover:border-fuchsia-500/50 hover:bg-purple-950/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Ticket / Date Badge */}
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-pink-500/40 bg-gradient-to-b from-fuchsia-950 to-black font-mono text-center shadow-md shadow-fuchsia-500/10">
                        <span className="text-[10px] font-bold uppercase text-cyan-300">
                          {monthShort}
                        </span>
                        <span className="font-display text-xl font-black text-white">
                          {dayFormatted}
                        </span>
                        <span className="text-[9px] uppercase text-purple-400">{weekday}</span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-black text-white group-hover:text-pink-300 transition">
                          {show.nome_evento}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-purple-200/80">
                          {show.local && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-pink-400" />
                              {show.local}
                            </span>
                          )}
                          {show.cidade && (
                            <span className="rounded-md bg-purple-900/60 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
                              {show.cidade}
                            </span>
                          )}
                          {show.horario && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
                              <Clock className="h-3 w-3" />
                              {show.horario}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <a
                        href="#booking"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-pink-950/20 px-4 py-2 text-xs font-bold text-pink-200 transition hover:border-pink-400 hover:bg-pink-500/20 hover:text-white"
                      >
                        <span>Line-up / Info</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-purple-400 mb-2" />
              <p className="font-display text-base font-bold text-purple-200">
                Novas datas de festival e turnê serão divulgadas em breve.
              </p>
              <p className="mt-1 font-mono text-xs text-purple-300/70">
                Para propostas e datas exclusivas, entre em contato abaixo.
              </p>
            </div>
          )}
        </section>

        {/* 6. SEÇÃO: BOOKING & CONTATO */}
        <section id="booking" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                {"// 05"}
              </span>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                Booking & Contratações
              </h2>
            </div>
            <span className="font-mono text-xs text-purple-300/80">DIRECT INQUIRIES</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* WhatsApp Direto */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/25 to-black/40 p-6 transition-all hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 group-hover:scale-110 transition">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-300 flex items-center gap-1">
                      DISPONIBILIDADE IMEDIATA <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-black text-white group-hover:text-emerald-300 transition">
                    WhatsApp Booking
                  </h3>
                  <p className="mt-2 text-sm text-purple-100/80 leading-relaxed">
                    Canal direto para orçamentos rápidos, checagem de agenda e propostas de festivais e eventos.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                  <span>{perfil.whatsapp}</span>
                  <span>→</span>
                </div>
              </a>
            )}

            {/* Email de Booking */}
            {perfil.email_booking && (
              <a
                href={`mailto:${perfil.email_booking}`}
                className="group flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-black/40 p-6 transition-all hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 group-hover:scale-110 transition">
                      <Mail className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1">
                      PROPOSTAS FORMAIS <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-black text-white group-hover:text-cyan-300 transition">
                    E-mail Comercial
                  </h3>
                  <p className="mt-2 text-sm text-purple-100/80 leading-relaxed">
                    Envio de briefing, contratos, emissão de notas e logística de turnê e hospedagem.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                  <span className="truncate">{perfil.email_booking}</span>
                  <span>→</span>
                </div>
              </a>
            )}
          </div>

          {/* Fallback se nenhum canal estiver configurado */}
          {!waUrl && !perfil.email_booking && (
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-8 text-center">
              <p className="font-display text-base font-bold text-purple-200">
                Informações de contato e booking serão atualizadas em breve.
              </p>
            </div>
          )}

          {/* Festival Stage Technical Rider Info */}
          <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 font-mono text-xs text-purple-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-pink-300 font-bold block mb-0.5">{"// FESTIVAL & STAGE TECHNICAL RIDER"}</span>
              <p>Setup recomendado: 3–4x Pioneer CDJ-3000 + DJM-A9 / V10 + Retorno cabine estéreo de 130dB SPL.</p>
            </div>
            <span className="shrink-0 rounded-lg border border-purple-500/40 bg-purple-900/40 px-3 py-1 text-[11px] font-bold text-cyan-300">
              RIDER COMPLETO SOB DEMANDA
            </span>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="mt-20 border-t border-purple-500/20 pt-8 pb-12 text-center">
          <p className="font-mono text-xs text-purple-300/70">
            © {new Date().getFullYear()} {perfil.nome_artistico}. Todos os direitos reservados.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-purple-400">
            <span>Powered by</span>
            <Link
              href="/"
              className="text-pink-400 hover:text-cyan-300 transition font-display font-black tracking-tight"
            >
              press<span className="text-cyan-400">link</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
