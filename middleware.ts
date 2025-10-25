import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    "/auth/login",
    "/auth/cadastro",
    "/auth/cadastro-sucesso",
    "/",
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith("/auth/")
  );

  // Se é rota pública, permite acesso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verifica se tem cookie de autenticação do Supabase
  const authCookies = request.cookies.getAll().filter(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );

  // Se não tem cookie de autenticação e está tentando acessar rota protegida
  if (authCookies.length === 0 && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
