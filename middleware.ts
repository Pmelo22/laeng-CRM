import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de autenticação simples e Edge-compatible
 * Verifica apenas a presença de cookies do Supabase
 * A validação real da sessão acontece nos Server Components
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas que não precisam de autenticação
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/cadastro") ||
    pathname.startsWith("/auth/cadastro-sucesso") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  // Se é rota pública, permite acesso imediato
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica se tem cookie de autenticação do Supabase
  // Formato: sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies
    .getAll()
    .some(cookie => 
      cookie.name.startsWith("sb-") && 
      cookie.name.includes("auth-token") &&
      cookie.value.length > 0
    );

  // Se não tem cookie e está tentando acessar área protegida, redireciona
  if (!hasAuthCookie && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se tem cookie mas está tentando acessar páginas de auth, redireciona ao dashboard
  if (hasAuthCookie && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/cadastro"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - files with extensions (images, fonts, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf|css|js)$).*)",
  ],
};
