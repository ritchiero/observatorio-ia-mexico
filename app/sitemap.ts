import type { MetadataRoute } from 'next';

const BASE = 'https://www.observatorio-ia-mexico.com';

// Regenera el sitemap cada hora (ISR) — así corre en runtime donde sí hay
// credenciales y datos, y captura nuevas fichas sin redeploy.
export const revalidate = 3600;

async function fetchIds(path: string, key: string): Promise<string[]> {
  try {
    const r = await fetch(`${BASE}${path}`, { next: { revalidate } });
    if (!r.ok) return [];
    const d = await r.json();
    const arr: Array<{ id?: string }> = d[key] || d.data || [];
    return arr.map((x) => x.id).filter((id): id is string => Boolean(id));
  } catch {
    return [];
  }
}

// Fichas de hemeroteca (iniciativas con artículo publicado), con su fecha real.
async function fetchHemeroteca(): Promise<Array<{ slug: string; fecha?: string; estatus?: string }>> {
  try {
    const r = await fetch(`${BASE}/api/iniciativas`, { next: { revalidate } });
    if (!r.ok) return [];
    const d = await r.json();
    const arr: Array<{ articuloSlug?: string; articuloMD?: string; fecha?: string; estatus?: string; status?: string }> = d.data || [];
    return arr
      .filter((x) => x.articuloMD && x.articuloSlug)
      .map((x) => ({ slug: x.articuloSlug as string, fecha: x.fecha, estatus: x.estatus ?? x.status }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [anuncios, iniciativas, casos, hemeroteca] = await Promise.all([
    fetchIds('/api/anuncios', 'anuncios'),
    fetchIds('/api/iniciativas', 'data'),
    fetchIds('/api/casos-ia', 'casos'),
    fetchHemeroteca(),
  ]);

  const now = new Date();
  const fechaDe = (iso?: string) => {
    const d = iso ? new Date(iso) : now;
    return Number.isNaN(d.getTime()) ? now : d;
  };

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/legislacion`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/casos-ia`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/hemeroteca`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/recap`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/actividad`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE}/proceso-legislativo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const fichas: MetadataRoute.Sitemap = [
    ...anuncios.map((id) => ({ url: `${BASE}/anuncio/${id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...iniciativas.map((id) => ({ url: `${BASE}/legislacion/${id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...casos.map((id) => ({ url: `${BASE}/casos-ia/${id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 })),
    // Fichas de hemeroteca: contenido server-rendered → alta prioridad de indexación.
    // lastModified real (no `now`) para no mentirle a Google sobre la frescura.
    ...hemeroteca.map((f) => ({
      url: `${BASE}/hemeroteca/${f.slug}`,
      lastModified: fechaDe(f.fecha),
      changeFrequency: (f.estatus === 'turnada' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: 0.7,
    })),
  ];

  return [...estaticas, ...fichas];
}
