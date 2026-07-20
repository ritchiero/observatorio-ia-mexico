import type { Metadata } from 'next';
import { Archive, Building2, CheckCircle2, FileText, Landmark, MapPin, Search } from 'lucide-react';
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
  const materias = new Set(items.map((item) => item.materia)).size;
  const conPdf = items.filter((item) => item.copiaRespaldo).length;

  const stats = [
    { n: s.total, label: 'Fichas indexables', detail: 'con síntesis y fuente', Icon: Archive },
    { n: s.diputados + s.senado, label: 'Federales', detail: 'Cámara y Senado', Icon: Landmark },
    { n: s.locales, label: 'Locales', detail: 'congresos estatales', Icon: MapPin },
    { n: conPdf, label: 'PDFs respaldados', detail: `${materias} materias`, Icon: FileText },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_64%,#eef3f8_100%)]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-28 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="absolute right-[-10rem] top-16 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
          <div className="absolute left-[-12rem] bottom-[-8rem] h-80 w-80 rounded-full bg-slate-300/25 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_400px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm shadow-slate-200/40">
                <Search className="h-3.5 w-3.5 text-cyan-700" aria-hidden />
                Hemeroteca pública
              </div>
              <h1 className="max-w-4xl font-serif-display text-5xl leading-[0.96] text-slate-950 sm:text-6xl lg:text-7xl" style={{ fontWeight: 500, letterSpacing: '-0.035em' }}>
                Archivo vivo de IA en el Estado mexicano.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Documentos oficiales, iniciativas, precedentes y anuncios públicos ordenados para investigar la regulación de inteligencia artificial en México sin perder la trazabilidad.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-sm text-slate-600">
                {['Legislativo', 'Judicial', 'Ejecutivo', 'Fuentes oficiales', 'PDFs'].map((label) => (
                  <span key={label} className="rounded-lg border border-slate-200 bg-white/75 px-3 py-1.5">{label}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white/82 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cobertura</p>
                  <p className="mt-1 text-sm text-slate-600">Base documental verificada</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map(({ n, label, detail, Icon }) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <Icon className="mb-3 h-4 w-4 text-slate-400" aria-hidden />
                    <div className="font-serif-display text-4xl leading-none text-slate-950" style={{ fontWeight: 500 }}>{n}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm text-white">
                <Building2 className="h-4 w-4 text-cyan-300" aria-hidden />
                Actualiza cada 120 segundos desde fuentes publicadas.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {fichas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Aún no hay fichas publicadas.
          </div>
        ) : (
          <HemerotecaExplorer items={items} />
        )}

        <p className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-400">
          Síntesis del Observatorio IA México, verificadas contra la fuente oficial.
        </p>
      </section>
    </main>
  );
}
