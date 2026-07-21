import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// SEO server-side de la ficha de INICIATIVA. Igual que anuncios: título/descripción
// ya existían, pero faltaba imagen OG, twitter card y JSON-LD. La página es client;
// este layout server provee la metadata + los datos estructurados (schema Legislation).
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
  const path = `/legislacion/${id}`;
  const i = await getIniciativa(id);
  if (!i?.titulo) return { title: 'Iniciativa legislativa de IA', alternates: { canonical: path } };
  const title = str(i.titulo);
  const description =
    clip(i.descripcion, 155) || 'Iniciativa de ley sobre inteligencia artificial en México.';
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'article', siteName: 'Observatorio IA México', locale: 'es_MX', images: [OG], publishedTime: str(i.fecha) || undefined },
    twitter: { card: 'summary_large_image', title, description, images: [OG] },
  };
}

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = await getIniciativa(id);
  const jsonLd =
    i?.titulo &&
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Legislation',
      name: clip(i.titulo, 160),
      description: clip(i.descripcion, 300),
      legislationDate: str(i.fecha) || undefined,
      legislationJurisdiction: 'México',
      legislationType: 'Proposed',
      creativeWorkStatus: str(i.estatus) || str(i.status) || undefined,
      inLanguage: 'es-MX',
      sponsor: str(i.proponente) ? { '@type': 'Person', name: str(i.proponente) } : undefined,
      publisher: { '@type': 'Organization', name: 'Observatorio IA México', url: BASE },
      isBasedOn: str(i.urlGaceta) || undefined,
      mainEntityOfPage: `${BASE}/legislacion/${id}`,
    });
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      {children}
    </>
  );
}
