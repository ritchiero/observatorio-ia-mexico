import type { Metadata } from 'next';
import { FileText, Landmark, MapPin } from 'lucide-react';
import { getFichas, toItem, statsDe, CANONICAL_BASE } from '@/lib/hemeroteca';
import HemerotecaExplorer from '@/components/HemerotecaExplorer';

// Server-rendered con ISR: las tarjetas van en el HTML inicial (SSR del client
// component) → indexables. El explorador filtra/ordena/busca tras la hidratación.
export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Hemeroteca — Observatorio IA México',
  description:
    'Archivo verificado de documentos del Poder Legislativo y Judicial, y del Poder Ejecutivo, relacionados con inteligencia artificial en México. Búsqueda con IA y filtros por materia, cámara, estatus y año.',
  alternates: { canonical: `${CANONICAL_BASE}/hemeroteca` },
  openGraph: {
    title: 'Hemeroteca de la IA en el Estado mexicano',
    description: 'Archivo verificado de documentos sobre inteligencia artificial en el Estado mexicano, con búsqueda por IA y filtros.',
    url: `${CANONICAL_BASE}/hemeroteca`,
    type: 'website',
  },
};

export default async function HemerotecaPage() {
  const fichas = await getFichas();
  const items = fichas.map(toItem);
  const s = statsDe(fichas);

  const stats = [
    { n: s.total, label: 'Fichas verificadas', Icon: FileText },
    { n: s.diputados, label: 'Diputados', Icon: Landmark },
    { n: s.senado, label: 'Senado', Icon: Landmark },
    { n: s.locales, label: 'Congresos locales', Icon: MapPin },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">Hemeroteca</p>
        <h1 className="font-serif-display text-4xl md:text-5xl leading-[1.05] text-gray-900 mt-2" style={{ fontWeight: 500, letterSpacing: '-0.02em' }}>
          Hemeroteca de la IA<br />en el Estado mexicano
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl">
          Archivo verificado de documentos del Poder Legislativo y Judicial, y del Poder Ejecutivo, relacionados con inteligencia artificial en México.
        </p>
      </header>

      {fichas.length === 0 ? (
        <p className="text-gray-500">Aún no hay fichas publicadas.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {stats.map(({ n, label, Icon }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-serif-display text-3xl text-gray-900" style={{ fontWeight: 500 }}>{n}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
                <Icon className="w-5 h-5 text-gray-300" aria-hidden />
              </div>
            ))}
          </div>

          <HemerotecaExplorer items={items} />
        </>
      )}

      <p className="mt-10 text-xs text-gray-400">
        Síntesis del Observatorio IA México, verificadas contra la fuente oficial.
      </p>
    </main>
  );
}
