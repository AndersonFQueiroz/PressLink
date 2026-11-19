"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Número que conta até o valor final.
 *
 * O HTML sai com o número definitivo (bom para leitura e acessibilidade) e a
 * animação começa na hidratação — 0 → valor na primeira montagem, valor antigo
 * → novo quando o dado muda (troca de período, por exemplo).
 *
 * A API é só de dados serializáveis (`casas`, `sufixo`) de propósito: o
 * componente é usado dentro de Server Components, e função de formatação não
 * atravessa a fronteira server → client.
 *
 * Só re-renderiza enquanto a contagem roda; com `prefers-reduced-motion` o
 * valor final aparece direto.
 */
export function CountUp({
  value,
  casas = 0,
  sufixo = "",
  duracao = 900,
  className,
}: {
  value: number;
  /** Casas decimais fixas no resultado (padrão 0). */
  casas?: number;
  /** Texto colado no fim, ex.: "%". */
  sufixo?: string;
  duracao?: number;
  className?: string;
}) {
  const [exibido, setExibido] = useState(value);
  const montou = useRef(false);
  const anterior = useRef(value);
  const frame = useRef<number | null>(null);
  const reduzir = useRef(false);

  useEffect(() => {
    reduzir.current =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const alvo = value;
    const de = montou.current ? anterior.current : 0;
    montou.current = true;
    anterior.current = value;

    if (de === alvo || reduzir.current) {
      setExibido(alvo);
      return;
    }

    let primeiroFrame: number | null = null;
    const passo = (agora: number) => {
      // Usa o timestamp do primeiro frame como origem: em alguns ambientes
      // (jsdom, WebViews antigas) `performance.now()` e o timestamp do rAF não
      // compartilham a mesma origem e a conta sairia negativa.
      if (primeiroFrame === null) primeiroFrame = agora;
      const t = Math.min(1, Math.max(0, (agora - primeiroFrame) / duracao));
      setExibido(de + (alvo - de) * easeOutCubic(t));
      if (t < 1) {
        frame.current = requestAnimationFrame(passo);
      } else {
        setExibido(alvo);
      }
    };

    frame.current = requestAnimationFrame(passo);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duracao]);

  const texto = exibido.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {texto}
      {sufixo}
    </span>
  );
}
