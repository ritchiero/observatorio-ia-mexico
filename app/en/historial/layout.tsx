import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'History — Observatory detection log',
  description:
    'Chronological record of what Observatorio IA México’s automated monitoring detects day by day: new announcements, status changes and verified updates on the use of AI in the Mexican state.',
  alternates: { canonical: '/en/historial', languages: { es: '/historial', en: '/en/historial' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
