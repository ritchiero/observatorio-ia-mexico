import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { traduccionIniciativa } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';
const OG = `${BASE}/og-image.png`;

async function getIniciativa(id: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`${BASE}/api/iniciativas/${id}`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const { iniciativa } = (await r.json()) as { iniciativa?: Record<string, unknown> };
    return iniciativa ?? null;
  } catch {
    return null;
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const clip = (v: unknown, n: number): string => str(v).replace(/\s+/g, ' ').trim().slice(0, n);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/en/legislacion/${id}`;
  const i = await getIniciativa(id);
  const t = traduccionIniciativa(id);
  if (!i?.titulo) return { title: 'AI Legislative Bill', alternates: { canonical: path, languages: { es: `/legislacion/${id}`, en: path } } };
  const title = t?.titulo ?? str(i.titulo);
  const description =
    clip(t?.descripcion ?? i.descripcion, 155) || 'Bill about artificial intelligence in Mexico.';
  return {
    title,
    description,
    alternates: { canonical: path, languages: { es: `/legislacion/${id}`, en: path } },
    openGraph: { title, description, url: path, type: 'article', siteName: 'Observatorio IA México', locale: 'en_US', images: [OG], publishedTime: str(i.fecha) || undefined },
    twitter: { card: 'summary_large_image', title, description, images: [OG] },
  };
}

export default async function LayoutEn({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = await getIniciativa(id);
  const t = traduccionIniciativa(id);
  const jsonLd =
    i?.titulo &&
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Legislation',
      name: clip(t?.titulo ?? i.titulo, 160),
      description: clip(t?.descripcion ?? i.descripcion, 300),
      legislationDate: str(i.fecha) || undefined,
      legislationJurisdiction: 'Mexico',
      legislationType: 'Proposed',
      creativeWorkStatus: str(i.estatus) || str(i.status) || undefined,
      inLanguage: 'en-US',
      sponsor: str(i.proponente) ? { '@type': 'Person', name: str(i.proponente) } : undefined,
      publisher: { '@type': 'Organization', name: 'Observatorio IA México', url: BASE },
      isBasedOn: str(i.urlGaceta) || undefined,
      mainEntityOfPage: `${BASE}/en/legislacion/${id}`,
    });
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      {children}
    </>
  );
}
