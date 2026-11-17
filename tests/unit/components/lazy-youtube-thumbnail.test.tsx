// tests/unit/components/lazy-youtube-thumbnail.test.tsx — issue #23
// O placeholder do YouTube precisa exibir a THUMBNAIL real do vídeo
// (i.ytimg.com/vi/<id>/hqdefault.jpg) ANTES do clique/scroll — o player
// segue 100% lazy (sem iframe antes de entrar na viewport).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

import React from "react";

import { LazyMediaEmbed } from "@/components/features/painel/LazyMediaEmbed";

/** Mock controlado do IntersectionObserver (mesmo padrão do teste do hook) */
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

  fire(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting, target: document.body } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: MockIntersectionObserver,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LazyMediaEmbed — thumbnail do YouTube (issue #23)", () => {
  it("youtube watch: placeholder exibe a thumbnail hqdefault SEM montar iframe", () => {
    const { container } = render(
      <LazyMediaEmbed tipo="youtube" url="https://www.youtube.com/watch?v=kYv9rE8lQ_U" />,
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe(
      "https://i.ytimg.com/vi/kYv9rE8lQ_U/hqdefault.jpg",
    );
    // Player continua lazy: nenhum iframe antes da viewport
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("link curto youtu.be: também exibe a thumbnail correta", () => {
    const { container } = render(
      <LazyMediaEmbed tipo="youtube" url="https://youtu.be/kYv9rE8lQ_U" />,
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe(
      "https://i.ytimg.com/vi/kYv9rE8lQ_U/hqdefault.jpg",
    );
  });

  it("ao entrar na viewport, o player real monta e o placeholder some", () => {
    const { container } = render(
      <LazyMediaEmbed tipo="youtube" url="https://www.youtube.com/watch?v=kYv9rE8lQ_U" />,
    );

    expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0);
    act(() => {
      MockIntersectionObserver.instances[0].fire(true);
    });

    expect(container.querySelector("iframe")).not.toBeNull();
    expect(container.querySelector("img[src*='i.ytimg.com']")).toBeNull();
  });

  it("spotify: placeholder continua SEM imagem (apenas ícone + pulse)", () => {
    const { container } = render(
      <LazyMediaEmbed tipo="spotify" url="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });
});
