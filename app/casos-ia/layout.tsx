import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Casos judiciales de IA — precedentes en México',
  description: 'Precedentes y resoluciones del Poder Judicial mexicano donde la inteligencia artificial es objeto del litigio o herramienta del proceso: SCJN, tribunales colegiados y TFJA.',
  alternates: { canonical: '/casos-ia' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
