import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// app/en/page.tsx es 'use client' (twin fiel del home ES) y no puede exportar
// `metadata` directamente — mismo patrón ya usado en app/en/legislacion/layout.tsx.
// Este layout sólo aporta el metadata de SEO/OG para la home en inglés.

export const metadata: Metadata = {
  title: { absolute: 'Observatorio IA México — AI in the Mexican State' },
  description: 'Comprehensive tracking of AI in the Mexican state. Official announcements, active legislation and judicial precedents in one place.',
  alternates: { canonical: '/en', languages: { es: '/', en: '/en', 'x-default': '/' } },
  openGraph: {
    title: 'Observatorio IA México',
    description: 'Comprehensive tracking of AI in the Mexican state. Official announcements, active legislation and judicial precedents.',
    url: '/en',
    siteName: 'Observatorio IA México',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
