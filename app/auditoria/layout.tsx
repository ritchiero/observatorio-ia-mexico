import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Auditoría — inventario del Observatorio',
  description: 'Inventario completo (anuncios, iniciativas, casos judiciales) del Observatorio IA México para revisión, renderizado en servidor.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/auditoria', languages: { es: '/auditoria', en: '/en/auditoria' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
