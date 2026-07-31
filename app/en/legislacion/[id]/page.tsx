import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Landmark, ExternalLink, FileText } from 'lucide-react';
import { traduccionIniciativa } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

interface Fuente { url: string; titulo?: string; medio?: string; tipo?: string }
interface Iniciativa {
  id: string; numero?: number; titulo: string; descripcion?: string;
  proponente?: string; partido?: string; fecha?: string; camara?: string; legislatura?: string;
  estatus?: string; status?: string; tipo?: string; tematicas?: string[];
  urlGaceta?: string; urlPDFBackup?: string; fuentes?: Fuente[]; articuloSlug?: string;
}

async function getIniciativa(id: string): Promise<Iniciativa | null> {
  try {
    const r = await fetch(`${BASE}/api/iniciativas/${id}`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    const d = await r.json();
    return (d.iniciativa ?? d.data ?? null) as Iniciativa | null;
  } catch {
    return null;
  }
}

const ESTATUS_EN: Record<string, string> = {
  aprobada: 'Approved', archivada: 'Archived', desechada_termino: 'Discarded (term expired)',
  en_comisiones: 'In committee', en_discusion: 'Under debate', en_elaboracion: 'Drafting',
  en_proceso: 'In progress', presentada: 'Introduced', presentado: 'Introduced', publicada: 'Published',
  recibida: 'Received', rechazada: 'Rejected', turnada: 'Referred',
};

function fmt(d?: string): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const it = await getIniciativa(id);
  if (!it) return { title: 'Bill not found' };
  const t = traduccionIniciativa(id);
  const titulo = t?.titulo ?? it.titulo;
  return {
    title: titulo,
    description: (t?.descripcion ?? it.descripcion ?? '').slice(0, 155),
    alternates: { canonical: `/en/legislacion/${id}`, languages: { es: `/legislacion/${id}`, en: `/en/legislacion/${id}` } },
  };
}

export default async function IniciativaPageEn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = await getIniciativa(id);
  if (!it) notFound();

  const t = traduccionIniciativa(id);
  const titulo = t?.titulo ?? it.titulo;
  const descripcion = t?.descripcion ?? it.descripcion;
  const estatus = (it.estatus ?? it.status ?? '').toLowerCase();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/en" className="hover:text-cyan-700 transition-colors">Home</Link></li>
          <li aria-hidden className="text-gray-300">/</li>
          <li><Link href="/en/legislacion" className="hover:text-cyan-700 transition-colors">Legislation</Link></li>
          <li aria-hidden className="text-gray-300">/</li>
          <li aria-current="page" className="text-gray-700 truncate max-w-[55%]">{titulo}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
        {it.camara && <span className="px-2 py-0.5 rounded bg-gray-100 inline-flex items-center gap-1"><Landmark className="w-3 h-3" />{it.camara}</span>}
        {it.fecha && <time dateTime={it.fecha}>{fmt(it.fecha)}</time>}
        {estatus && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">{ESTATUS_EN[estatus] ?? it.estatus ?? it.status}</span>}
      </div>

      <h1 className="font-serif-display text-3xl sm:text-4xl font-light text-gray-900 mb-6 leading-tight">{titulo}</h1>

      {it.proponente && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <User className="w-4 h-4" />
          Sponsored by <strong className="text-gray-900">{it.proponente}</strong>{it.partido && ` (${it.partido})`}
        </div>
      )}

      {descripcion && <p className="text-gray-700 leading-relaxed mb-8">{descripcion}</p>}

      {it.articuloSlug && (
        <div className="mb-8 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-800">
          <FileText className="inline w-4 h-4 mr-1.5 -mt-0.5" />
          A full write-up of this bill is available in the{' '}
          <Link href={`/en/hemeroteca/${it.articuloSlug}`} className="underline font-medium hover:text-cyan-900">archive</Link>.
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
        {it.urlGaceta && (
          <a href={it.urlGaceta} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-4 h-4" /> Official source
          </a>
        )}
        {it.urlPDFBackup && (
          <a href={it.urlPDFBackup} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors">
            <FileText className="w-4 h-4" /> Backup copy (PDF)
          </a>
        )}
      </div>

      <div className="mt-8 flex items-center gap-1 text-xs text-gray-400">
        <Calendar className="w-3.5 h-3.5" />
        <a href={`/legislacion/${id}`} className="underline hover:text-cyan-700">Ver en español</a>
      </div>
    </main>
  );
}
