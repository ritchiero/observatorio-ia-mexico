import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// SEO server-side de la ficha de ANUNCIO. Un observatorio vive de ser citado, así
// que cada liga compartida debe traer imagen y datos estructurados propios: antes
// tenía título/descripción pero NO imagen OG ni JSON-LD (Next reemplaza el objeto
// openGraph, y sin `images` la ficha se compartía sin imagen). La página es client;
// este layout server provee la metadata + el JSON-LD.
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
  const path = `/anuncio/${id}`;
  const a = await getAnuncio(id);
  if (!a?.titulo) return { title: 'Anuncio de IA del Estado', alternates: { canonical: path } };
  const title = str(a.titulo);
  const description =
    clip(a.descripcion, 155) || clip(a.resumenAgente, 155) || 'Anuncio gubernamental sobre inteligencia artificial en México.';
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'article', siteName: 'Observatorio IA México', locale: 'es_MX', images: [OG], publishedTime: str(a.fechaAnuncio) || undefined },
    twitter: { card: 'summary_large_image', title, description, images: [OG] },
  };
}

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnuncio(id);
  const jsonLd =
    a?.titulo &&
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: clip(a.titulo, 110),
      description: clip(a.descripcion, 300) || clip(a.resumenAgente, 300),
      datePublished: str(a.fechaAnuncio) || undefined,
      dateModified: str(a.updatedAt) || str(a.fechaAnuncio) || undefined,
      inLanguage: 'es-MX',
      author: { '@type': 'GovernmentOrganization', name: str(a.dependencia) || 'Gobierno de México' },
      publisher: { '@type': 'Organization', name: 'Observatorio IA México', url: BASE },
      isBasedOn: str(a.fuenteOriginal) || undefined,
      mainEntityOfPage: `${BASE}/anuncio/${id}`,
    });
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      {children}
    </>
  );
}
