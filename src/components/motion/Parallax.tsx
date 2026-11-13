"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: ReactNode;
  /** Quanto o conteúdo desliza, em % da altura do elemento. Negativo sobe. */
  speed?: number;
  /** Escala inicial (útil para imagens que nunca devem mostrar borda). */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Parallax leve com requestAnimationFrame e apenas `transform`.
 * Desligado em `prefers-reduced-motion`.
 */
export function Parallax({ children, speed = 8, scale = 1, className, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    let visible = true;

    const paint = () => {
      const node = ref.current;
      if (!node || !visible) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 (abaixo da viewport) → 1 (acima da viewport)
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      node.style.transform = `translate3d(0, ${(-progress * speed).toFixed(2)}%, 0) scale(${scale})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });

    observer.observe(el);
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, scale]);

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={style}
    >
      {children}
    </div>
  );
}
