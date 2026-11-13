"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Duração de um ciclo completo, em segundos. */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

/**
 * Faixa infinita em CSS puro. Duas cópias idênticas + translateX(-50%).
 * A cópia duplicada fica `aria-hidden` para leitores de tela.
 */
export function Marquee({
  children,
  speed = 32,
  reverse = false,
  pauseOnHover = true,
  className,
  itemClassName,
}: MarqueeProps) {
  const animation = `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}`;

  return (
    <div className={cn("group flex w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ animation }}
      >
        <div className={cn("flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10", itemClassName)}>
          {children}
        </div>
        <div
          aria-hidden="true"
          className={cn("flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10", itemClassName)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
