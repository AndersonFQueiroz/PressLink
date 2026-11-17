import { CleanEditorialTemplate } from "@/components/templates/CleanEditorialTemplate";
import { DarkMinimalTemplate } from "@/components/templates/DarkMinimalTemplate";
import { VibrantFestivalTemplate } from "@/components/templates/VibrantFestivalTemplate";
import type { TemplatePublicData } from "@/types/template";
import { resolveTemplateId } from "@/lib/templates";

/**
 * Escolhe o componente público pelo slug (fonte única do mapeamento).
 *
 * CONSUMO DO TEMPLATE SELECIONADO (issue #21):
 * PUT /api/perfil grava o slug escolhido em perfil.template_slug; a página
 * pública (src/app/[username]/page.tsx) lê essa coluna e passa o valor aqui.
 * Slugs nulos/desconhecidos caem no fallback dark-minimal (mesma regra anterior).
 */
export function TemplateRenderer({
  slug,
  data,
}: {
  slug?: string | null;
  data: TemplatePublicData;
}) {
  const templateId = resolveTemplateId(slug);

  if (templateId === "vibrant-festival") {
    return <VibrantFestivalTemplate data={data} />;
  }

  if (templateId === "clean-editorial") {
    return <CleanEditorialTemplate data={data} />;
  }

  return <DarkMinimalTemplate data={data} />;
}
