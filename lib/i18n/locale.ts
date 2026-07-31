import { headers } from 'next/headers';
import type { Locale } from './dictionary';

/** Locale del request actual, vía el header x-pathname que pone middleware.ts. */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';
  return pathname.startsWith('/en') ? 'en' : 'es';
}
