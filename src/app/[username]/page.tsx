import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { getPublicProfile, listStaticUsernameParams } from "@/lib/public-profile";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates";

interface PageProps {
  params: Promise<{ username: string }>;
}

/**
 * Página pública do DJ (issue #22 — RF-24 / RNF-16).
 *
 * Server Component estática com ISR: o conteúdo é gerado no build para os
 * perfis publicados (e para os demos fixos) e regenerado a cada 5 minutos.
 * As rotas do painel que gravam dados chamam `revalidatePublicPages()` para a
 * alteração aparecer na hora, sem esperar a janela de 5 minutos.
 *
 * Nada aqui lê cookie/sessão — o cliente anon sem sessão
 * (@/lib/supabase/public) é o que permite o cache. O `?template=` saiu: query
 * string força renderização dinâmica e mataria o ISR; a pré-visualização de
 * template é feita no próprio painel (TemplatePreviewModal) e nas rotas /demo.
 */
export const revalidate = 300;

/**
 * Pré-renderiza os demos e todos os perfis publicados.
 *
 * Se o banco não estiver acessível (CI sem env ou queda do Supabase) devolve
 * apenas os demos — as demais páginas são geradas sob demanda na primeira
 * visita e passam a ser cacheadas (ISR), sem quebrar o build.
 */
export async function generateStaticParams(): Promise<Array<{ username: string }>> {
  return listStaticUsernameParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);

  if (!data) {
    return {
      title: "Artista não encontrado | PressLink",
      robots: { index: false, follow: false },
    };
  }

  return buildPublicMetadata(data, { username });
}

export default async function PublicArtistPage({ params }: PageProps) {
  const { username } = await params;
  const profileData = await getPublicProfile(username);

  if (!profileData) {
    notFound();
  }

  // issue #21: TemplateRenderer é a fonte única de slug→componente.
  // issue #22: fallback de slug garantido também na leitura pública.
  return (
    <TemplateRenderer
      slug={profileData.perfil.template_slug ?? DEFAULT_TEMPLATE_ID}
      data={profileData}
    />
  );
}
