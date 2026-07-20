import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, FileDown } from 'lucide-react';
import { getFicha, getFichas, renderMarkdown, CANONICAL_BASE } from '@/lib/hemeroteca';
import '../articulo.css';

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const fichas = await getFichas();
  return fichas.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFicha(slug);
  if (!f) return { title: 'Ficha no encontrada — Hemeroteca' };
  const url = `${CANONICAL_BASE}/hemeroteca/${f.slug}`;
  return {
    title: `${f.titulo} · Hemeroteca — Observatorio IA México`,
    description: f.resumen,
    alternates: { canonical: url },
    openGraph: { title: f.titulo, description: f.resumen, url, type: 'article' },
    twitter: { card: 'summary_large_image', title: f.titulo, description: f.resumen },
  };
}

function fmtFecha(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default async function FichaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFicha(slug);
  if (!f) notFound();

  const html = renderMarkdown(f.md);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/hemeroteca" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Hemeroteca
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        {f.camara && <span className="px-2 py-0.5 rounded bg-gray-100">{f.camara}</span>}
        {f.fecha && <span>{fmtFecha(f.fecha)}</span>}
        {f.estatus && <span className="capitalize">· {f.estatus.replace(/_/g, ' ')}</span>}
        {f.proponente && <span>· {f.proponente}</span>}
      </div>

      <article className="articulo-md" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
        {f.copiaRespaldo && (
          <a href={f.copiaRespaldo} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors">
            <Download className="w-4 h-4" /> Descargar copia (PDF)
          </a>
        )}
        {f.urlGaceta && (
          <a href={f.urlGaceta} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4" /> Fuente oficial
          </a>
        )}
        <a href={`/api/hemeroteca/${f.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          <FileDown className="w-4 h-4" /> Versión Markdown
        </a>
      </div>
    </main>
  );
}
