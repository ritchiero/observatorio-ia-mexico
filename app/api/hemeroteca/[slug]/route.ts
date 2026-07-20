import { getFicha } from '@/lib/hemeroteca';

export const revalidate = 600;

// Sirve la versión Markdown cruda del artículo (para lectura, cita e indexación por LLMs).
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFicha(slug);
  if (!f) return new Response('Ficha no encontrada', { status: 404 });
  return new Response(f.md, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
