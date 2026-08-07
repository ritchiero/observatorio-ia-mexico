import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Defaults EN para TODO /en/* (título/descr. de respaldo para rutas sin
// metadata propio, p.ej. /en/grafo). SIN alternates ni openGraph.url: esos son
// por-ruta y heredarlos aquí le pegaba el canonical '/en' a los hijos — el
// metadata completo de la home EN vive en app/en/(home)/layout.tsx.
export const metadata: Metadata = {
  title: { absolute: 'Observatorio IA México — AI in the Mexican State' },
  description: 'Comprehensive tracking of AI in the Mexican state. Official announcements, active legislation and judicial precedents in one place.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
