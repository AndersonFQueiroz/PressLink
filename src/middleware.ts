// src/middleware.ts — protege /painel/* exigindo email verificado (Alternativa A)
// RF: Resend verificação — bloqueia painel se !email_confirmed_at, permite /verificar-email e /login
// Por que existe: evita usuário não verificado acessar EPK restrito; UX redireciona para verificação
// Pirâmide: topo — middleware edge/node, testado via build + curl (ver Task8 verificação)
// Orquestra: dry/haxixe/skank/ice — ice LGPD: não loga email, middleware não expõe PII
// Localização: src/middleware.ts — Next 15 App Router aceita src/middleware.ts ou root middleware.ts (src preferido se src/ existe)

import { type NextRequest, NextResponse } from "next/server"; // tipos Next 15 — req/res edge-friendly
import { createServerClient } from "@supabase/ssr"; // client SSR — lê cookies do request para getUser (não precisa service_role)

// Middleware — intercepta apenas /painel/* (matcher abaixo), demais rotas passam direto
export async function middleware(req: NextRequest) {
  // 1. Só protege /painel — demais rotas (/, /login, /cadastro, /verificar-email, /[username]) são públicas
  // Por que early return: economiza chamada Supabase para rotas públicas (performance + custo)
  if (!req.nextUrl.pathname.startsWith("/painel")) return NextResponse.next();

  // 2. Cria response base — será modificado com cookies se Supabase refrescar sessão
  const res = NextResponse.next();

  // 3. Cria Supabase client com cookies do request — usa anon key (NEXT_PUBLIC_)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL Supabase — ! garante string (build falha se ausente, OK exigir env)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon key — pública, segura para SSR
    {
      cookies: {
        // getAll — lê todos cookies do request (inclui sb-* auth)
        getAll() {
          return req.cookies.getAll();
        },
        // setAll — escreve cookies de refresh no response (Supabase rotaciona tokens)
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  // 4. Busca usuário autenticado — valida JWT do cookie
  const {
    data: { user },
  } = await supabase.auth.getUser(); // retorna user ou null se não autenticado/expirado

  // 5. Não autenticado → redirect /login (não mostra painel)
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  // 6. Autenticado mas email não verificado → redirect /verificar-email?reason=unverified&email=
  // Campo email_confirmed_at null significa não clicou no magic link (Alternativa A mantém auth.users.email_confirmed_at)
  if (!user.email_confirmed_at) {
    const url = new URL("/verificar-email", req.url); // base = origin atual (preserva domínio)
    url.searchParams.set("reason", "unverified"); // flag para client mostrar banner específico
    url.searchParams.set("email", user.email || ""); // injeta email para ReenviarForm pre-preencher
    return NextResponse.redirect(url); // 307 redirect — mantém método, mas GET é OK para navegação
  }

  // 7. Verificado → libera acesso ao painel
  return res; // NextResponse.next com cookies atualizados
}

// Config — matcher limita execução apenas a /painel/:path* (evita rodar em estáticos, api, etc)
// Por que matcher: performance — middleware em cada request; limitar a /painel reduz 90% invocações
export const config = { matcher: ["/painel/:path*"] };
