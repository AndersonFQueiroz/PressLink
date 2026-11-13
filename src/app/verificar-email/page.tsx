// src/app/verificar-email/page.tsx — Server wrapper com Suspense para verificar-email
// RF: Resend verificação (Alternativa A Hook) — magic link Supabase 1h expira
// Por que existe: separa Server Component (metadata SEO) de Client (verifyOtp precisa browser + useSearchParams)
// Pirâmide de testes: topo — E2E via build + navegação ?token_hash; base tsc/eslint 0
// Orquestra: dry/haxixe/skank/ice em conjunto — flashing glass ink/fuchsia consistente com cadastro

import type { Metadata } from "next"; // tipo Metadata — SEO estático, sem runtime
import { Suspense } from "react"; // Suspense — exigido por useSearchParams em Next 15 (evita erro de prerender)
import { VerificarEmailClient } from "./verificar-client"; // client que faz verifyOtp + estados

// Metadata estática — título exibido na aba, SEO mínimo TCC
export const metadata: Metadata = { title: "Verificar email | PressLink" };

// Page server — não lê cookies, apenas renderiza shell + delega ao client
export default function VerificarEmailPage() {
  // Main com bg ink — replica cadastro/page.tsx:12 (dark glass)
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      {/* Card glass — borda sutil + backdrop-blur, max-w-md centralizado */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 sm:p-8 shadow-xl">
        {/* Suspense — fallback enquanto client hidrata e lê searchParams */}
        <Suspense fallback={<p className="text-white text-center text-sm">Carregando...</p>}>
          <VerificarEmailClient />
        </Suspense>
      </div>
    </main>
  );
}
