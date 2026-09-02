import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import ConsentAnalytics from '@/components/ConsentAnalytics';
import { getLocale } from '@/lib/i18n/locale';


const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.observatorio-ia-mexico.com'),
  title: {
    default: 'Observatorio IA México — IA en el Estado mexicano',
    template: '%s · Observatorio IA México',
  },
  description: 'Seguimiento integral de la IA en el estado mexicano. Anuncios oficiales, legislación activa y precedentes judiciales en un solo lugar.',
  keywords: ['inteligencia artificial', 'México', 'gobierno', 'legislación IA', 'casos judiciales', 'promesas', 'IA', 'tecnología', 'SCJN'],
  authors: [{ name: 'Observatorio IA México' }],
  openGraph: {
    title: 'Observatorio IA México',
    description: 'Seguimiento integral de la IA en el estado mexicano. Anuncios oficiales, legislación activa y precedentes judiciales.',
    url: 'https://www.observatorio-ia-mexico.com',
    siteName: 'Observatorio IA México',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Observatorio IA México',
    description: 'Seguimiento integral de la IA en el estado mexicano.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
      </head>
      <body className={`${jakarta.className} min-h-screen flex flex-col bg-white antialiased`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
                  <Analytics />
        <ConsentAnalytics locale={locale} />
      </body>
    </html>
  );
}
