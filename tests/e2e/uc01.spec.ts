import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

// UC01 completo (#30): Perfil -> Foto -> Link de mídia -> Publicação ->
// Visita à Rota Pública -> Contato (WhatsApp + e-mail) -> Despublicação.
//
// Só roda quando PLAYWRIGHT_TEST_EMAIL/PASSWORD estão definidos (CI secrets ou
// export local) — sem credenciais o teste é pulado, igual aos demais fluxos.
// O teste é idempotente: semeia dados próprios e devolve o estado ao final
// (publicado/despublicado como estava antes), inclusive se falhar no meio.

const USERNAME = "e2e-uc01";
const NOME_ARTISTICO = "DJ Teste UC01";
const WHATSAPP = "5511999990000";
const EMAIL_BOOKING = "booking.e2e-uc01@exemplo.com";
// Qualquer URL válida do YouTube — só precisa passar em detectTipoMidia.
const URL_YOUTUBE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  "base64",
);

test.describe("UC01 completo — publicar e verificar portfólio online (#30)", () => {
  test.setTimeout(90_000); // login + seeds + navegações + waits de ISR

  test("perfil -> foto -> link -> publica -> página no ar c/ contato -> despublica", async ({
    page,
    request,
  }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
    test.skip(!email || !password, "Sem PLAYWRIGHT_TEST_EMAIL/PASSWORD — pula UC01 completo");

    // ---------- 1. Login (mesmo helper dos outros fluxos) ----------
    const logged = await loginAsTestUser(page);
    expect(logged).toBe(true);

    // Estado inicial do usuário de teste — restaurado no finally.
    let publicadoInicial = false;
    let perfilExiste = true;
    const rPerfil = await request.get("/api/perfil");
    if (rPerfil.ok()) {
      const corpo = (await rPerfil.json()) as { perfil?: { publicado?: boolean } };
      publicadoInicial = Boolean(corpo.perfil?.publicado);
      perfilExiste = Boolean(corpo.perfil);
    }

    // Itens criados por este teste (removidos no finally)
    let limparFotoId: string | null = null;
    let limparLinkId: string | null = null;

    try {
      // ---------- 2. Semente do perfil (upsert pelo usuario_id — idempotente) ----------
      const rPerfilPut = await request.put("/api/perfil", {
        data: {
          nome_artistico: NOME_ARTISTICO,
          username: USERNAME,
          whatsapp: WHATSAPP,
          email_booking: EMAIL_BOOKING,
        },
      });
      expect(rPerfilPut.ok()).toBe(true);

      // ---------- 3. Pré-requisito: ≥1 foto na galeria ----------
      const rFotos = await request.get("/api/galeria");
      expect(rFotos.ok()).toBe(true);
      const fotos = ((await rFotos.json()) as { fotos: Array<{ id: string }> }).fotos;
      if (fotos.length === 0) {
        const rUpload = await request.post("/api/galeria", {
          multipart: {
            files: { name: "uc01-teste.png", mimeType: "image/png", buffer: PNG_1X1 },
          },
        });
        expect(rUpload.status()).toBe(201);
        const corpoUpload = (await rUpload.json()) as { fotos: Array<{ id: string }> };
        limparFotoId = corpoUpload.fotos[0]?.id ?? null;
      }

      // ---------- 4. Pré-requisito: ≥1 link de mídia ----------
      const rLinksAntes = await request.get("/api/links");
      expect(rLinksAntes.ok()).toBe(true);
      const linksAntes = ((await rLinksAntes.json()) as { links: Array<{ id: string }> }).links;
      if (linksAntes.length === 0) {
        const rLinkPost = await request.post("/api/links", {
          data: { url: URL_YOUTUBE, titulo: "Track E2E UC01" },
        });
        expect(rLinkPost.ok()).toBe(true);
        const rLinksDepois = await request.get("/api/links");
        const linksDepois = ((await rLinksDepois.json()) as { links: Array<{ id: string }> })
          .links;
        limparLinkId =
          linksDepois.find((l) => !linksAntes.some((a) => a.id === l.id))?.id ?? null;
        expect(limparLinkId).not.toBeNull();
      }

      // ---------- 5. Publicação (valida pré-requisitos server-side) ----------
      const rPublicar = await request.post("/api/publicar");
      expect(rPublicar.status()).toBe(200);
      const corpoPublicar = (await rPublicar.json()) as { success: boolean; url: string };
      expect(corpoPublicar.success).toBe(true);

      // ISR invalida na hora — mas dá margem pro dev server regenerar
      await expect
        .poll(async () => (await request.get(`/${USERNAME}`)).status(), {
          timeout: 15_000,
          message: "página pública não ficou 200 após publicar",
        })
        .toBe(200);

      // ---------- 6. Visita à rota pública (navegador de verdade) ----------
      const resp = await page.goto(`/${USERNAME}`);
      expect(resp?.status()).toBe(200);

      // Nome artístico aparece (hero de qualquer template)
      await expect(page.getByText(NOME_ARTISTICO, { exact: false }).first()).toBeVisible({
        timeout: 10_000,
      });

      // Contato: CTA WhatsApp (wa.me/<número>) e e-mail de booking (mailto:)
      await expect(page.locator(`a[href*="wa.me/${WHATSAPP}"]`).first()).toBeVisible();
      await expect(page.locator(`a[href="mailto:${EMAIL_BOOKING}"]`).first()).toBeVisible();

      // ---------- 7. Despublicação tira a página do ar ----------
      const rDespublicar = await request.post("/api/despublicar");
      expect(rDespublicar.status()).toBe(200);

      await expect
        .poll(async () => (await request.get(`/${USERNAME}`)).status(), {
          timeout: 15_000,
          message: "página pública não virou 404 após despublicar",
        })
        .toBe(404);
    } finally {
      // Restaura o estado de publicação que o usuário tinha antes do teste
      if (publicadoInicial) {
        await request.post("/api/publicar").catch(() => {});
      } else if (perfilExiste) {
        await request.post("/api/despublicar").catch(() => {});
      }
      // Remove os itens semeados (só os criados por esta execução)
      if (limparFotoId) {
        await request.delete(`/api/galeria?id=${limparFotoId}`).catch(() => {});
      }
      if (limparLinkId) {
        await request.delete(`/api/links/${limparLinkId}`).catch(() => {});
      }
    }
  });
});
