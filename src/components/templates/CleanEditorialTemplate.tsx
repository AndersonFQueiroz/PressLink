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
  Volume2,
  X,
  Disc3,
  Image as ImageIcon,
  Compass,
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
      strokeWidth="1.75"
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
      strokeWidth="1.75"
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
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function CleanEditorialTemplate({ data }: TemplateComponentProps) {
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
        `Olá ${perfil.nome_artistico}, gostaria de verificar disponibilidade e valores para apresentação em evento.`
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
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 selection:bg-stone-900 selection:text-stone-100 font-sans">
      {/* Delicado fundo editorial monocromático */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-stone-200/40 blur-[130px]" />
        <div className="absolute top-1/2 -left-32 h-[36rem] w-[36rem] rounded-full bg-amber-100/30 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
        {/* TOP EDITORIAL BAR */}
        <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-stone-500 font-medium">
              PRESS KIT EDITORIAL
            </span>
            <span className="h-1 w-1 rounded-full bg-stone-400" />
            <span className="font-mono text-xs text-stone-400">VOL. III</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="hidden sm:inline-block text-stone-500 uppercase tracking-widest">
              WEDDINGS • LOUNGES • PRIVATE EVENTS
            </span>
            <a
              href="#booking"
              className="rounded-full border border-stone-900 bg-stone-900 px-4 py-1.5 text-xs font-medium text-stone-50 transition-all hover:bg-stone-800"
            >
              SOLICITAR DISPONIBILIDADE
            </a>
          </div>
        </header>

        {/* 1. HERO SECTION EDITORIAL */}
        <section className="mb-20 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Foto de Perfil / Moldura Lookbook */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative group">
                <div className="relative h-72 w-64 sm:h-96 sm:w-72 overflow-hidden rounded-2xl bg-stone-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.08)] border border-stone-200">
                  {perfil.foto_url ? (
                    <Image
                      src={perfil.foto_url}
                      alt={perfil.nome_artistico}
                      fill
                      priority
                      unoptimized
                      className="object-cover transition duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 256px, 288px"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-stone-100 text-stone-400">
                      <Disc3 className="h-14 w-14 text-stone-400 stroke-[1.25]" />
                      <span className="mt-3 font-mono text-[11px] uppercase tracking-widest text-stone-500">
                        SEM FOTO DE PERFIL
                      </span>
                    </div>
                  )}

                  {/* Sutil gradiente de leitura */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-stone-100">
                    <span className="font-medium tracking-wide">@{perfil.username}</span>
                    <span className="text-stone-300">PORTFOLIO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Principais & Tipografia Serifada */}
            <div className="flex flex-col lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                <Compass className="h-3.5 w-3.5 text-stone-600" />
                <span>ARTIST DOSSIER</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-stone-900">
                {perfil.nome_artistico}
              </h1>

              <p className="mt-4 text-base sm:text-lg font-light leading-relaxed text-stone-600">
                Lounge & House Fino • Casamentos & Destinos • Atmosferas Corporativas Sofisticadas
              </p>

              {/* Ações Elegantes */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-medium text-stone-50 shadow-md shadow-stone-900/10 transition-all hover:bg-stone-800 active:scale-95"
                >
                  <Calendar className="h-4 w-4 stroke-[1.75]" />
                  <span>Proposta & Booking</span>
                </a>

                {filteredMidias.length > 0 && (
                  <a
                    href="#musica"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-6 py-3.5 text-sm font-medium text-stone-800 transition-all hover:border-stone-400 hover:bg-white active:scale-95"
                  >
                    <Volume2 className="h-4 w-4 text-stone-600 stroke-[1.75]" />
                    <span>Ouvir Repertório</span>
                  </a>
                )}

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium text-stone-800 transition hover:border-stone-400 hover:bg-stone-50"
                    title="Conversar via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 text-stone-600 stroke-[1.75]" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Redes Sociais com Estilo Minimalista */}
              <div className="mt-8 flex items-center gap-3 border-t border-stone-200 pt-6">
                <span className="font-mono text-xs uppercase tracking-wider text-stone-400 font-medium">
                  CONNECT:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {perfil.instagram && (
                    <a
                      href={perfil.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-stone-400 hover:text-stone-900 hover:bg-white"
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-stone-400 hover:text-stone-900 hover:bg-white"
                      aria-label="Twitter / X"
                    >
                      <span className="font-serif text-xs font-semibold">X</span>
                    </a>
                  )}
                  {perfil.tiktok && (
                    <a
                      href={perfil.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-stone-400 hover:text-stone-900 hover:bg-white"
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
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-stone-400 hover:text-stone-900 hover:bg-white"
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="h-4 w-4" />
                    </a>
                  )}
                  {perfil.email_booking && (
                    <a
                      href={`mailto:${perfil.email_booking}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:border-stone-400 hover:text-stone-900 hover:bg-white"
                      aria-label="Email de booking"
                    >
                      <Mail className="h-4 w-4 stroke-[1.75]" />
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                  {"// 01"}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Biografia & Trajetória
                </h2>
              </div>

              {hasBothLanguages && (
                <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setLang("pt")}
                    className={`rounded-lg px-3 py-1 font-medium transition ${
                      lang === "pt"
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    PT
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    className={`rounded-lg px-3 py-1 font-medium transition ${
                      lang === "en"
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    EN
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
              <div className="prose prose-stone max-w-none">
                <p className="whitespace-pre-line text-base sm:text-lg font-light leading-relaxed text-stone-700">
                  {bioText || "Biografia não informada."}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-mono text-stone-400">
                <span>IDIOMA: {lang.toUpperCase()}</span>
                <span>CURADORIA MUSICAL EXCLUSIVA</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. SEÇÃO: MÚSICA & MIXES */}
        {midias.length > 0 && (
          <section id="musica" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                  {"// 02"}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Curadoria & Sets
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
                        ? "border border-stone-900 bg-stone-900 text-stone-50"
                        : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
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
                  className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-stone-400/80 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderBadge tipo={item.tipo} />
                      <span className="font-mono text-[11px] text-stone-600 truncate max-w-[200px]">
                        {item.titulo || "Faixa / Set"}
                      </span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 transition hover:text-stone-900"
                      title="Abrir link original"
                    >
                      <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
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

        {/* 4. SEÇÃO: GALERIA EDITORIAL */}
        {sortedFotos.length > 0 && (
          <section id="galeria" className="mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                  {"// 03"}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Galeria & Ambientações
                </h2>
              </div>
              <span className="font-mono text-xs text-stone-400">
                {sortedFotos.length} {sortedFotos.length === 1 ? "IMAGEM" : "IMAGENS"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {sortedFotos.map((foto, idx) => (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => setActivePhoto(foto)}
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-stone-200 bg-stone-100 transition-all duration-300 hover:border-stone-400 hover:shadow-lg"
                >
                  <Image
                    src={foto.url}
                    alt={foto.alt_text || `Registro de ${perfil.nome_artistico} ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 transition duration-300 group-hover:opacity-100 flex items-end p-3">
                    <span className="font-mono text-[11px] text-stone-100 flex items-center gap-1.5">
                      <ImageIcon className="h-3 w-3 text-stone-200 stroke-[1.75]" />
                      Expandir
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Lightbox Modal */}
            {activePhoto && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm"
                onClick={() => setActivePhoto(null)}
              >
                <div
                  className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="absolute top-4 right-4 z-10 rounded-full bg-stone-900/80 p-2 text-stone-200 hover:text-white"
                  >
                    <X className="h-5 w-5 stroke-[1.75]" />
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
                    <p className="p-3 text-center font-serif text-xs text-stone-600">
                      {activePhoto.alt_text}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. SEÇÃO: CALENDÁRIO & EVENTOS */}
        <section id="agenda" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                {"// 04"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                Calendário & Apresentações
              </h2>
            </div>
            <span className="font-mono text-xs text-stone-400">UPCOMING DATES</span>
          </div>

          {sortedShows.length > 0 ? (
            <div className="space-y-3">
              {sortedShows.map((show) => {
                const { dayFormatted, monthShort, weekday } = formatDate(show.data);
                return (
                  <div
                    key={show.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 transition-all hover:border-stone-400/80 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      {/* Data em Bloco Editorial */}
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-center">
                        <span className="font-mono text-[10px] font-semibold uppercase text-stone-500">
                          {monthShort}
                        </span>
                        <span className="font-serif text-2xl text-stone-900 font-medium">
                          {dayFormatted}
                        </span>
                        <span className="font-mono text-[9px] uppercase text-stone-400">{weekday}</span>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg text-stone-900 group-hover:text-stone-700 transition">
                          {show.nome_evento}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                          {show.local && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-stone-400 stroke-[1.75]" />
                              {show.local}
                            </span>
                          )}
                          {show.cidade && (
                            <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-600">
                              {show.cidade}
                            </span>
                          )}
                          {show.horario && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-stone-400">
                              <Clock className="h-3 w-3 stroke-[1.75]" />
                              {show.horario}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <a
                        href="#booking"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                      >
                        <span>Informações</span>
                        <ExternalLink className="h-3 w-3 stroke-[1.75]" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-stone-400 mb-2 stroke-[1.5]" />
              <p className="font-serif text-base text-stone-700">
                Novas datas de apresentações e eventos sociais em breve.
              </p>
              <p className="mt-1 font-mono text-xs text-stone-400">
                Para reservas e consultas de datas privadas, solicite abaixo.
              </p>
            </div>
          )}
        </section>

        {/* 6. SEÇÃO: CONTATO & CONTRATAÇÃO */}
        <section id="booking" className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                {"// 05"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                Reservas & Contato
              </h2>
            </div>
            <span className="font-mono text-xs text-stone-400">DIRECT INQUIRIES</span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* WhatsApp */}
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-stone-400 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-800 group-hover:scale-105 transition">
                      <MessageCircle className="h-6 w-6 stroke-[1.75]" />
                    </div>
                    <span className="font-mono text-xs font-medium text-stone-500 flex items-center gap-1">
                      ATENDIMENTO DIRETO <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl text-stone-900 group-hover:text-stone-700 transition">
                    WhatsApp Comercial
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed font-light">
                    Canal ágil para checagem de agenda, alinhamento de estilo e orçamentos para eventos sociais e corporativos.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs text-stone-700 font-medium">
                  <span>{perfil.whatsapp}</span>
                  <span>→</span>
                </div>
              </a>
            )}

            {/* E-mail de Booking */}
            {perfil.email_booking && (
              <a
                href={`mailto:${perfil.email_booking}`}
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all hover:border-stone-400 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-800 group-hover:scale-105 transition">
                      <Mail className="h-6 w-6 stroke-[1.75]" />
                    </div>
                    <span className="font-mono text-xs font-medium text-stone-500 flex items-center gap-1">
                      PROPOSTAS FORMAIS <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl text-stone-900 group-hover:text-stone-700 transition">
                    E-mail de Booking
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed font-light">
                    Envio de cronogramas, contratos, faturamento de empresas e detalhes de hospitalidade/rider.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 font-mono text-xs text-stone-700 font-medium">
                  <span className="truncate">{perfil.email_booking}</span>
                  <span>→</span>
                </div>
              </a>
            )}
          </div>

          {!waUrl && !perfil.email_booking && (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <p className="font-serif text-base text-stone-700">
                Canais de contato direto em atualização.
              </p>
            </div>
          )}

          {/* Technical Hospitality Note */}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 font-mono text-xs text-stone-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-stone-800 font-semibold block mb-0.5">
                {"// SOUND & BOOTH SPECIFICATIONS"}
              </span>
              <p>Setup padrão: Pioneer All-in-One ou CDJ-3000 com sistema de som de alta fidelidade e discrição visual.</p>
            </div>
            <span className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] text-stone-600 font-medium">
              RIDER SOB CONSULTA
            </span>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="mt-20 border-t border-stone-200 pt-8 pb-12 text-center">
          <p className="font-mono text-xs text-stone-500">
            © {new Date().getFullYear()} {perfil.nome_artistico}. Todos os direitos reservados.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-stone-400">
            <span>Desenvolvido com</span>
            <Link
              href="/"
              className="text-stone-700 hover:text-stone-950 transition font-sans font-semibold tracking-tight"
            >
              press<span className="text-stone-900 font-bold">link</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
