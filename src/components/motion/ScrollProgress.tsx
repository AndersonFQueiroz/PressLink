"use client";

import { useEffect, useState } from "react";

interface ScrollProgressProps {
  /** Cor da barra (classe Tailwind, ex.: "bg-lime-300"). */
  className?: string;
}

/** Linha fina no topo indicando o progresso da leitura. */
export function ScrollProgress({ className = "bg-white" }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] bg-transparent">
      <div
        className={`h-full origin-left ${className}`}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
