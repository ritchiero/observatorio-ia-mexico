import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import { traduccionCaso } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'AI Judicial Cases — Mexican precedents',
  description: 'Precedents and rulings from the Mexican judiciary where artificial intelligence is the subject of litigation or a tool in the judicial process: Supreme Court, appellate courts and administrative tribunals.',
  alternates: { canonical: '/en/casos-ia', languages: { es: '/casos-ia', en: '/en/casos-ia' } },
};

interface Caso {
  id: string; nombre: string; resumen?: string; estado?: string; temaIA?: string; materia?: string;
  tribunalActual?: string; fechaCreacion?: string; criterio?: { tiene?: boolean }; criterios?: unknown[];
}

const ESTADO_EN: Record<string, string> = {
  resuelto: 'Resolved', en_proceso: 'In progress', pendiente: 'Pending', turnado: 'Referred',
};

async function getCasos(): Promise<Caso[]> {
  try {
    const r = await fetch(`${BASE}/api/casos-ia`, { next: { revalidate: 300 } });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.casos ?? d.data ?? []) as Caso[];
  } catch {
    return [];
  }
}

export default async function CasosPageEn() {
  const casos = await getCasos();
  const sorted = [...casos].sort((a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? ''));

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200/50 rounded-full mb-4">
            <Scale className="w-3.5 h-3.5 text-purple-500" aria-hidden />
            <span className="text-xs font-sans-tech text-purple-600 font-medium">Judicial precedents</span>
          </div>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-light text-gray-900 mb-3">
            Judicial cases of <span className="italic text-purple-500">AI</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mb-4">
            {sorted.length} rulings where artificial intelligence is the subject of litigation or a tool used in the
            judicial process.
          </p>
          <a href="/casos-ia" className="text-sm text-cyan-700 underline hover:text-cyan-800">Ver en español</a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((c) => {
            const t = traduccionCaso(c.id);
            const nombre = t?.nombre ?? c.nombre;
            const resumen = t?.resumen ?? c.resumen;
            const tieneCriterio = c.criterio?.tiene || (c.criterios && c.criterios.length > 0);
            return (
              <Link
                key={c.id}
                href={`/en/casos-ia/${c.id}`}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${tieneCriterio ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {tieneCriterio ? 'Settled precedent' : 'In progress'}
                  </span>
                  {c.estado && <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">{ESTADO_EN[c.estado] ?? c.estado}</span>}
                </div>
                <h3 className="font-sans-tech font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-purple-700">{nombre}</h3>
                {resumen && <p className="text-xs text-gray-500 line-clamp-3">{resumen}</p>}
                {c.tribunalActual && <div className="mt-2 text-xs text-gray-400">{c.tribunalActual}</div>}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
