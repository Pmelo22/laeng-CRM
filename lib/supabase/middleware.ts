import { NextResponse, type NextRequest } from "next/server";
import { verificarJWT } from "@/lib/auth/jwt";

export async function updateSession(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request,
    });

    // Extrai o token JWT do cookie
    const token = request.cookies.get('auth_token')?.value;

    // Verifica se o token é válido
    const payload = token ? verificarJWT(token) : null;

    // Rotas públicas que não precisam de autenticação
    const rotasPublicas = ["/", "/auth", "/api/auth/login"];
    const ehRotaPublica = rotasPublicas.some((rota) => 
      request.nextUrl.pathname.startsWith(rota)
    );

    // Se não tem token válido e está tentando acessar rota protegida, redireciona para login
    if (!payload && !ehRotaPublica) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (error) {
    console.error('Erro na middleware:', error);
    // Se há erro na middleware, permitir a requisição passar
    return NextResponse.next();
  }
}
