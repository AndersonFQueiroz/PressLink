import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * robots.txt — libera a landing e as páginas públicas, bloqueia painel, API e
 * telas de autenticação (que não têm valor de busca e só gastam crawl).
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/painel",
          "/api/",
          "/login",
          "/cadastro",
          "/recuperar-senha",
          "/redefinir-senha",
          "/verificar-email",
          "/auth/",
          "/design-system",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
