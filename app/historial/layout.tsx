import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Historial — bitácora de detección del Observatorio',
  description:
    'Registro cronológico de lo que el monitoreo automatizado del Observatorio IA México detecta día a día: nuevos anuncios, cambios de estatus y actualizaciones verificadas sobre el uso de IA en el Estado mexicano.',
  alternates: { canonical: '/historial' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
