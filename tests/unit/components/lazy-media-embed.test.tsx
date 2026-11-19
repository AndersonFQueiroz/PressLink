// tests/unit/components/lazy-media-embed.test.tsx — issue #49
// Teste unitário do LazyMediaEmbed: placeholder com dimensões reservadas
// (zero layout shift), player só monta próximo da viewport e os 3
// providers (Spotify/SoundCloud/YouTube) continuam funcionando via o enum `tipo`.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import React from "react";

import { LazyMediaEmbed } from "@/components/features/painel/LazyMediaEmbed";

const SPOTIFY_TRACK = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
const SPOTIFY_PLAYLIST =
  "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
const YOUTUBE_WATCH = "https://www.youtube.com/watch?v=kYv9rE8lQ_U";
const SOUNDCLOUD_TRACK = "https://soundcloud.com/user/some-track";
const SOUNDCLOUD_SET = "https://soundcloud.com/user/sets/some-set";

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

interface EmbedFixture {
  tipo: "spotify" | "soundcloud" | "youtube";
  url: string;
}

function renderEmbed({ tipo, url }: EmbedFixture) {
  return render(<LazyMediaEmbed tipo={tipo} url={url} />);
}

/**
 * Placeholder é o div[aria-hidden] reservado pelo LazyMediaEmbed.
 * O rótulo em texto saiu na issue #28 (era item de contraste dentro de um bloco
 * `aria-hidden`), então o seletor usa o `data-testid` do contêiner.
 */
function getPlaceholder(): HTMLElement {
  const el = document.querySelector('[data-testid="media-embed-placeholder"]');
  if (!el) throw new Error("placeholder não encontrado");
  return el as HTMLElement;
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

describe("LazyMediaEmbed", () => {
  it("spotify track: placeholder reserva 152px e NÃO monta iframe antes da viewport", () => {
    renderEmbed({ tipo: "spotify", url: SPOTIFY_TRACK });
    expect(document.querySelector("iframe")).toBeNull();
    expect(getPlaceholder().style.height).toBe("152px");
  });

  it("spotify playlist/album: placeholder reserva 352px", () => {
    renderEmbed({ tipo: "spotify", url: SPOTIFY_PLAYLIST });
    expect(getPlaceholder().style.height).toBe("352px");
  });

  it("soundcloud set: placeholder reserva 300px; track comum 166px", () => {
    const first = renderEmbed({ tipo: "soundcloud", url: SOUNDCLOUD_SET });
    expect(getPlaceholder().style.height).toBe("300px");
    first.unmount();

    // Render separado para a variante track (evita ambiguidade de query)
    renderEmbed({ tipo: "soundcloud", url: SOUNDCLOUD_TRACK });
    expect(getPlaceholder().style.height).toBe("166px");
  });

  it("youtube: placeholder em 16:9 (aspect-video), sem altura fixa", () => {
    renderEmbed({ tipo: "youtube", url: YOUTUBE_WATCH });
    expect(document.querySelector("iframe")).toBeNull();
    expect(getPlaceholder().className).toContain("aspect-video");
    expect(getPlaceholder().style.height).toBe("");
  });

  it("youtube compact: placeholder espelha o max-w-md do player final", () => {
    render(<LazyMediaEmbed tipo="youtube" url={YOUTUBE_WATCH} compact />);
    expect(getPlaceholder().className).toContain("max-w-md");
  });

  it("observa com rootMargin de 200px e monta o player na interseção (os 3 providers)", () => {
    const casos: Array<[EmbedFixture, string]> = [
      [{ tipo: "spotify", url: SPOTIFY_TRACK }, "open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT"],
      [{ tipo: "youtube", url: YOUTUBE_WATCH }, "youtube-nocookie.com/embed/kYv9rE8lQ_U"],
      [{ tipo: "soundcloud", url: SOUNDCLOUD_TRACK }, "w.soundcloud.com/player/?url="],
    ];

    for (const [fixture, srcParte] of casos) {
      const { unmount } = renderEmbed(fixture);
      try {
        const io =
          MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
        expect(io.options?.rootMargin).toBe("200px 0px");
        // Antes da interseção: só placeholder, sem iframe
        expect(document.querySelector(`iframe[src*="${srcParte}"]`)).toBeNull();

        // Próximo da viewport (folga de 200px): iframe real entra no lugar
        act(() => io.fire(true));
        const iframe = document.querySelector(`iframe[src*="${srcParte}"]`);
        expect(iframe).not.toBeNull();
        expect(
          document.querySelector('[data-testid="media-embed-placeholder"]'),
        ).toBeNull();
      } finally {
        unmount();
      }
    }
  });

  it("URL sem embed válido: renderiza o MediaEmbed já (sem observer, sem iframe)", () => {
    // YouTube sem ID de vídeo → getEmbedUrl() é null → nada para adiar
    renderEmbed({ tipo: "youtube", url: "https://www.youtube.com/" });
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByText(/não foi possível carregar a prévia/i)).toBeInTheDocument();
  });
});
