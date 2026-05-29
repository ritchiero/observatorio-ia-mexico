import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Legislación en IA — iniciativas federales y estatales',
  description: 'Seguimiento de todas las iniciativas de ley sobre inteligencia artificial en el Congreso federal y los congresos estatales de México: estatus, proponentes y trámite.',
  alternates: { canonical: '/legislacion' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
