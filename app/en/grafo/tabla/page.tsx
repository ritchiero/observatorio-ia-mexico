import type { Metadata } from 'next';
import Link from 'next/link';
import { enteDeLabel } from '@/lib/entes';
import { ENTE_NOMBRE_EN } from '@/lib/i18n/labels-en';
import anunciosEn from '@/data/i18n/en/anuncios.json';
import iniciativasEn from '@/data/i18n/en/iniciativas.json';
import casosEn from '@/data/i18n/en/casos.json';

// Twin en inglés de app/grafo/tabla/page.tsx — mismo catálogo completo, mismo
// clasificador de entes (lib/entes.ts es idioma-neutral), overlay de traducción.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Map as a table — accessible view',
  description:
    'Every record on the Observatorio IA México map in an accessible table: announcements, bills and cases, with status, date and link.',
  alternates: {
    canonical: 'https://www.observatorio-ia-mexico.com/en/grafo/tabla',
    languages: { es: 'https://www.observatorio-ia-mexico.com/grafo/tabla', en: 'https://www.observatorio-ia-mexico.com/en/grafo/tabla' },
  },
};

const BASE = 'https://www.observatorio-ia-mexico.com';

type Registro = { tipo: string; titulo: string; estado: string; fecha: string; href: string };

const s = (v: unknown) => String(v ?? '').trim();
const f10 = (v: unknown) => s(v).slice(0, 10);
const anunciosT = anunciosEn as Record<string, { titulo?: string }>;
const iniciativasT = iniciativasEn as Record<string, { titulo?: string }>;
const casosT = casosEn as Record<string, { nombre?: string }>;

const ESTADO_EN: Record<string, string> = {
  operando: 'operating', 'en desarrollo': 'in development', prometido: 'promised',
  incumplido: 'broken', concluido: 'concluded', abandonado: 'abandoned',
  turnada: 'referred', aprobada: 'approved', publicada: 'published', 'en comisiones': 'in committee',
  'en discusion': 'under debate', presentada: 'introduced', resuelto: 'resolved', 'en proceso': 'in progress',
};
const estadoEn = (raw: string) => ESTADO_EN[raw.toLowerCase()] ?? raw;

async function getRegistros(): Promise<Registro[]> {
  const arr = (j: unknown, ...keys: string[]): Record<string, unknown>[] => {
    if (Array.isArray(j)) return j as Record<string, unknown>[];
    for (const k of keys) {
      const v = (j as Record<string, unknown>)?.[k];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
    return [];
  };
  const [aR, iR, cR] = await Promise.all([
    fetch(`${BASE}/api/anuncios?limit=500`, { next: { revalidate: 300 } }).then((r) => r.json()).catch(() => null),
    fetch(`${BASE}/api/iniciativas`, { next: { revalidate: 300 } }).then((r) => r.json()).catch(() => null),
    fetch(`${BASE}/api/casos-ia`, { next: { revalidate: 300 } }).then((r) => r.json()).catch(() => null),
  ]);
  const regs: Registro[] = [
    ...arr(aR, 'data', 'anuncios').map((a): Registro => {
      const ente = enteDeLabel(s(a.dependencia) || s(a.responsable), 'ejecutivo') ?? 'ejecutivo';
      const id = s(a.id);
      return {
        tipo: `Announcement (${ENTE_NOMBRE_EN[ente]})`,
        titulo: anunciosT[id]?.titulo ?? s(a.titulo),
        estado: estadoEn(s(a.status).replace(/_/g, ' ')),
        fecha: f10(a.fechaAnuncio), href: `/en/anuncio/${id}`,
      };
    }),
    ...arr(iR, 'data', 'iniciativas').map((i): Registro => {
      const id = s(i.id);
      return {
        tipo: 'Bill (Legislative)',
        titulo: iniciativasT[id]?.titulo ?? s(i.titulo),
        estado: estadoEn(s(i.status ?? i.estatus).replace(/_/g, ' ')),
        fecha: f10(i.fecha), href: `/en/legislacion/${id}`,
      };
    }),
    ...arr(cR, 'casos', 'data').map((c): Registro => {
      const id = s(c.id);
      return {
        tipo: 'Case (Judicial)',
        titulo: casosT[id]?.nombre ?? s(c.nombre ?? c.titulo),
        estado: estadoEn(s(c.estado).replace(/_/g, ' ')),
        fecha: f10(c.fechaCreacion), href: `/en/casos-ia/${id}`,
      };
    }),
    {
      tipo: 'Experiment (Legal-IA-Lab)',
      titulo: 'Rompehielos INDAUTOR (Icebreaker) — AI-generated works, Legal-IA-Lab',
      estado: 'in progress',
      fecha: '2026-05-29',
      href: 'https://aldoricardo.com/Legal-IA-Lab/Rompehielos-Indautor-Obras-generadas-con-IA',
    },
  ];
  return regs.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export default async function GrafoTablaPageEn() {
  const registros = await getRegistros();
  const conteo = registros.reduce<Record<string, number>>((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-4">
        <Link href="/en/grafo" className="hover:text-cyan-700 underline">← Back to the interactive map</Link>
      </nav>
      <h1 className="font-serif text-3xl text-gray-900 mb-2">The map, as a table</h1>
      <p className="text-gray-600 mb-1 max-w-3xl">
        The complete catalog of Observatory records in an accessible table: works without
        JavaScript, navigable by keyboard, citable and archivable. Includes the lab experiment;
        the interactive map only draws the subset with enough connections.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        {Object.entries(conteo).map(([t, n]) => `${n} ${t.toLowerCase()}`).join(' · ')} ·{' '}
        <a href="/api/export?coleccion=anuncios" className="underline hover:text-cyan-700">CSV announcements</a>{' · '}
        <a href="/api/export?coleccion=iniciativas" className="underline hover:text-cyan-700">CSV bills</a>{' · '}
        <a href="/api/export?coleccion=casos" className="underline hover:text-cyan-700">CSV cases</a>
      </p>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Records of the AI ecosystem in the Mexican state: type, title, status and date.
          </caption>
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Type</th>
              <th scope="col" className="px-3 py-2 font-semibold">Record</th>
              <th scope="col" className="px-3 py-2 font-semibold">Status</th>
              <th scope="col" className="px-3 py-2 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registros.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{r.tipo}</td>
                <td className="px-3 py-2">
                  <Link href={r.href} className="text-gray-900 hover:text-cyan-700 underline decoration-gray-300">
                    {r.titulo}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap capitalize text-gray-600">{r.estado || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-gray-500">
                  {r.fecha ? <time dateTime={r.fecha}>{r.fecha}</time> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
