import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Legislation — federal and state bills',
  description: 'Tracking every artificial-intelligence bill in Mexico’s federal Congress and state legislatures: status, sponsors and progress.',
  alternates: { canonical: '/en/legislacion', languages: { es: '/legislacion', en: '/en/legislacion' } },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
