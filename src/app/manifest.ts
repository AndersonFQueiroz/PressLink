import type { MetadataRoute } from "next";

/**
 * manifest.webmanifest — instalação na tela inicial (Android/desktop) e
 * metadados de cor do navegador. O ícone é o mesmo do favicon/OG.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PressLink — press kit digital para DJs",
    short_name: "PressLink",
    description:
      "Monte seu press kit profissional com foto, músicas, agenda e contato, e publique em minutos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07060B",
    theme_color: "#07060B",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["business", "music", "productivity"],
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/presslink-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/presslink-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
