import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Judicial Cases — precedents in Mexico',
  description: 'Precedents and rulings from the Mexican Judiciary where artificial intelligence is the subject of litigation or a tool in the process: SCJN (Supreme Court), Collegiate Tribunals and the TFJA (Federal Administrative Justice Tribunal).',
  alternates: { canonical: '/en/casos-ia', languages: { es: '/casos-ia', en: '/en/casos-ia' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
