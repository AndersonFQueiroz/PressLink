import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as requisições exceto:
     * - _next/static (arquivos estáticos compilados)
     * - _next/image (arquivos de otimização de imagens)
     * - favicon.ico (ícone de favoritos)
     * - arquivos com extensões comuns de assets (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
