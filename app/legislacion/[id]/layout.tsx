import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://www.observatorio-ia-mexico.com';

// Metadata única por ficha (la página es client; este layout server la provee).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/legislacion/${id}`;
  try {
    const r = await fetch(`${BASE}/api/iniciativas/${id}`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const { iniciativa } = await r.json();
      if (iniciativa?.titulo) {
        const desc = (iniciativa.descripcion || '').replace(/\s+/g, ' ').trim().slice(0, 155)
          || 'Iniciativa de ley sobre inteligencia artificial en México.';
        return {
          title: iniciativa.titulo,
          description: desc,
          alternates: { canonical: path },
          openGraph: { title: iniciativa.titulo, description: desc, url: path, type: 'article' },
        };
      }
    }
  } catch { /* fallback abajo */ }
  return { title: 'Iniciativa legislativa de IA', alternates: { canonical: path } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
