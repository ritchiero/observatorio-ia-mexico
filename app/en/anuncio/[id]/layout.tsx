import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { traduccionAnuncio } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';
const OG = `${BASE}/og-image.png`;

async function getAnuncio(id: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`${BASE}/api/anuncios/${id}`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const { anuncio } = (await r.json()) as { anuncio?: Record<string, unknown> };
    return anuncio ?? null;
  } catch {
    return null;
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const clip = (v: unknown, n: number): string => str(v).replace(/\s+/g, ' ').trim().slice(0, n);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/en/anuncio/${id}`;
  const a = await getAnuncio(id);
  if (!a?.titulo) return { title: 'AI announcement — Mexican state', alternates: { canonical: path } };
  const t = traduccionAnuncio(id);
  const title = t?.titulo ?? str(a.titulo);
  const description =
    clip(t?.descripcion ?? a.descripcion, 155) || clip(t?.resumenAgente ?? a.resumenAgente, 155) || 'Government announcement about artificial intelligence in Mexico.';
  return {
    title,
    description,
    alternates: { canonical: path, languages: { es: `/anuncio/${id}`, en: path } },
    openGraph: { title, description, url: path, type: 'article', siteName: 'Observatorio IA México', locale: 'en_US', images: [OG], publishedTime: str(a.fechaAnuncio) || undefined },
    twitter: { card: 'summary_large_image', title, description, images: [OG] },
  };
}

export default async function LayoutEn({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnuncio(id);
  const t = traduccionAnuncio(id);
  const jsonLd =
    a?.titulo &&
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: clip(t?.titulo ?? a.titulo, 110),
      description: clip(t?.descripcion ?? a.descripcion, 300) || clip(t?.resumenAgente ?? a.resumenAgente, 300),
      datePublished: str(a.fechaAnuncio) || undefined,
      dateModified: str(a.updatedAt) || str(a.fechaAnuncio) || undefined,
      inLanguage: 'en-US',
      author: { '@type': 'GovernmentOrganization', name: str(a.dependencia) || 'Government of Mexico' },
      publisher: { '@type': 'Organization', name: 'Observatorio IA México', url: BASE },
      isBasedOn: str(a.fuenteOriginal) || undefined,
      mainEntityOfPage: `${BASE}/en/anuncio/${id}`,
    });
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      {children}
    </>
  );
}
