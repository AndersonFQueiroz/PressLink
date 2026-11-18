// tests/unit/hooks/use-intersection-observer.test.tsx — issue #49
// Teste unitário do hook de IntersectionObserver usado pelo LazyMediaEmbed.
// jsdom não implementa IntersectionObserver, então usamos um mock controlado.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import React from "react";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

/** Mock controlado do IntersectionObserver: permite disparar entrada/saída sob demanda */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly callback: IntersectionObserverCallback;
  readonly options: IntersectionObserverInit | undefined;
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }

  /** Dispara o callback como se o elemento tivesse entrado/saído da viewport */
  fire(isIntersecting: boolean): void {
    this.callback(
      [
        {
          isIntersecting,
          target: document.body,
        } as unknown as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

function renderProbe(rootMargin?: string) {
  function Probe() {
    const { ref, inView } =
      useIntersectionObserver<HTMLDivElement>({ rootMargin });
    return <div ref={ref}>{inView ? "visivel" : "fora"}</div>;
  }
  return render(<Probe />);
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  // Substitui o global lido pelo hook (jsdom não tem implementação nativa)
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: MockIntersectionObserver,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIntersectionObserver", () => {
  it("começa fora da viewport e observa com o rootMargin pedido", () => {
    renderProbe("200px 0px");
    expect(screen.getByText("fora")).toBeInTheDocument();
    expect(MockIntersectionObserver.instances).toHaveLength(1);
    expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledTimes(1);
    expect(MockIntersectionObserver.instances[0].options).toEqual({
      root: null,
      rootMargin: "200px 0px",
      threshold: 0,
    });
  });

  it("torna-se visível na interseção e permanece montado (once)", () => {
    renderProbe("200px 0px");
    const io = MockIntersectionObserver.instances[0];

    act(() => io.fire(true));
    expect(screen.getByText("visivel")).toBeInTheDocument();

    // Com "once" (padrão), sair da viewport não desmonta de volta
    act(() => io.fire(false));
    expect(screen.getByText("visivel")).toBeInTheDocument();
  });

  it("acompanha entrada/saída quando once=false", () => {
    function Probe() {
      const { ref, inView } = useIntersectionObserver<HTMLDivElement>({
        once: false,
      });
      return <div ref={ref}>{inView ? "visivel" : "fora"}</div>;
    }
    render(<Probe />);

    act(() => MockIntersectionObserver.instances[0].fire(true));
    expect(screen.getByText("visivel")).toBeInTheDocument();

    // Efeito reexecuta (inView mudou): novo observador assume, antigo desconecta
    const second =
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
    expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();

    act(() => second.fire(false));
    expect(screen.getByText("fora")).toBeInTheDocument();
  });

  it("sem suporte nativo, renderiza imediatamente (fallback SSR)", () => {
    delete (globalThis as Record<string, unknown>).IntersectionObserver;
    renderProbe("200px 0px");
    expect(screen.getByText("visivel")).toBeInTheDocument();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("enabled=false não cria observador nenhum", () => {
    function Probe() {
      const { ref, inView } = useIntersectionObserver<HTMLDivElement>({
        enabled: false,
      });
      return <div ref={ref}>{inView ? "visivel" : "fora"}</div>;
    }
    render(<Probe />);
    expect(screen.getByText("fora")).toBeInTheDocument();
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("desconecta o observador no unmount", () => {
    const utils = renderProbe("200px 0px");
    const io = MockIntersectionObserver.instances[0];
    utils.unmount();
    expect(io.disconnect).toHaveBeenCalled();
  });
});
