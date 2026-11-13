// src/lib/app-url.ts — resolve a base URL do app para links em email
// Por que existe: o hook usava só NEXT_PUBLIC_APP_URL com fallback localhost.
// Se a env faltasse (preview deploy, Vercel sem var), todo email de verificação
// apontava para localhost e o cadastro morria no clique do link.

// Ordem de precedência:
// 1. NEXT_PUBLIC_APP_URL — controlado pelo servidor, é a fonte confiável
// 2. origin do redirect_to recebido do Supabase — cobre preview deploy sem env
// 3. localhost — só dev
export function resolveAppUrl(redirectTo?: string | null): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (redirectTo) {
    try {
      const { origin } = new URL(redirectTo);
      if (origin && origin !== "null") return origin;
    } catch {
      // redirect_to inválido — cai no fallback
    }
  }

  return "http://localhost:3000";
}
