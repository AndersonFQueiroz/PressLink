"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";

export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "blur"
  | "clip";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  /** Atraso em ms para escalonar elementos. */
  delay?: number;
  /** Duração em ms. */
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Revela o conteúdo quando ele entra na viewport.
 * Só anima opacity/transform/filter/clip-path — nada que dispare layout.
 * Com `prefers-reduced-motion`, o conteúdo aparece imediatamente.
 */
export function Reveal({
  children,
  as = "div",
  variant = "up",
  delay = 0,
  duration = 900,
  threshold = 0.15,
  once = true,
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Rede de segurança: se o elemento já está na tela, mostra de imediato.
    // Alguns navegadores (Chrome) não reportam intersecção em elementos com
    // clip-path total, o que deixava blocos como a foto do hero invisíveis.
    const rect = el.getBoundingClientRect();
    if (
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth
    ) {
      setShown(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return createElement(
    as,
    {
      ref: ref as Ref<HTMLElement>,
      "data-reveal": variant,
      className: cn(shown && "is-revealed", className),
      style: {
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        ...style,
      },
    },
    children,
  );
}
