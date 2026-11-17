// tests/unit/components/media-embed.test.tsx — issue #49
// Garante que o preview do painel /musica (fluxo do #15) segue intacto:
// o MediaEmbed continua montando o iframe na hora (eager), sem lazy loading,
// e as dimensões por provedor/variante permanecem as originais.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import React from "react";

import {
  MediaEmbed,
  getMediaEmbedDimensions,
} from "@/components/features/painel/MediaEmbed";

const SPOTIFY_TRACK = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
const SPOTIFY_PLAYLIST =
  "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
const YOUTUBE_WATCH = "https://www.youtube.com/watch?v=kYv9rE8lQ_U";
const SOUNDCLOUD_TRACK = "https://soundcloud.com/user/some-track";
const SOUNDCLOUD_SET = "https://soundcloud.com/user/sets/some-set";

describe("MediaEmbed (preview do painel — eager, sem mudança)", () => {
  it("monta o iframe do Spotify imediatamente ao renderizar", () => {
    render(
      <MediaEmbed
        tipo="spotify"
        url={SPOTIFY_TRACK}
        titulo="Resonance"
      />
    );
    const iframe = screen.getByTitle("Resonance");
    expect(iframe).toHaveAttribute("src", "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(iframe).toHaveAttribute("height", "152");
  });

  it("monta o iframe do YouTube imediatamente (16:9)", () => {
    render(<MediaEmbed tipo="youtube" url={YOUTUBE_WATCH} />);
    const iframe = screen.getByTitle("YouTube Video Player");
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/kYv9rE8lQ_U");
  });

  it("monta o iframe do SoundCloud imediatamente", () => {
    render(<MediaEmbed tipo="soundcloud" url={SOUNDCLOUD_TRACK} />);
    const iframe = screen.getByTitle("SoundCloud Track Player");
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("w.soundcloud.com/player/?url="),
    );
    expect(iframe).toHaveAttribute("height", "166");
  });

  it("mantém as dimensões originais por provedor/variante (fonte única)", () => {
    // Spotify
    expect(getMediaEmbedDimensions("spotify", SPOTIFY_TRACK)).toEqual({ height: 152 });
    expect(getMediaEmbedDimensions("spotify", SPOTIFY_PLAYLIST)).toEqual({ height: 352 });
    expect(getMediaEmbedDimensions("spotify", SPOTIFY_TRACK, true)).toEqual({ height: 80 });
    // SoundCloud
    expect(getMediaEmbedDimensions("soundcloud", SOUNDCLOUD_TRACK)).toEqual({ height: 166 });
    expect(getMediaEmbedDimensions("soundcloud", SOUNDCLOUD_SET)).toEqual({ height: 300 });
    expect(getMediaEmbedDimensions("soundcloud", SOUNDCLOUD_TRACK, true)).toEqual({ height: 120 });
    // YouTube sempre usa aspect-ratio
    expect(getMediaEmbedDimensions("youtube", YOUTUBE_WATCH)).toEqual({ aspectVideo: true });
  });

  it("mantém o fallback de erro quando a URL não gera embed", () => {
    render(<MediaEmbed tipo="youtube" url="https://www.youtube.com/" />);
    expect(screen.getByText(/não foi possível carregar a prévia/i)).toBeInTheDocument();
    expect(screen.queryByRole("iframe")).toBeNull();
  });
});
