import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Audit — Observatory inventory',
  description: 'Complete inventory (announcements, bills, judicial cases) of Observatorio IA México for review, server-rendered.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/en/auditoria', languages: { es: '/auditoria', en: '/en/auditoria' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
