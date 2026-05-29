import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = 'https://www.observatorio-ia-mexico.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/casos-ia/${id}`;
  try {
    const r = await fetch(`${BASE}/api/casos-ia/${id}`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const { caso } = await r.json();
      if (caso?.nombre) {
        const desc = (caso.resumen || '').replace(/\s+/g, ' ').trim().slice(0, 155)
          || 'Precedente judicial sobre inteligencia artificial en México.';
        return {
          title: caso.nombre,
          description: desc,
          alternates: { canonical: path },
          openGraph: { title: caso.nombre, description: desc, url: path, type: 'article' },
        };
      }
    }
  } catch { /* fallback abajo */ }
  return { title: 'Caso judicial de IA', alternates: { canonical: path } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
