import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI in the Mexican State — 2026 Index',
  description: 'Annual report: Executive Branch compliance with public AI promises, legislation, case law and federalism of artificial intelligence in the Mexican state, with verifiable official sources.',
  alternates: { canonical: '/en/informe-2026', languages: { es: '/informe-2026', en: '/en/informe-2026' } },
  openGraph: {
    title: 'AI in the Mexican State — 2026 Index · Observatorio',
    description: 'What the Mexican state promised, legislated and ruled on AI — live, verified data.',
    url: '/en/informe-2026',
    type: 'article',
    locale: 'en_US',
  },
};

export default function LayoutEn({ children }: { children: ReactNode }) {
  return children;
}
