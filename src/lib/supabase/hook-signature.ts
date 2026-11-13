// src/lib/supabase/hook-signature.ts — verificação Standard Webhooks (Supabase Auth Hooks)
// Por que existe: os Auth Hooks HTTP do Supabase seguem a spec Standard Webhooks —
// headers webhook-id / webhook-timestamp / webhook-signature (HMAC-SHA256), NÃO Authorization: Bearer.
// Sem isso, toda chamada legítima do Supabase levava 401 e o cadastro quebrava.
// Ref: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook

import { createHmac, timingSafeEqual } from "node:crypto";

// Tolerância contra replay — mesmo valor sugerido pela spec (5 minutos)
const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;

export type VerifyFailureReason =
  | "missing_secret"
  | "missing_headers"
  | "timestamp_out_of_tolerance"
  | "signature_mismatch";

export type VerifyResult = { ok: true } | { ok: false; reason: VerifyFailureReason };

// O dashboard mostra o secret como "v1,whsec_<base64>"; aceita também "whsec_<base64>" e base64 puro
function normalizeSecret(secret: string): string {
  return secret.trim().replace(/^v1,/, "").replace(/^whsec_/, "");
}

// Headers do Next são case-insensitive, mas um objeto simples pode vir com caixa variada
function pick(headers: Record<string, string | null | undefined>, name: string): string | null {
  const direct = headers[name];
  if (direct !== undefined && direct !== null) return direct;
  const found = Object.keys(headers).find((k) => k.toLowerCase() === name);
  if (!found) return null;
  return headers[found] ?? null;
}

// Compara em tempo constante — evita vazar a assinatura correta por diferença de tempo
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyStandardWebhook(input: {
  secret: string;
  body: string;
  headers: Record<string, string | null | undefined>;
  nowMs?: number;
  toleranceMs?: number;
}): VerifyResult {
  const secret = normalizeSecret(input.secret);
  if (!secret) return { ok: false, reason: "missing_secret" }; // fail-closed: sem segredo não valida nada

  const id = pick(input.headers, "webhook-id");
  const timestamp = pick(input.headers, "webhook-timestamp");
  const signatureHeader = pick(input.headers, "webhook-signature");
  if (!id || !timestamp || !signatureHeader) return { ok: false, reason: "missing_headers" };

  const timestampMs = Number(timestamp) * 1000;
  const nowMs = input.nowMs ?? Date.now();
  const toleranceMs = input.toleranceMs ?? DEFAULT_TOLERANCE_MS;
  if (!Number.isFinite(timestampMs) || Math.abs(nowMs - timestampMs) > toleranceMs) {
    return { ok: false, reason: "timestamp_out_of_tolerance" }; // replay ou relógio dessincronizado
  }

  // Conteúdo assinado pela spec: "<id>.<timestamp>.<corpo bruto>"
  const expected = createHmac("sha256", Buffer.from(secret, "base64"))
    .update(`${id}.${timestamp}.${input.body}`)
    .digest("base64");

  // O header pode trazer várias assinaturas separadas por espaço (rotação de chave)
  const candidates = signatureHeader
    .split(" ")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("v1,") ? s.slice(3) : s));

  const matched = candidates.some((candidate) => safeEqual(candidate, expected));
  return matched ? { ok: true } : { ok: false, reason: "signature_mismatch" };
}

// Comparação constante usada também no fallback Authorization: Bearer (curl local de teste)
export function safeEqualString(a: string, b: string): boolean {
  return safeEqual(a, b);
}
