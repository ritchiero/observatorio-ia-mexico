import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Activity — Observatory log',
  description: 'Chronological record of the Observatory’s activity: new entries, updates and reclassifications of AI announcements, bills and cases in Mexico.',
  alternates: { canonical: '/en/actividad', languages: { es: '/actividad', en: '/en/actividad' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
