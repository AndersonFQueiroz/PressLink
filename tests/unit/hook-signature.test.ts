// tests/unit/hook-signature.test.ts — Standard Webhooks (Supabase Auth Hook)
// RED: cobre C2 do review 2026-11-03 — Supabase não usa Authorization: Bearer
import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyStandardWebhook } from "@/lib/supabase/hook-signature";

// secret base64 puro + formato do dashboard (v1,whsec_...)
const SECRET_B64 = Buffer.from("chave-de-teste-do-presslink-123456").toString("base64");
const SECRET_DASH = `v1,whsec_${SECRET_B64}`;
const WEBHOOK_ID = "msg_2abc";
const BODY = JSON.stringify({ user: { email: "teste@presslink.test" } });

function sign(body: string, opts: { id?: string; ts?: string; secretB64?: string } = {}) {
  const id = opts.id ?? WEBHOOK_ID;
  const ts = opts.ts ?? "1750000000";
  const key = Buffer.from(opts.secretB64 ?? SECRET_B64, "base64");
  return createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
}

function headers(over: Partial<Record<"id" | "ts" | "sig", string | null>> = {}) {
  return {
    "webhook-id": over.id === undefined ? WEBHOOK_ID : over.id,
    "webhook-timestamp": over.ts === undefined ? "1750000000" : over.ts,
    "webhook-signature": over.sig === undefined ? `v1,${sign(BODY)}` : over.sig,
  };
}

const NOW = 1750000000 * 1000; // ms — mesmo instante do timestamp acima

describe("verifyStandardWebhook", () => {
  it("aceita assinatura válida (secret no formato do dashboard)", () => {
    const r = verifyStandardWebhook({ secret: SECRET_DASH, body: BODY, headers: headers(), nowMs: NOW });
    expect(r.ok).toBe(true);
  });

  it("aceita secret só com whsec_ (sem o prefixo v1,)", () => {
    const r = verifyStandardWebhook({
      secret: `whsec_${SECRET_B64}`,
      body: BODY,
      headers: headers(),
      nowMs: NOW,
    });
    expect(r.ok).toBe(true);
  });

  it("rejeita corpo adulterado depois da assinatura", () => {
    const r = verifyStandardWebhook({
      secret: SECRET_DASH,
      body: `${BODY} `, // 1 byte a mais
      headers: headers(),
      nowMs: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("signature_mismatch");
  });

  it("rejeita assinatura feita com outra chave", () => {
    const outra = Buffer.from("outra-chave-qualquer").toString("base64");
    const r = verifyStandardWebhook({
      secret: SECRET_DASH,
      body: BODY,
      headers: headers({ sig: `v1,${sign(BODY, { secretB64: outra })}` }),
      nowMs: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("signature_mismatch");
  });

  it("rejeita timestamp fora da tolerância de 5 minutos (replay)", () => {
    const ts = "1750000000";
    const r = verifyStandardWebhook({
      secret: SECRET_DASH,
      body: BODY,
      headers: headers({ ts }),
      nowMs: NOW + 6 * 60 * 1000,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("timestamp_out_of_tolerance");
  });

  it("aceita múltiplas assinaturas separadas por espaço (rotação de chave)", () => {
    const sig = sign(BODY);
    const r = verifyStandardWebhook({
      secret: SECRET_DASH,
      body: BODY,
      headers: headers({ sig: `v1,${"A".repeat(44)} v1,${sig}` }),
      nowMs: NOW,
    });
    expect(r.ok).toBe(true);
  });

  it("rejeita quando falta qualquer um dos três headers", () => {
    for (const over of [{ id: null }, { ts: null }, { sig: null }] as const) {
      const r = verifyStandardWebhook({ secret: SECRET_DASH, body: BODY, headers: headers(over), nowMs: NOW });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("missing_headers");
    }
  });

  it("rejeita secret vazio (fail-closed)", () => {
    const r = verifyStandardWebhook({ secret: "", body: BODY, headers: headers(), nowMs: NOW });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("missing_secret");
  });
});
