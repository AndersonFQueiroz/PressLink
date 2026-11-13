"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  Volume2,
  X,
  Disc3,
  Image as ImageIcon,
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

export function DarkMinimalTemplate({ data }: TemplateComponentProps) {
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
        `Olá ${perfil.nome_artistico}, gostaria de solicitar informações sobre disponibilidade e cachê para apresentação.`
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
    <div className="min-h-screen bg-[#070709] text-zinc-200 selection:bg-emerald-400 selection:text-black">
      {/* Background Glows Minimalistas (Laser / Acid Green & Deep Shadow) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-600/5 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald-400/[0.04] blur-[150px]" />
        {/* Grid técnico sutil no fundo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #34d399 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* TOP BAR / METADATA HEADER */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
              {"EPK // ELECTRONIC PRESS KIT"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="hidden sm:inline-block">DARK ELECTRONIC / MINIMAL</span>
            <span className="text-zinc-700">{"//"}</span>
            <a
              href="#booking"
              className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1 text-emerald-400 transition hover:bg-emerald-500/20 hover:border-emerald-400"
            >
              DISPONÍVEL PARA BOOKING
            </a>
          </div>
        </header>

        {/* 1. HERO / HEADER DE IMPACTO */}
        <section className="relative mb-20 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-10 lg:p-12 backdrop-blur-md">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Foto de Perfil / Visual do Artista */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-emerald-400/0 blur-lg transition duration-500 group-hover:from-emerald-400/40" />
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950 shadow-2xl">
                  {perfil.foto_url ? (
                    <Image
                      src={perfil.foto_url}
                      alt={perfil.nome_artistico}
                      fill
                      priority
                      unoptimized
                      className="object-cover grayscale contrast-125 transition duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      sizes="(max-width: 640px) 256px, 320px"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 text-zinc-600">
                      <Disc3 className="h-16 w-16 animate-spin-slow text-emerald-500/40" />
                      <span className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
                        SEM FOTO DE PERFIL
                      </span>
                    </div>
                  )}
                  {/* Subtle Scanline Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="text-emerald-400">@{perfil.username}</span>
                    <span className="text-zinc-600">{"// PRESS SHOT"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Principais / Tipografia Display */}
            <div className="flex flex-col lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ARTIST PROFILE</span>
              </div>

              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
                {perfil.nome_artistico}
              </h1>

              <p className="mt-4 text-base font-light leading-relaxed text-zinc-400 sm:text-lg">
                Minimal Techno • Dark Electronic • Industrial Frequencies
              </p>

              {/* Botões de Ação Imediata (Booking & Escutar) */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 active:scale-95"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Solicitar Booking</span>
                </a>

                {filteredMidias.length > 0 && (
                  <a
                    href="#musica"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-6 py-3 text-sm font-medium text-white transition-all hover:border-zinc-500 hover:bg-zinc-800 active:scale-95"
                  >
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    <span>Ouvir Faixas & Sets</span>
                  </a>
                )}

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
                    title="Conversar via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Redes Sociais com Ícones Minimalistas */}
              <div className="mt-8 flex items-center gap-3 border-t border-zinc-800/80 pt-6">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                  CONNECT:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {perfil.instagram && (
                    <a
                      href={perfil.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="h-4 w-4" />
                    </a>
                  )}
                  {perfil.email_booking && (
                    <a
                      href={`mailto:${perfil.email_booking}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-emerald-500/50 hover:text-emerald-400"
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

        {/* 2. SEÇÃO: BIOGRAFIA COM BOTÃO ALTERNADOR PT/EN */}
        {(perfil.biografia_pt || perfil.biografia_en) && (
          <section id="bio" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                  {"// 01"}
                </span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                  Biografia
                </h2>
              </div>

              {/* Botão de Alternância de Idioma (PT / EN) */}
              {hasBothLanguages && (
                <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/80 p-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setLang("pt")}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      lang === "pt"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    PT
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`rounded-lg px-3 py-1 font-semibold transition ${
                      lang === "en"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    EN
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-8 backdrop-blur-sm">
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-line text-base font-normal leading-relaxed text-zinc-300 sm:text-lg">
                  {bioText || "Biografia não informada."}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-800/60 pt-4 text-xs font-mono text-zinc-500">
                <span>IDIOMA: {lang.toUpperCase()}</span>
                <span>ORIGIN // SAO PAULO - BERLIN</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. SEÇÃO: MÍDIA EMBEDS (SPOTIFY, SOUNDCLOUD, YOUTUBE) */}
        {midias.length > 0 && (
          <section id="musica" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                  {"// 02"}
                </span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                  Música & Sets
                </h2>
              </div>

              {/* Filtro por Plataforma */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {(["all", "spotify", "soundcloud", "youtube"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setMediaFilter(filter)}
                    className={`rounded-lg px-3 py-1 font-medium transition ${
                      mediaFilter === filter
                        ? "border border-emerald-500/50 bg-emerald-950/40 text-emerald-400"
                        : "border border-transparent bg-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
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
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/60"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderBadge tipo={item.tipo} />
                      <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
                        {item.titulo || "Faixa / Release"}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 transition hover:text-emerald-400"
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                  {"// 03"}
                </span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                  Galeria & Visual
                </h2>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {sortedFotos.length} {sortedFotos.length === 1 ? "FOTO" : "FOTOS"} REGISTRADAS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {sortedFotos.map((foto, idx) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setActivePhoto(foto)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 transition duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <Image
                    src={foto.url}
                    alt={foto.alt_text || `Foto de ${perfil.nome_artistico} ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover grayscale contrast-125 transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100 flex items-end p-2.5">
                    <span className="font-mono text-[11px] text-zinc-300 flex items-center gap-1.5">
                      <ImageIcon className="h-3 w-3 text-emerald-400" />
                      Visualizar
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Lightbox Modal */}
            {activePhoto && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
                onClick={() => setActivePhoto(null)}
              >
                <div
                  className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 p-2 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="absolute top-4 right-4 z-10 rounded-full bg-black/80 p-2 text-zinc-400 hover:text-white"
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
                    <p className="p-3 text-center font-mono text-xs text-zinc-400">
                      {activePhoto.alt_text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. SEÇÃO: AGENDA DE SHOWS */}
        <section id="agenda" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                {"// 04"}
              </span>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                Tour & Próximas Datas
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-500">DATES & VENUES</span>
          </div>

          {sortedShows.length > 0 ? (
            <div className="space-y-3">
              {sortedShows.map((show) => {
                const { dayFormatted, monthShort, weekday } = formatDate(show.data);
                return (
                  <div
                    key={show.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/60"
                  >
                    {/* Data formatada em bloco minimalista */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-950 font-mono text-center">
                        <span className="text-[10px] font-semibold uppercase text-emerald-400">
                          {monthShort}
                        </span>
                        <span className="font-display text-xl font-black text-white">
                          {dayFormatted}
                        </span>
                        <span className="text-[9px] uppercase text-zinc-500">{weekday}</span>
                      </div>

                      <div>
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-emerald-400 transition">
                          {show.nome_evento}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                          {show.local && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              {show.local}
                            </span>
                          )}
                          {show.cidade && (
                            <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                              {show.cidade}
                            </span>
                          )}
                          {show.horario && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                              <Clock className="h-3 w-3" />
                              {show.horario}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ação para Contato / Ingressos */}
                    <div className="w-full sm:w-auto">
                      <a
                        href="#booking"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/40 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                      >
                        <span>Guest / Info</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p className="font-display text-base font-semibold text-zinc-400">
                Novas datas de turnê em breve.
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                Para disponibilidade e datas exclusivas, consulte via booking abaixo.
              </p>
            </div>
          )}
        </section>

        {/* 6. SEÇÃO: CONTATO & BOOKING DIRETO */}
        <section id="booking" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                {"// 05"}
              </span>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                Booking & Contato
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-500">DIRECT INQUIRIES</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Canal WhatsApp */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all hover:border-emerald-500/50 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 group-hover:scale-105 transition">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                      DISPONÍVEL <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-white group-hover:text-emerald-400 transition">
                    WhatsApp Direto
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Contato direto para consulta rápida de datas, disponibilidade e contratações imediatas.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs text-emerald-400">
                  <span>{perfil.whatsapp}</span>
                  <span>→</span>
                </div>
              </a>
            )}

            {/* Canal E-mail de Booking */}
            {perfil.email_booking && (
              <a
                href={`mailto:${perfil.email_booking}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all hover:border-emerald-500/50 hover:bg-zinc-900/70 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 group-hover:text-emerald-400 group-hover:scale-105 transition">
                      <Mail className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs text-zinc-400 flex items-center gap-1">
                      PROPOSTAS FORMAIS <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-white group-hover:text-emerald-400 transition">
                    E-mail de Booking
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Envio de propostas comerciais, contratos, documentações e riders técnicos.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs text-zinc-300 group-hover:text-emerald-400">
                  <span className="truncate">{perfil.email_booking}</span>
                  <span>→</span>
                </div>
              </a>
            )}
          </div>

          {/* Fallback se nem WhatsApp nem E-mail estiverem configurados */}
          {!waUrl && !perfil.email_booking && (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-8 text-center">
              <p className="font-display text-base font-semibold text-zinc-400">
                Informações de contato direto serão disponibilizadas em breve.
              </p>
            </div>
          )}

          {/* Technical Specs Banner */}
          <div className="mt-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 font-mono text-xs text-zinc-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-zinc-400 font-semibold block mb-0.5">{"// TECHNICAL SPECS & BOOTH REQUIREMENTS"}</span>
              <p>Setup padrão: 2–3x Pioneer CDJ-3000 / DJM-V10 ou Allen & Heath Xone:96 + monitoração estéreo de alta pressão.</p>
            </div>
            <span className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] text-zinc-400">
              RIDER DISPONÍVEL SOB DEMANDA
            </span>
          </div>
        </section>

        {/* 7. FOOTER DA PÁGINA PÚBLICA */}
        <footer className="mt-20 border-t border-zinc-800/80 pt-8 pb-12 text-center">
          <p className="font-mono text-xs text-zinc-500">
            © {new Date().getFullYear()} {perfil.nome_artistico}. Todos os direitos reservados.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-zinc-600">
            <span>Desenvolvido com</span>
            <Link
              href="/"
              className="text-zinc-400 hover:text-emerald-400 transition font-display font-bold tracking-tight"
            >
              press<span className="text-emerald-400">link</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
