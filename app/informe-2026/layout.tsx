import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Índice de IA en el Estado Mexicano 2026',
  description: 'Informe anual del Observatorio: cumplimiento de promesas del Ejecutivo, legislación, jurisprudencia y federalismo de la inteligencia artificial en el Estado mexicano, con fuentes oficiales verificables.',
  alternates: { canonical: '/informe-2026' },
  openGraph: {
    title: 'Índice de IA en el Estado Mexicano 2026 · Observatorio',
    description: 'Qué prometió, legisló y resolvió el Estado mexicano sobre IA — datos en vivo y verificados.',
    url: '/informe-2026',
    type: 'article',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
