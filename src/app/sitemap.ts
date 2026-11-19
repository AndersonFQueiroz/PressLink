import type { MetadataRoute } from "next";

import { listPublishedUsernames } from "@/lib/public-profile";
import { siteUrl } from "@/lib/site";

/**
 * sitemap.xml — landing, documentos legais e todos os perfis publicados.
 *
 * Só entram perfis com `publicado = true`; demos ficam de fora de propósito
 * (são exemplos de template, não páginas de clientes). Se o banco estiver
 * indisponível, a função devolve só as rotas estáticas e a próxima
 * revalidação completa a lista.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const agora = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cadastro`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/termos`, lastModified: agora, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: agora, changeFrequency: "yearly", priority: 0.3 },
  ];

  const usernames = await listPublishedUsernames();
  const perfis: MetadataRoute.Sitemap = usernames.map((username) => ({
    url: `${base}/${username}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...estaticas, ...perfis];
}
