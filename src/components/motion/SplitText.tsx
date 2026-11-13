"use client";

import { cn } from "@/lib/utils";

interface SplitTextProps {
  /** Uma entrada por linha. As palavras de cada linha entram em cascata. */
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Atraso inicial em ms. */
  delay?: number;
  /** Intervalo entre palavras em ms. */
  stagger?: number;
}

/**
 * Revela palavras com máscara (translateY dentro de overflow-hidden).
 * Puramente CSS — sem biblioteca, sem medir o DOM.
 */
export function SplitText({
  lines,
  as: Tag = "h1",
  className,
  delay = 120,
  stagger = 70,
}: SplitTextProps) {
  const label = lines.join(" ");
  let wordIndex = 0;

  return (
    <Tag aria-label={label} className={cn("block", className)}>
      {lines.map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className="block overflow-hidden pb-[0.08em]">
          {line.split(" ").map((word, index) => {
            const current = wordIndex++;
            return (
              <span
                key={`${word}-${index}`}
                aria-hidden="true"
                className="inline-block whitespace-pre will-change-transform motion-safe:animate-word-up"
                style={{ animationDelay: `${delay + current * stagger}ms` }}
              >
                {word}
                {index < line.split(" ").length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
