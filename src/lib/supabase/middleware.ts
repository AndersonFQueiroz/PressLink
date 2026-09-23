import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Do NOT execute code between createServerClient and
  // supabase.auth.getUser(). Always use getUser() to validate auth status.
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  const { pathname } = request.nextUrl;

  // 1. Redirecionar usuários não autenticados de /painel/* para /login
  if (!user && pathname.startsWith("/painel")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Proteger rotas privadas de API contra acessos não autenticados
  const isPublicApi =
    pathname.startsWith("/api/health") ||
    pathname === "/api/contato" ||
    pathname === "/api/estatisticas/registrar" ||
    pathname === "/api/perfil/check-username";

  if (!user && pathname.startsWith("/api") && !isPublicApi) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para acessar este recurso." },
      { status: 401 },
    );
  }

  // 3. Redirecionar usuários já autenticados tentando acessar /login ou /cadastro para /painel
  const isAuthRoute = pathname === "/login" || pathname === "/cadastro";
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/painel";
    redirectUrl.searchParams.delete("redirectTo");
    redirectUrl.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Bloqueio Resend — email não verificado não acessa /painel (merge Muginski: Alternativa A)
  // Mantém proteção Luiz + adiciona verificação email_confirmed_at -> /verificar-email
  if (user && !user.email_confirmed_at && pathname.startsWith("/painel")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/verificar-email";
    redirectUrl.searchParams.set("reason", "unverified");
    if (user.email) redirectUrl.searchParams.set("email", user.email);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
