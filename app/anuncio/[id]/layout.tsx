import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://www.observatorio-ia-mexico.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/anuncio/${id}`;
  try {
    const r = await fetch(`${BASE}/api/anuncios/${id}`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const { anuncio } = await r.json();
      if (anuncio?.titulo) {
        const desc = (anuncio.descripcion || '').replace(/\s+/g, ' ').trim().slice(0, 155)
          || 'Anuncio gubernamental sobre inteligencia artificial en México.';
        return {
          title: anuncio.titulo,
          description: desc,
          alternates: { canonical: path },
          openGraph: { title: anuncio.titulo, description: desc, url: path, type: 'article' },
        };
      }
    }
  } catch { /* fallback abajo */ }
  return { title: 'Anuncio de IA del Estado', alternates: { canonical: path } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
