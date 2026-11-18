import sharp from "sharp";

/**
 * Preparo da foto de capa do card Open Graph (issue #22).
 *
 * O satori (motor do `ImageResponse`) desenha PNG/JPEG/GIF/SVG direto, mas
 * **não lê WebP** — e o PressLink comprime os avatares para WebP no navegador.
 * Sem esta conversão o build quebra em `/[username]/opengraph-image` com
 * "u2 is not iterable" (erro minificado do satori ao tentar medir a imagem).
 *
 * A imagem convertida também é recortada em 1200x630 `cover`, o mesmo tamanho
 * do card, para não carregar um base64 gigante no payload da rota.
 */

const TIPOS_DIRETOS = new Set(["image/png", "image/jpeg", "image/gif", "image/svg+xml"]);
const TIPOS_CONVERTER = new Set(["image/webp", "image/avif"]);

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const TAMANHO_MAXIMO_BYTES = 12_000_000;

/** Converte o binário em data URI aceito pelo satori (ou null se não der). */
export async function normalizarCapa(buffer: Buffer, tipo: string): Promise<string | null> {
  if (TIPOS_DIRETOS.has(tipo)) {
    return `data:${tipo};base64,${buffer.toString("base64")}`;
  }

  if (!TIPOS_CONVERTER.has(tipo)) return null;

  try {
    const png = await sharp(buffer)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "attention" })
      .png({ compressionLevel: 9 })
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Baixa a capa e devolve um data URI pronto para o card.
 *
 * Timeout curto e try/catch: uma URL morta ou um Storage fora do ar não pode
 * derrubar a geração da imagem — nesse caso o card sai só com nome + @.
 */
export async function capaComoDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, {
      cache: "force-cache",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const tipo = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    if (!tipo.startsWith("image/")) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > TAMANHO_MAXIMO_BYTES) return null;

    return await normalizarCapa(buffer, tipo);
  } catch {
    return null;
  }
}
