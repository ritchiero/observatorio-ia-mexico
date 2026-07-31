import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Building2, Clock, ExternalLink, Newspaper } from 'lucide-react';
import { traduccionAnuncio } from '@/lib/i18n/traducciones';

const BASE = 'https://www.observatorio-ia-mexico.com';

interface Fuente { url: string; titulo?: string; tipo?: string; medio?: string; fecha?: string }
interface Anuncio {
  id: string; titulo: string; descripcion: string; status: string;
  responsable: string; dependencia: string; fechaAnuncio?: string; fechaPrometida?: string;
  resumenAgente?: string; fuenteOriginal?: string; fuentes?: Fuente[];
}

async function getAnuncio(id: string): Promise<Anuncio | null> {
  try {
    const r = await fetch(`${BASE}/api/anuncios/${id}`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const { anuncio } = (await r.json()) as { anuncio?: Anuncio };
    return anuncio ?? null;
  } catch {
    return null;
  }
}

const STATUS_LABEL_EN: Record<string, string> = {
  operando: 'Operating', en_desarrollo: 'In development', prometido: 'Promised',
  incumplido: 'Broken', concluido: 'Concluded', abandonado: 'Abandoned',
};
const STATUS_COLOR: Record<string, string> = {
  operando: 'bg-emerald-500', en_desarrollo: 'bg-blue-500', prometido: 'bg-gray-400',
  incumplido: 'bg-red-500', concluido: 'bg-teal-500', abandonado: 'bg-gray-500',
};

function fmt(d?: string): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; }
}

function esDominioOficial(url?: string): boolean {
  try {
    const h = new URL(url ?? '').hostname.toLowerCase();
    return h === 'gob.mx' || h.endsWith('.gob.mx') || h === 'unam.mx' || h.endsWith('.unam.mx');
  } catch {
    return false;
  }
}

export default async function AnuncioPageEn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anuncio = await getAnuncio(id);
  if (!anuncio) notFound();

  const t = traduccionAnuncio(id);
  const titulo = t?.titulo ?? anuncio.titulo;
  const descripcion = t?.descripcion ?? anuncio.descripcion;
  const resumenAgente = t?.resumenAgente ?? anuncio.resumenAgente;

  const fuentes = anuncio.fuentes ?? (anuncio.fuenteOriginal ? [{ url: anuncio.fuenteOriginal, titulo: 'Original source', tipo: 'anuncio_original' }] : []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <Link href="/en" className="mb-6 sm:mb-8 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors group w-fit">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to the observatory
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white ${STATUS_COLOR[anuncio.status] ?? 'bg-gray-500'}`}>
              {STATUS_LABEL_EN[anuncio.status] ?? anuncio.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light font-serif-display leading-tight mb-6">{titulo}</h1>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mb-8">{descripcion}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <InfoCard icon={<Calendar size={18} />} label="Announced on" value={fmt(anuncio.fechaAnuncio)} />
            <InfoCard icon={<User size={18} />} label="Announced by" value={anuncio.responsable} />
            <InfoCard icon={<Building2 size={18} />} label="Agency" value={anuncio.dependencia} />
            {anuncio.fechaPrometida && <InfoCard icon={<Clock size={18} />} label="Promised for" value={fmt(anuncio.fechaPrometida)} />}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {resumenAgente && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h2 className="text-sm uppercase tracking-wider text-amber-700 font-semibold">Automated monitoring findings</h2>
            </div>
            <p className="text-gray-800 leading-relaxed">{resumenAgente}</p>
            <p className="mt-3 text-xs text-amber-700">Automated verification (AI) · pending human review</p>
          </section>
        )}

        <section>
          <h2 className="text-xl sm:text-2xl font-light font-serif-display text-gray-900 mb-6 flex items-center gap-3">
            <Newspaper className="text-blue-500" size={24} />
            Coverage and sources
          </h2>
          {fuentes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fuentes.map((f, idx) => (
                <a key={idx} href={f.url} target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all">
                  <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-white px-2 py-0.5 rounded-full bg-blue-600 mb-2">
                    {f.tipo === 'anuncio_original' && !esDominioOficial(f.url) ? 'Documented' : 'Official'}
                  </span>
                  <h3 className="font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{f.titulo || f.medio || 'Source'}</h3>
                  <div className="flex items-center gap-1 mt-3 text-xs text-blue-500">
                    <span>Read more</span>
                    <ExternalLink size={10} />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Newspaper className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500 text-sm">No sources on file for this announcement.</p>
            </div>
          )}
        </section>

        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About this tracking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This record is monitored by AI agents that track news and official statements. The month-by-month
                follow-up timeline is available on the{' '}
                <a href={`/anuncio/${id}`} className="text-cyan-700 underline hover:text-cyan-800">Spanish version</a> of
                this page.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center gap-2 text-white/60 mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white font-medium truncate" title={value}>{value}</p>
    </div>
  );
}
