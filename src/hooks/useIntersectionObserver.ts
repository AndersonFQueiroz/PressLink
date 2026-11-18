"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  /** Folga em volta da viewport para antecipar o load (ex.: "200px 0px") */
  rootMargin?: string;
  /** Limite de interseção (mesma semântica do IntersectionObserver nativo) */
  threshold?: number | number[];
  /** Para de observar após a 1ª vez que o elemento fica visível (padrão: true) */
  once?: boolean;
  /** Desliga a observação (inView permanece false) — padrão: true */
  enabled?: boolean;
}

/**
 * Hook de IntersectionObserver com fallback para ambientes sem suporte.
 *
 * - SSR / browser sem IntersectionObserver: `inView` vira true na hora,
 *   evitando um placeholder que nunca seria trocado.
 * - `once` (padrão): após a primeira interseção o observador é desconectado —
 *   o conteúdo já montado nunca é desmontado.
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  rootMargin = "0px",
  threshold = 0,
  once = true,
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const nodeRef = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  // Ref callback estável: só guarda o nó para o efeito usar
  const setNodeRef = useCallback((node: T | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    const node = nodeRef.current;

    // Sem nó, observação desligada ou já visível: nada a fazer
    if (!enabled || !node || inView) return undefined;

    // Sem suporte nativo: renderiza imediatamente (fallback seguro)
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            // Sem "once", acompanha entrada/saída da viewport
            setInView(false);
          }
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, inView, rootMargin, threshold, once]);

  return { ref: setNodeRef, inView };
}
