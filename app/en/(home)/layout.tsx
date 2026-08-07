import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata completo de la home EN, scoped a este route group para que el
// canonical '/en' y el og.url NO se hereden a /en/* (CodeRabbit en PR #81:
// /en/grafo terminaba con canonical '/en'). Los defaults compartidos de /en/*
// (título/descripción) siguen en app/en/layout.tsx, ya sin alternates.
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
