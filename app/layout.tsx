import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';

const GTM_ID = 'GTM-KCCM2HNW';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
        />
        <Script
          id="gtm-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            `,
          }}
        />
      </head>
      <body className={`${jakarta.className} min-h-screen flex flex-col bg-white antialiased`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
                  <Analytics />
      </body>
    </html>
  );
}
