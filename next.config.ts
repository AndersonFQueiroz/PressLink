import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Permite compilar/validar em paralelo com o `npm run dev` do dono, sem os
  // dois processos disputando a mesma pasta `.next`.
  distDir: process.env.PRESSLINK_DIST_DIR || ".next",
  experimental: {
    // issue #28: cada rota baixa só o CSS que usa — o layout de (auth) tinha
    // 1,7 KB de folha de estilo entrando no HTML da página pública.
    cssChunking: "strict",
  },
  images: {
    // AVIF primeiro (30-50% menor que WebP nas fotos do Storage) e WebP como
    // fallback — issue #28: imagem do hero é o elemento de LCP da página.
    formats: ["image/avif", "image/webp"],
    // Miniaturas da galeria podem usar 55 (issue #28): em ~200px de largura a
    // diferença é imperceptível e o arquivo cai ~40%.
    qualities: [55, 75],
    // Os arquivos do Storage usam nome único por upload (uuid), então o
    // resultado otimizado nunca muda. O padrão de 60s fazia o otimizador
    // buscar a imagem no Supabase de novo a cada minuto, o que aparecia como
    // LCP de ~2,7s nas auditorias do Lighthouse.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      // Thumbnail dos vídeos do YouTube (issue #28): passa pelo otimizador
      // para sair em AVIF no tamanho exibido, em vez do JPG de 480px.
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
