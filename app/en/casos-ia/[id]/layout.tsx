import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { traduccionCaso } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = `/en/casos-ia/${id}`;
  const t = traduccionCaso(id);
  try {
    const r = await fetch(`${BASE}/api/casos-ia/${id}`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const { caso } = await r.json();
      if (caso?.nombre) {
        const nombre = t?.nombre ?? caso.nombre;
        const desc = (t?.resumen ?? caso.resumen ?? '').replace(/\s+/g, ' ').trim().slice(0, 155)
          || 'Judicial precedent on artificial intelligence in Mexico.';
        return {
          title: nombre,
          description: desc,
          alternates: { canonical: path, languages: { es: `/casos-ia/${id}`, en: path } },
          openGraph: { title: nombre, description: desc, url: path, type: 'article', locale: 'en_US' },
        };
      }
    }
  } catch { /* fallback abajo */ }
  return { title: 'AI Judicial Case', alternates: { canonical: path, languages: { es: `/casos-ia/${id}`, en: path } } };
}

export default function LayoutEn({ children }: { children: ReactNode }) {
  return children;
}
