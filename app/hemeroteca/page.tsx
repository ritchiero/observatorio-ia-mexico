import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { getFichas, CANONICAL_BASE } from '@/lib/hemeroteca';

// Server-rendered con ISR: el contenido va en el HTML inicial → indexable.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Hemeroteca — Observatorio IA México',
  description:
    'Archivo abierto de la inteligencia artificial en el Estado mexicano: cada iniciativa, caso y anuncio con su síntesis verificada y una copia permanente del documento original.',
  alternates: { canonical: `${CANONICAL_BASE}/hemeroteca` },
  openGraph: {
    title: 'Hemeroteca — Observatorio IA México',
    description: 'Síntesis verificadas y copias permanentes de los documentos sobre IA en el Estado mexicano.',
    url: `${CANONICAL_BASE}/hemeroteca`,
    type: 'website',
  },
};

function fmtFecha(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default async function HemerotecaPage() {
  const fichas = await getFichas();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold tracking-wide text-cyan-700 uppercase">Hemeroteca</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Archivo de la IA en el Estado mexicano</h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Cada documento que entra al observatorio queda aquí con tres capas: una <strong>síntesis</strong> verificada
          contra la fuente, un enlace a la <strong>ficha oficial</strong> y una <strong>copia permanente</strong> del
          PDF. {fichas.length} {fichas.length === 1 ? 'ficha disponible' : 'fichas disponibles'}.
        </p>
      </header>

      {fichas.length === 0 ? (
        <p className="text-gray-500">Aún no hay fichas publicadas.</p>
      ) : (
        <ul className="space-y-4">
          {fichas.map((f) => (
            <li key={f.id} className="group rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-sm transition-all">
              <Link href={`/hemeroteca/${f.slug}`} className="block p-5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{f.camara ?? 'Legislativo'}</span>
                  {f.fecha && <span>· {fmtFecha(f.fecha)}</span>}
                  {f.estatus && <span className="capitalize">· {f.estatus.replace(/_/g, ' ')}</span>}
                </div>
                <h2 className="mt-1.5 text-lg font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                  {f.titulo}
                </h2>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{f.resumen}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-xs text-gray-400 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> Síntesis del Observatorio IA México, verificadas contra la fuente oficial.
      </p>
    </main>
  );
}
