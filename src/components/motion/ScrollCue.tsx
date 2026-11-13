"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CueTone = "dark" | "festival" | "light";

interface ScrollCueProps {
  href: string;
  label: string;
  tone?: CueTone;
}

const TONE_CLASSES: Record<
  CueTone,
  { label: string; ring: string; button: string }
> = {
  dark: {
    label: "text-white/45",
    ring: "border-acid/25",
    button: "border-acid/45 bg-black/40 text-acid",
  },
  festival: {
    label: "text-[#fff6e9]/60",
    ring: "border-[#ff3d8b]/50",
    button: "border-[#fff6e9]/45 bg-[#0b0614]/55 text-[#d8ff4a]",
  },
  light: {
    label: "text-[#1a1712]/50",
    ring: "border-[#b8472b]/25",
    button: "border-[#1a1712]/25 bg-[#f4efe6]/85 text-[#b8472b]",
  },
};

/**
 * Indicador fixo no rodapé da primeira tela: mostra que existe conteúdo
 * abaixo e leva para a primeira seção. Some assim que a pessoa rola.
 */
export function ScrollCue({ href, label, tone = "dark" }: ScrollCueProps) {
  const [hidden, setHidden] = useState(false);
  const classes = TONE_CLASSES[tone];

  useEffect(() => {
    let frame = 0;
    const update = () => setHidden(window.scrollY > 80);
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-500 sm:bottom-6",
        hidden && "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <span
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.26em] transition group-hover:opacity-100",
          classes.label,
        )}
      >
        {label}
      </span>
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full border motion-safe:animate-ping-slow",
            classes.ring,
          )}
        />
        <span
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm",
            classes.button,
          )}
        >
          <ArrowDown className="h-4 w-4 motion-safe:animate-scroll-cue" />
        </span>
      </span>
    </Link>
  );
}
