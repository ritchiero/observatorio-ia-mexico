import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// La portada (app/(portada)/page.tsx) es 'use client' y no puede exportar
// metadata. Este layout de route group existe SOLO para darle canonical y
// hreflang a "/" sin heredárselos al resto de rutas (ponerlos en el layout
// raíz los cascadearía a toda página sin alternates propios, p.ej. /grafo).
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { es: '/', en: '/en', 'x-default': '/' },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
