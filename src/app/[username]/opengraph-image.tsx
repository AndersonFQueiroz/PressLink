import { ImageResponse } from "next/og";
import { getPublicProfile, listStaticUsernameParams } from "@/lib/public-profile";
import { capaComoDataUrl } from "@/lib/og-cover";
import { siteUrl } from "@/lib/site";

/**
 * Card Open Graph da página pública (issue #22 — RF-24).
 *
 * Gerado no servidor em 1200x630, o formato que WhatsApp, Instagram, LinkedIn
 * e X usam no preview. Usa o nome artístico, o @ e a foto de capa (quando
 * existir) — perfis sem foto recebem o card neutro em vez de preview quebrado.
 *
 * O fetch da capa tem timeout e valida o content-type: uma URL morta no banco
 * não pode derrubar a geração da imagem.
 */
export const alt = "Electronic Press Kit no PressLink";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

interface ImageProps {
  params: Promise<{ username: string }>;
}

/**
 * Pré-renderiza o card dos demos e dos perfis publicados no build.
 * Sem isso a rota de imagem fica dinâmica (ƒ) e cada scraper do WhatsApp paga
 * uma consulta ao banco + render da imagem.
 */
export async function generateStaticParams(): Promise<Array<{ username: string }>> {
  return listStaticUsernameParams();
}

export default async function Image({ params }: ImageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);

  const nome = data?.perfil.nome_artistico?.trim() || username;
  const capa = await capaComoDataUrl(data?.perfil.foto_url);
  const host = siteUrl().replace(/^https?:\/\//i, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 55%, #0f172a 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        {capa ? (
          // eslint-disable-next-line @next/next/no-img-element -- satori (ImageResponse) não aceita next/image
          <img
            src={capa}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.28,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, rgba(9,9,11,0.45) 0%, rgba(9,9,11,0.94) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid rgba(250,250,250,0.28)",
              fontSize: 22,
              letterSpacing: 6,
            }}
          >
            PRESSLINK
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "rgba(250,250,250,0.62)" }}>
            ELECTRONIC PRESS KIT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: nome.length > 22 ? 68 : 92,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {nome}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "rgba(250,250,250,0.72)" }}>
            @{username}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "rgba(250,250,250,0.62)",
          }}
        >
          <div style={{ display: "flex" }}>{host}</div>
          <div style={{ display: "flex" }}>{data ? "bio · músicas · agenda · booking" : "EPK"}</div>
        </div>
      </div>
    ),
    size,
  );
}
