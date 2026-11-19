/**
 * `sizes` da foto principal (hero) de cada template — issue #28.
 *
 * Fonte única: o template usa o valor para renderizar o `<Image>` e a página
 * pública usa o MESMO valor no `preload` da imagem de LCP. Se os dois
 * divergirem, o navegador baixa dois candidatos e o ganho some.
 *
 * Arquivo sem imports de propósito: os templates são Client Components e não
 * podem puxar a lista de templates/cores para o bundle só por causa disso.
 */
export const HERO_IMAGE_SIZES = {
  "vibrant-festival": "(max-width: 1024px) 82vw, 32vw",
  "clean-editorial": "(max-width: 1024px) 100vw, 40vw",
  "dark-minimal": "100vw",
} as const;

const HERO_IMAGE_SIZES_FALLBACK = HERO_IMAGE_SIZES["dark-minimal"];

/** `sizes` do hero para o slug informado (slug desconhecido cai no fallback). */
export function getHeroImageSizes(slug: string | null | undefined): string {
  if (slug && slug in HERO_IMAGE_SIZES) {
    return HERO_IMAGE_SIZES[slug as keyof typeof HERO_IMAGE_SIZES];
  }
  return HERO_IMAGE_SIZES_FALLBACK;
}
