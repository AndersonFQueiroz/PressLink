import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { capaComoDataUrl, normalizarCapa, OG_HEIGHT, OG_WIDTH } from "@/lib/og-cover";

function base64DoDataUrl(dataUrl: string): Buffer {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
}

async function imagemDeTeste(formato: "png" | "webp"): Promise<Buffer> {
  const base = sharp({
    create: {
      width: 40,
      height: 40,
      channels: 3,
      background: { r: 200, g: 30, b: 90 },
    },
  });

  return formato === "webp" ? base.webp().toBuffer() : base.png().toBuffer();
}

describe("normalizarCapa", () => {
  it("converte WebP (avatar do Supabase) em PNG 1200x630", async () => {
    const dataUrl = await normalizarCapa(await imagemDeTeste("webp"), "image/webp");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);

    const meta = await sharp(base64DoDataUrl(dataUrl!)).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(OG_WIDTH);
    expect(meta.height).toBe(OG_HEIGHT);
  });

  it("usa o recorte cover: imagem quadrada não distorce", async () => {
    const dataUrl = await normalizarCapa(await imagemDeTeste("webp"), "image/webp");
    const meta = await sharp(base64DoDataUrl(dataUrl!)).metadata();

    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
    // cover mantém a proporção: nada de imagem esticada em 1200x630 falsos
    expect(meta.width! / meta.height!).toBeCloseTo(1200 / 630, 2);
  });

  it("repassa PNG/JPEG sem reconverter", async () => {
    const png = await imagemDeTeste("png");
    await expect(normalizarCapa(png, "image/png")).resolves.toBe(
      `data:image/png;base64,${png.toString("base64")}`,
    );
  });

  it("devolve null para formato que o card não usa", async () => {
    await expect(normalizarCapa(Buffer.from("x"), "image/tiff")).resolves.toBeNull();
  });

  it("devolve null quando o WebP está corrompido", async () => {
    await expect(normalizarCapa(Buffer.from("nao-e-imagem"), "image/webp")).resolves.toBeNull();
  });
});

describe("capaComoDataUrl", () => {
  it("nem tenta baixar quando o perfil não tem capa", async () => {
    await expect(capaComoDataUrl(null)).resolves.toBeNull();
    await expect(capaComoDataUrl(undefined)).resolves.toBeNull();
    await expect(capaComoDataUrl("")).resolves.toBeNull();
  });
});
