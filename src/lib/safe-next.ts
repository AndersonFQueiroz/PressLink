// src/lib/safe-next.ts — sanitiza ?next= antes de navegar
// Por que existe: `startsWith("/")` sozinho aceita "//evil.com" (protocol-relative) e "/\evil.com",
// o browser normaliza para "//" e o usuário termina em site clonado com sessão válida (open redirect).
// O /auth/callback já fazia essa checagem inline; agora os três pontos usam a mesma regra.

const DEFAULT_FALLBACK = "/login?verified=1";

export function safeNext(value: string | null | undefined, fallback: string = DEFAULT_FALLBACK): string {
  if (!value) return fallback;

  const candidate = value.trim();
  if (!candidate) return fallback;

  // Só caminho absoluto interno
  if (!candidate.startsWith("/")) return fallback;

  // "//" e "/\" viram protocol-relative no browser
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;

  // Caracteres de controle quebram a checagem acima (ex: "/\t/evil.com")
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return fallback;

  return candidate;
}
