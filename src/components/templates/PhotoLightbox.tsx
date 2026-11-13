"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TemplateFoto } from "@/types/template";
import { cn } from "@/lib/utils";

interface PhotoLightboxProps {
  photos: TemplateFoto[];
  startIndex: number;
  onClose: () => void;
  variant?: "dark" | "light";
}

/** Lightbox com teclado (← → Esc), swipe e foco gerenciado. */
export function PhotoLightbox({ photos, startIndex, onClose, variant = "dark" }: PhotoLightboxProps) {
  const [index, setIndex] = useState(() => Math.max(0, Math.min(startIndex, photos.length - 1)));
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const total = photos.length;
  const photo = photos[index];

  const go = useCallback(
    (direction: number) => {
      if (total === 0) return;
      setIndex((current) => (current + direction + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [go, onClose]);

  if (!photo) return null;

  const dark = variant === "dark";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${total}`}
      className={cn(
        "fixed inset-0 z-[120] flex flex-col backdrop-blur-xl",
        dark ? "bg-black/90 text-white" : "bg-[#171410]/95 text-[#f8f3e8]",
      )}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] opacity-60">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar galeria"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border transition",
            dark
              ? "border-white/15 hover:border-white/40 hover:bg-white/10"
              : "border-black/15 hover:border-black/40 hover:bg-black/5",
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16">
        {total > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className={cn(
              "absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border transition sm:left-6",
              dark
                ? "border-white/15 bg-black/30 hover:bg-black/60"
                : "border-black/15 bg-[#f4efe6]/80 text-[#1a1712] hover:bg-[#f4efe6]",
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="relative h-full w-full max-w-6xl">
          <Image
            key={photo.id}
            src={photo.url}
            alt={photo.alt_text || "Foto do artista"}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próxima foto"
            className={cn(
              "absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border transition sm:right-6",
              dark
                ? "border-white/15 bg-black/30 hover:bg-black/60"
                : "border-black/15 bg-[#f4efe6]/80 text-[#1a1712] hover:bg-[#f4efe6]",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <p className="max-w-xl text-sm opacity-70">{photo.alt_text || ""}</p>
        {total > 1 && (
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {photos.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ir para foto ${itemIndex + 1}`}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  itemIndex === index ? "w-8 bg-current" : "w-1.5 bg-current/30 hover:bg-current/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
