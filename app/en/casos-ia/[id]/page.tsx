import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Scale, Building, Calendar, ExternalLink, FileText } from 'lucide-react';
import { traduccionCaso } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

interface Documento { url: string; titulo?: string; tipo?: string }
interface Caso {
  id: string; nombre: string; folio?: string; estado?: string; temaIA?: string; materia?: string;
  subtema?: string; tribunalActual?: string; expedienteActual?: string;
  hechos?: string; elementoIA?: string; resumen?: string; fechaCreacion?: string;
  partes?: { actor?: string; demandado?: string; ponente?: string };
  documentos?: Documento[];
}

async function getCaso(id: string): Promise<Caso | null> {
  try {
    const r = await fetch(`${BASE}/api/casos-ia/${id}`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    const d = await r.json();
    return (d.caso ?? d.data ?? null) as Caso | null;
  } catch {
    return null;
  }
}

const ESTADO_EN: Record<string, string> = {
  resuelto: 'Resolved', en_proceso: 'In progress', pendiente: 'Pending', turnado: 'Referred',
};

function urlValida(u?: string): boolean {
  if (!u) return false;
  try { const p = new URL(u); return p.protocol === 'http:' || p.protocol === 'https:'; } catch { return false; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getCaso(id);
  if (!c) return { title: 'Case not found' };
  const t = traduccionCaso(id);
  return {
    title: t?.nombre ?? c.nombre,
    description: (t?.resumen ?? c.resumen ?? '').slice(0, 155),
    alternates: { canonical: `/en/casos-ia/${id}`, languages: { es: `/casos-ia/${id}`, en: `/en/casos-ia/${id}` } },
  };
}

export default async function CasoPageEn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCaso(id);
  if (!c) notFound();

  const t = traduccionCaso(id);
  const nombre = t?.nombre ?? c.nombre;
  const resumen = t?.resumen ?? c.resumen;
  const hechos = t?.hechos ?? c.hechos;
  const elementoIA = t?.elementoIA ?? c.elementoIA;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/en" className="hover:text-cyan-700 transition-colors">Home</Link></li>
          <li aria-hidden className="text-gray-300">/</li>
          <li><Link href="/en/casos-ia" className="hover:text-cyan-700 transition-colors">Cases</Link></li>
          <li aria-hidden className="text-gray-300">/</li>
          <li aria-current="page" className="text-gray-700 truncate max-w-[55%]">{nombre}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        {c.folio && <span className="px-2 py-0.5 rounded bg-gray-100 font-mono">{c.folio}</span>}
        {c.estado && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">{ESTADO_EN[c.estado] ?? c.estado}</span>}
        {c.tribunalActual && <span className="inline-flex items-center gap-1"><Building className="w-3 h-3" />{c.tribunalActual}</span>}
      </div>

      <h1 className="font-serif-display text-3xl sm:text-4xl font-light text-gray-900 mb-6 leading-tight">{nombre}</h1>

      {resumen && (
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">{resumen}</p>
        </section>
      )}

      {hechos && (
        <section className="mb-8">
          <h2 className="text-lg font-serif-display text-gray-900 mb-2 flex items-center gap-2"><Scale className="w-4 h-4 text-purple-500" />Facts</h2>
          <p className="text-gray-700 leading-relaxed text-sm">{hechos}</p>
        </section>
      )}

      {elementoIA && (
        <section className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h2 className="text-sm uppercase tracking-wider text-purple-700 font-semibold mb-2">Role of AI in this case</h2>
          <p className="text-gray-800 leading-relaxed text-sm">{elementoIA}</p>
        </section>
      )}

      {c.partes && (c.partes.actor || c.partes.demandado || c.partes.ponente) && (
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {c.partes.actor && <div className="rounded-lg border border-gray-200 p-3"><div className="text-xs text-gray-400 mb-1">Plaintiff</div><div className="text-gray-800">{c.partes.actor}</div></div>}
          {c.partes.demandado && <div className="rounded-lg border border-gray-200 p-3"><div className="text-xs text-gray-400 mb-1">Defendant</div><div className="text-gray-800">{c.partes.demandado}</div></div>}
          {c.partes.ponente && <div className="rounded-lg border border-gray-200 p-3"><div className="text-xs text-gray-400 mb-1">Reporting judge</div><div className="text-gray-800">{c.partes.ponente}</div></div>}
        </section>
      )}

      <section>
        <h2 className="text-lg font-serif-display text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" />Documents</h2>
        {c.documentos?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.documentos.filter((d) => urlValida(d.url)).map((d, idx) => (
              <a key={idx} href={d.url} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 hover:border-purple-300 hover:shadow-sm transition-all">
                <ExternalLink className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="line-clamp-1">{d.titulo || 'Document'}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Document unavailable</p>
        )}
      </section>

      <div className="mt-10 flex items-center gap-1 text-xs text-gray-400 border-t border-gray-200 pt-6">
        <Calendar className="w-3.5 h-3.5" />
        <a href={`/casos-ia/${id}`} className="underline hover:text-cyan-700">Ver en español</a>
      </div>
    </main>
  );
}
