import type { Metadata } from 'next';
import Link from 'next/link';

// OIA-013: alternativa accesible al grafo — los MISMOS registros en una tabla
// server-rendered: legible sin JavaScript, navegable por teclado y archivable.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Mapa en tabla — vista accesible',
  description:
    'Todos los registros del mapa del Observatorio IA México en una tabla accesible: anuncios, iniciativas y casos, con estado, fecha y enlace.',
  alternates: { canonical: 'https://www.observatorio-ia-mexico.com/grafo/tabla' },
};

const BASE = 'https://www.observatorio-ia-mexico.com';

type Registro = {
  tipo: 'Anuncio (Ejecutivo)' | 'Iniciativa (Legislativo)' | 'Caso (Judicial)';
  titulo: string;
  estado: string;
  fecha: string;
  href: string;
};

const s = (v: unknown) => String(v ?? '').trim();
const f10 = (v: unknown) => s(v).slice(0, 10);

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
    ...arr(aR, 'data', 'anuncios').map((a): Registro => ({
      tipo: 'Anuncio (Ejecutivo)', titulo: s(a.titulo), estado: s(a.status).replace(/_/g, ' '),
      fecha: f10(a.fechaAnuncio), href: `/anuncio/${s(a.id)}`,
    })),
    ...arr(iR, 'data', 'iniciativas').map((i): Registro => ({
      tipo: 'Iniciativa (Legislativo)', titulo: s(i.titulo), estado: s(i.status ?? i.estatus).replace(/_/g, ' '),
      fecha: f10(i.fecha), href: `/legislacion/${s(i.id)}`,
    })),
    ...arr(cR, 'casos', 'data').map((c): Registro => ({
      tipo: 'Caso (Judicial)', titulo: s(c.nombre ?? c.titulo), estado: s(c.estado).replace(/_/g, ' '),
      fecha: f10(c.fechaCreacion), href: `/casos-ia/${s(c.id)}`,
    })),
  ];
  return regs.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export default async function GrafoTablaPage() {
  const registros = await getRegistros();
  const conteo = registros.reduce<Record<string, number>>((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-4">
        <Link href="/grafo" className="hover:text-cyan-700 underline">← Volver al mapa interactivo</Link>
      </nav>
      <h1 className="font-serif text-3xl text-gray-900 mb-2">El mapa, en tabla</h1>
      <p className="text-gray-600 mb-1 max-w-3xl">
        Los mismos registros del mapa interactivo, en una tabla accesible: funciona sin JavaScript,
        se navega con teclado y se puede citar o archivar.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        {Object.entries(conteo).map(([t, n]) => `${n} ${t.toLowerCase()}`).join(' · ')} ·{' '}
        <a href="/api/export?coleccion=anuncios" className="underline hover:text-cyan-700">CSV anuncios</a>{' · '}
        <a href="/api/export?coleccion=iniciativas" className="underline hover:text-cyan-700">CSV iniciativas</a>{' · '}
        <a href="/api/export?coleccion=casos" className="underline hover:text-cyan-700">CSV casos</a>
      </p>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Registros del ecosistema de IA en el Estado mexicano: tipo, título, estado y fecha.
          </caption>
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Tipo</th>
              <th scope="col" className="px-3 py-2 font-semibold">Registro</th>
              <th scope="col" className="px-3 py-2 font-semibold">Estado</th>
              <th scope="col" className="px-3 py-2 font-semibold">Fecha</th>
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
