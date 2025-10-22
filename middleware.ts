import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check for Supabase auth cookies
  const authToken = request.cookies.get('sb-tiknxcrzmrgnrntlltmt-auth-token');
  
  // Protected routes - require authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isHomePage = request.nextUrl.pathname === '/';

  // Redirect to login if accessing protected route without auth token
  if (isProtectedRoute && !authToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Allow the request to continue
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
