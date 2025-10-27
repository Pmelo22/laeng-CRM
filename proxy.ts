import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|static|images|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)).*)',
  ],
};

export function proxy(request: NextRequest) {
  // Apenas passa a requisição adiante sem fazer nada
  return NextResponse.next();
}