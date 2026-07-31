import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Dos responsabilidades:
// 1) Exponer x-pathname a Server Components (el <html lang> dinámico de app/layout.tsx).
// 2) Idioma automático SOLO en la portada "/": visitantes fuera de México cuyo
//    navegador no lista español en Accept-Language van a /en con 302 temporal.
//    La elección explícita del switcher (?hl=es|en) se guarda en cookie un año
//    y siempre gana sobre la detección. Nunca se redirigen rutas profundas
//    (un link compartido a /legislacion/x es intencional), ni bots (los
//    crawlers deben indexar la portada ES tal cual; hreflang ya anuncia /en),
//    ni requests sin Accept-Language.
// OJO: este archivo debe llamarse proxy.ts — la convención middleware.ts está
// rota en esta versión de Next (deja TODO el sitio en blanco, 200 con 0 bytes).

const COOKIE_IDIOMA = 'hl';
const UN_ANIO = 60 * 60 * 24 * 365;
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram/i;

function esPrefetch(req: NextRequest): boolean {
  return (
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('x-middleware-prefetch') === '1' ||
    (req.headers.get('sec-purpose') ?? req.headers.get('purpose') ?? '').includes('prefetch')
  );
}

// "Hablante de español" = el navegador lista es/es-* en cualquier posición de
// Accept-Language (regla conservadora: ante la duda, español). Sin header no
// hay señal (curl pelón, la mayoría de los crawlers) → null → no redirigir.
function navegadorListaEspanol(req: NextRequest): boolean | null {
  const al = req.headers.get('accept-language');
  if (!al) return null;
  return al
    .toLowerCase()
    .split(',')
    .some((parte) => {
      const tag = parte.trim().split(';')[0];
      return tag === 'es' || tag.startsWith('es-');
    });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Switcher explícito: cualquier URL con ?hl=es|en fija la cookie y redirige
  // a la misma URL sin el parámetro. Los links del switcher son <a> planos
  // (sin prefetch), pero el guard de prefetch evita fijar cookie por accidente.
  const hl = request.nextUrl.searchParams.get('hl');
  if ((hl === 'es' || hl === 'en') && !esPrefetch(request)) {
    const limpio = request.nextUrl.clone();
    limpio.searchParams.delete('hl');
    const res = NextResponse.redirect(limpio, 302);
    res.cookies.set(COOKIE_IDIOMA, hl, { path: '/', maxAge: UN_ANIO, sameSite: 'lax' });
    return res;
  }

  if (
    pathname === '/' &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    !esPrefetch(request) &&
    !BOT_RE.test(request.headers.get('user-agent') ?? '')
  ) {
    const aEn = () => {
      const destino = request.nextUrl.clone();
      destino.pathname = '/en';
      return NextResponse.redirect(destino, 302);
    };
    const preferencia = request.cookies.get(COOKIE_IDIOMA)?.value;
    if (preferencia === 'en') return aEn();
    if (preferencia !== 'es') {
      // x-vercel-ip-country lo pone (y protege contra spoofing) Vercel; en dev
      // local no existe → cuenta como "fuera de México" y decide Accept-Language.
      const pais = request.headers.get('x-vercel-ip-country');
      if (navegadorListaEspanol(request) === false && pais !== 'MX') return aEn();
    }
  }

  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
