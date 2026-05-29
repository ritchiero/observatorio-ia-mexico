import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Actividad — bitácora del Observatorio',
  description: 'Registro cronológico de la actividad del Observatorio: altas, actualizaciones y reclasificaciones de anuncios, iniciativas y casos de IA en México.',
  alternates: { canonical: '/actividad' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
