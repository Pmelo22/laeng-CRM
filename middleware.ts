// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
  // intercepte só o que você precisa; evite /_next, /api, /public etc.
  matcher: ['/((?!_next|api|favicon.ico|assets|static|images|.*\\.(?:png|jpg|jpeg|svg|gif|ico)).*)'],
};

export default function middleware(_req: NextRequest) {
  return NextResponse.next(); // nada de imports de libs suas aqui!
}
