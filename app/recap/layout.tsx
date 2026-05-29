import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Recap mensual — IA en el Estado mexicano',
  description: 'Resumen mensual del estado de la inteligencia artificial en el aparato estatal mexicano: anuncios, legislación, casos y veredicto del mes.',
  alternates: { canonical: '/recap' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
