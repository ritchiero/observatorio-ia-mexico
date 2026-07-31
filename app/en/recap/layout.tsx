import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Monthly recap — AI in the Mexican State',
  description: 'Monthly summary of the state of artificial intelligence within the Mexican state apparatus: announcements, legislation, cases and the month’s verdict.',
  alternates: { canonical: '/en/recap', languages: { es: '/recap', en: '/en/recap' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
