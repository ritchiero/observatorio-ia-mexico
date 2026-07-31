import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, ExternalLink, FileDown } from 'lucide-react';
import { getFichaEn, getFichasEn, renderMarkdown, buildTitleEn, buildDescriptionEn, jsonLdGraphEn, CANONICAL_BASE } from '@/lib/hemeroteca';
import '../../../hemeroteca/articulo.css';

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  const fichas = await getFichasEn();
  return fichas.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFichaEn(slug);
  if (!f) return { title: 'Record not found — Archive' };
  const url = `${CANONICAL_BASE}/en/hemeroteca/${f.slug}`;
  const title = buildTitleEn(f);
  const description = buildDescriptionEn(f);
  const image = `${CANONICAL_BASE}/og-image.png`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: { es: `${CANONICAL_BASE}/hemeroteca/${f.slug}`, en: url },
    },
    openGraph: { title, description, url, type: 'article', siteName: 'Observatorio IA México', locale: 'en_US', images: [image], publishedTime: f.fecha },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

function fmtFecha(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default async function FichaPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFichaEn(slug);
  if (!f) notFound();

  const html = renderMarkdown(f.md);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdGraphEn(f) }} />

      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/en" className="hover:text-cyan-700 transition-colors">Home</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li><Link href="/en/hemeroteca" className="hover:text-cyan-700 transition-colors">Archive</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li aria-current="page" className="text-gray-700 truncate max-w-[55%]">{f.titulo}</li>
        </ol>
      </nav>

      <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Machine-translated from the Spanish original by the Observatorio&apos;s editorial pipeline. Official names of
        laws, courts and agencies are kept in Spanish with an English gloss.{' '}
        <a href={`/hemeroteca/${f.slug}`} className="underline font-medium hover:text-amber-900">Ver en español</a>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        {f.camara && <span className="px-2 py-0.5 rounded bg-gray-100">{f.camara}</span>}
        {f.fecha && <time dateTime={f.fecha}>{fmtFecha(f.fecha)}</time>}
        {f.estatus && <span className="capitalize">· {f.estatus.replace(/_/g, ' ')}</span>}
        {f.proponente && <span>· {f.proponente}</span>}
      </div>

      <article className="articulo-md" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
        {f.copiaRespaldo && (
          <a href={f.copiaRespaldo} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors">
            <Download className="w-4 h-4" /> Download copy (PDF)
          </a>
        )}
        {f.urlGaceta && (
          <a href={f.urlGaceta} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4" /> Official source
          </a>
        )}
        <a href={`/api/hemeroteca/${f.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          <FileDown className="w-4 h-4" /> Markdown version
        </a>
      </div>
    </main>
  );
}
