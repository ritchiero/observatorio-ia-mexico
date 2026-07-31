import type { Metadata } from 'next';
import Link from 'next/link';
import { Landmark } from 'lucide-react';
import { traduccionIniciativa } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'AI Legislation — federal and state bills',
  description: 'Tracking every artificial-intelligence bill in Mexico’s federal Congress and state legislatures: status, sponsors and progress.',
  alternates: { canonical: '/en/legislacion', languages: { es: '/legislacion', en: '/en/legislacion' } },
};

interface Iniciativa {
  id: string; numero?: number; titulo: string; descripcion?: string;
  proponente?: string; partido?: string; fecha?: string; camara?: string;
  estatus?: string; status?: string;
}

const ESTATUS_EN: Record<string, string> = {
  aprobada: 'Approved', archivada: 'Archived', desechada_termino: 'Discarded (term expired)',
  en_comisiones: 'In committee', en_discusion: 'Under debate', en_elaboracion: 'Drafting',
  en_proceso: 'In progress', presentada: 'Introduced', presentado: 'Introduced', publicada: 'Published',
  recibida: 'Received', rechazada: 'Rejected', turnada: 'Referred',
};

function fmt(d?: string): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
}

async function getIniciativas(): Promise<Iniciativa[]> {
  try {
    const r = await fetch(`${BASE}/api/iniciativas`, { next: { revalidate: 300 } });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data ?? d.iniciativas ?? []) as Iniciativa[];
  } catch {
    return [];
  }
}

export default async function LegislacionPageEn() {
  const iniciativas = await getIniciativas();
  const sorted = [...iniciativas].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-gray-200 bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/50 rounded-full mb-4">
            <Landmark className="w-3.5 h-3.5 text-blue-500" aria-hidden />
            <span className="text-xs font-sans-tech text-blue-600 font-medium">Bills tracked</span>
          </div>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-light text-gray-900 mb-3">
            AI <span className="italic text-blue-500">legislation</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mb-4">
            {sorted.length} bills about artificial intelligence, filed in the federal Congress and state legislatures
            across Mexico.
          </p>
          <a href="/legislacion" className="text-sm text-cyan-700 underline hover:text-cyan-800">Ver en español</a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((it) => {
            const t = traduccionIniciativa(it.id);
            const titulo = t?.titulo ?? it.titulo;
            const descripcion = t?.descripcion ?? it.descripcion;
            const estatus = (it.estatus ?? it.status ?? '').toLowerCase();
            return (
              <Link
                key={it.id}
                href={`/en/legislacion/${it.id}`}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2 text-[11px]">
                  {it.camara && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{it.camara}</span>}
                  {estatus && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ESTATUS_EN[estatus] ?? it.estatus ?? it.status}</span>}
                  {it.fecha && <span className="ml-auto font-mono text-gray-400">{fmt(it.fecha)}</span>}
                </div>
                <h3 className="font-sans-tech font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-blue-700">{titulo}</h3>
                {descripcion && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{descripcion}</p>}
                {it.proponente && <div className="text-xs text-gray-400">{it.proponente}{it.partido ? ` (${it.partido})` : ''}</div>}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
