import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Único propósito: exponer el pathname actual a Server Components (p.ej. el
// <html lang> dinámico en app/layout.tsx para /en/*) — Next no lo expone
// directamente ahí. No toca la respuesta de ninguna otra forma.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
