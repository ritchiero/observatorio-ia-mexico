import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SessionProvider from '@/components/SessionProvider';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Observatorio IA México - Tracker de Promesas de IA',
  description: 'Tracker ciudadano de promesas de IA del gobierno mexicano. Seguimiento automatizado con fuentes verificables de cada anuncio oficial.',
  keywords: ['inteligencia artificial', 'México', 'gobierno', 'accountability', 'promesas', 'IA', 'tecnología'],
  authors: [{ name: 'Observatorio IA México' }],
  openGraph: {
    title: 'Observatorio IA México - Tracker de Promesas de IA',
    description: 'Tracker ciudadano de promesas de IA del gobierno mexicano. Monitoreo automatizado con IA.',
    url: 'https://observatorio-ia-mexico.vercel.app',
    siteName: 'Observatorio IA México',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Observatorio IA México - Tracker de Promesas de IA',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Observatorio IA México - Tracker de Promesas de IA',
    description: 'Tracker ciudadano de promesas de IA del gobierno mexicano.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jakarta.className} min-h-screen flex flex-col bg-white antialiased`}>
        <SessionProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
