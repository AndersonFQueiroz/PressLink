// tests/api/auth-supabase-hook.route.test.ts — POST /api/auth/supabase-hook
// RED: cobre C1 (rota alcançável), C2 (Standard Webhooks + fail-closed), C3/I6 (URL do email)
import "./setup";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";

const SECRET_B64 = Buffer.from("chave-hook-presslink-para-teste").toString("base64");
const SECRET_DASH = `v1,whsec_${SECRET_B64}`;
const WEBHOOK_ID = "msg_hook_1";
const TS = "1750000000";
const NOW = Number(TS) * 1000;

const send = vi.fn();

vi.mock("@/lib/resend", () => ({
  getResend: vi.fn(() => ({ emails: { send } })),
  getResendFrom: () => "PressLink <nao-responda@resend.dev>",
  maskEmail: (e: string) => e.replace(/^(.)[^@]*@/, "$1***@"),
}));

vi.mock("@react-email/render", () => ({
  render: vi.fn(async () => "<html>email</html>"),
}));

vi.mock("@/emails/VerificationEmail", () => ({
  VerificationEmail: () => null,
}));

import { getResend } from "@/lib/resend";
import { POST } from "@/app/api/auth/supabase-hook/route";

type Payload = {
  user?: { id?: string; email?: string; user_metadata?: { nome?: string } };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
};

const basePayload = (over: Payload = {}): Payload => ({
  user: { id: "user-1", email: "destino@presslink.test", user_metadata: { nome: "Dimi" }, ...over.user },
  email_data: {
    token: "tok",
    token_hash: "hash-abc",
    redirect_to: "https://presslink.app/painel",
    email_action_type: "signup",
    site_url: "https://presslink.app",
    ...over.email_data,
  },
});

function signed(payload: Payload | string, opts: { secret?: string; body?: string } = {}) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  const key = Buffer.from((opts.secret ?? SECRET_B64), "base64");
  const sig = createHmac("sha256", key).update(`${WEBHOOK_ID}.${TS}.${body}`).digest("base64");
  return new Request("http://test/api/auth/supabase-hook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "webhook-id": WEBHOOK_ID,
      "webhook-timestamp": TS,
      "webhook-signature": `v1,${sig}`,
    },
    body,
  });
}

describe("POST /api/auth/supabase-hook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SUPABASE_HOOK_SECRET", SECRET_DASH);
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://presslink.app");
    vi.stubEnv("NODE_ENV", "test");
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(getResend).mockReturnValue({ emails: { send } } as never);
    send.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("401 sem headers de assinatura (substitui o Bearer)", async () => {
    const req = new Request("http://test/api/auth/supabase-hook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload()),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  it("401 com assinatura de outra chave", async () => {
    const outra = Buffer.from("chave-errada").toString("base64");
    const res = await POST(signed(basePayload(), { secret: outra }) as never);
    expect(res.status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  it("500 em produção quando SUPABASE_HOOK_SECRET não está configurado (fail-closed)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_HOOK_SECRET", "");
    const res = await POST(signed(basePayload()) as never);
    expect(res.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
  });

  it("400 com JSON inválido mas assinatura válida", async () => {
    const res = await POST(signed("nao-e-json") as never);
    expect(res.status).toBe(400);
  });

  it("200 skipped not_signup para recovery/magiclink (Supabase envia nativo)", async () => {
    const res = await POST(signed(basePayload({ email_data: { email_action_type: "recovery" } })) as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ skipped: true, reason: "not_signup" });
    expect(send).not.toHaveBeenCalled();
  });

  it("400 quando falta email ou token_hash", async () => {
    const semToken = basePayload();
    semToken.email_data!.token_hash = "";
    const res = await POST(signed(semToken) as never);
    expect(res.status).toBe(400);
  });

  it("200 ok no caminho feliz e envia email pelo Resend", async () => {
    const res = await POST(signed(basePayload()) as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("200 skipped no_api_key quando RESEND_API_KEY ausente (cadastro não quebra)", async () => {
    vi.mocked(getResend).mockReturnValue(null as never);
    const res = await POST(signed(basePayload()) as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ skipped: true, reason: "no_api_key" });
  });

  it("500 quando o Resend devolve erro", async () => {
    send.mockResolvedValue({ error: { message: "domain not verified" } });
    const res = await POST(signed(basePayload()) as never);
    expect(res.status).toBe(500);
  });

  it("link do email usa o origin de redirect_to, não localhost (I6)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    const res = await POST(signed(basePayload()) as never);
    expect(res.status).toBe(200);
    const arg = send.mock.calls[0][0] as { html: string; text: string };
    expect(arg.text).toContain("https://presslink.app/verificar-email");
    expect(arg.text).not.toContain("localhost");
    expect(arg.text).toContain("hash-abc");
  });

  it("não loga email completo nem token_hash (LGPD)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.mocked(getResend).mockReturnValue(null as never);
    await POST(signed(basePayload()) as never);
    const output = [...warn.mock.calls, ...log.mock.calls].flat().join(" ");
    expect(output).not.toContain("destino@presslink.test");
    expect(output).not.toContain("hash-abc");
    warn.mockRestore();
    log.mockRestore();
  });
});
