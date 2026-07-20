import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { getFichas, facetasDe, materiaDe, camaraGrupo, estatusGrupo, anioDe, CANONICAL_BASE, type FichaHemeroteca } from '@/lib/hemeroteca';
import HemerotecaExplorer from '@/components/HemerotecaExplorer';

// Server-rendered con ISR: las tarjetas van en el HTML inicial → indexables.
// El explorador (cliente) filtra/busca sobre ellas por progressive enhancement.
export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Hemeroteca — Observatorio IA México',
  description:
    'Archivo abierto de la inteligencia artificial en el Estado mexicano: cada iniciativa, caso y anuncio con su síntesis verificada y una copia permanente del documento original. Búsqueda con IA y filtros por materia.',
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

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function textoBusqueda(f: FichaHemeroteca): string {
  return norm([f.titulo, f.resumen, f.proponente, (f.tematicas ?? []).join(' ')].filter(Boolean).join(' '));
}

export default async function HemerotecaPage() {
  const fichas = await getFichas();
  const facetas = facetasDe(fichas);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-sm font-semibold tracking-wide text-cyan-700 uppercase">Hemeroteca</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Archivo de la IA en el Estado mexicano</h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Cada documento queda aquí con una <strong>síntesis</strong> verificada, la <strong>ficha oficial</strong> y una{' '}
          <strong>copia permanente</strong> del PDF. {fichas.length} fichas — busca por tema o pregúntale a la IA.
        </p>
      </header>

      {fichas.length === 0 ? (
        <p className="text-gray-500">Aún no hay fichas publicadas.</p>
      ) : (
        <>
          <HemerotecaExplorer facetas={facetas} total={fichas.length} />

          <ul className="space-y-4">
            {fichas.map((f) => (
              <li
                key={f.id}
                data-ficha
                data-slug={f.slug}
                data-text={textoBusqueda(f)}
                data-materia={materiaDe(f)}
                data-camara={camaraGrupo(f.camara)}
                data-estatus={estatusGrupo(f.estatus)}
                data-anio={anioDe(f.fecha)}
                className="group rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-sm transition-all"
              >
                <Link href={`/hemeroteca/${f.slug}`} className="block p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium">
                      {materiaDe(f)}
                    </span>
                    <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {f.camara ?? 'Legislativo'}</span>
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
        </>
      )}

      <p className="mt-10 text-xs text-gray-400 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> Síntesis del Observatorio IA México, verificadas contra la fuente oficial.
      </p>
    </main>
  );
}
