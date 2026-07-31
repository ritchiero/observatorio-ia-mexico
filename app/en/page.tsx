import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CANONICAL_BASE } from '@/lib/hemeroteca';
import { STATUS_ANUNCIO } from '@/lib/estados';
import { traduccionAnuncio, traduccionCaso } from '@/lib/i18n/traducciones';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'Observatorio IA México — AI in the Mexican State' },
  description: 'Comprehensive tracking of AI in the Mexican state. Official announcements, active legislation and judicial precedents in one place.',
  alternates: { canonical: `${CANONICAL_BASE}/en`, languages: { es: CANONICAL_BASE, en: `${CANONICAL_BASE}/en` } },
  openGraph: {
    title: 'Observatorio IA México',
    description: 'Comprehensive tracking of AI in the Mexican state. Official announcements, active legislation and judicial precedents.',
    url: `${CANONICAL_BASE}/en`,
    siteName: 'Observatorio IA México',
    locale: 'en_US',
    type: 'website',
  },
};

interface Anuncio {
  id: string; titulo: string; descripcion: string; status: string;
  responsable: string; dependencia: string; fechaAnuncio: string; fechaPrometida?: string;
}
interface Iniciativa { id: string; status?: string; estadoVerificacion?: string; }
interface Caso { id: string; nombre: string; resumen: string; estado?: string; criterio?: { tiene?: boolean }; criterios?: unknown[]; }

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${CANONICAL_BASE}${path}`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

const STATUS_LABEL_EN: Record<string, string> = {
  operando: 'Operating', en_desarrollo: 'In development', prometido: 'Promised',
  incumplido: 'Broken', concluido: 'Concluded', abandonado: 'Abandoned',
};

function traducirAnuncio(a: Anuncio): { titulo: string; descripcion: string } {
  const t = traduccionAnuncio(a.id);
  return { titulo: t?.titulo ?? a.titulo, descripcion: t?.descripcion ?? a.descripcion };
}

export default async function HomeEn() {
  const [anunciosData, iniciativasData, casosData] = await Promise.all([
    getJson<{ anuncios?: Anuncio[]; data?: Anuncio[] }>('/api/anuncios'),
    getJson<{ data?: Iniciativa[]; iniciativas?: Iniciativa[]; success?: boolean }>('/api/iniciativas'),
    getJson<{ casos?: Caso[]; data?: Caso[] }>('/api/casos-ia'),
  ]);

  const anuncios = anunciosData?.anuncios ?? anunciosData?.data ?? [];
  const iniciativas = iniciativasData?.data ?? iniciativasData?.iniciativas ?? [];
  const casos = casosData?.casos ?? casosData?.data ?? [];

  const conocidos: string[] = [...STATUS_ANUNCIO];
  const stats = {
    total: anuncios.length,
    operando: anuncios.filter((a) => a.status === 'operando').length,
    enDesarrollo: anuncios.filter((a) => a.status === 'en_desarrollo').length,
    incumplido: anuncios.filter((a) => a.status === 'incumplido').length,
    prometido: anuncios.filter((a) => a.status === 'prometido').length,
    concluido: anuncios.filter((a) => a.status === 'concluido').length,
    sinClasificar: anuncios.filter((a) => !conocidos.includes(a.status ?? '')).length,
  };
  const verificadas = iniciativas.filter((i) => i.estadoVerificacion === 'verificado').length;
  const casosConCriterio = casos.filter((c) => c.criterio?.tiene || (c.criterios && c.criterios.length > 0)).length;

  const anunciosDestacados = anuncios.slice(0, 6);
  const casosDestacados = casos.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#05070C] text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="flex items-center justify-between mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-widest text-white/60">
              Citizen watchdog
            </div>
            <Link href="/" className="text-xs font-mono text-white/40 hover:text-white/80 border border-white/15 rounded-lg px-2.5 py-1 transition-colors">ES</Link>
          </div>
          <h1 className="font-serif-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.02] mb-6">
            AI in Mexico,<br />
            <span className="italic bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">on a living map.</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/70 leading-relaxed mb-10">
            Full-scope tracking of artificial intelligence in the Mexican state — every public promise, every bill in
            Congress, every judicial precedent, verified against the official source.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/hemeroteca" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-white/90 transition-colors">
              Browse the archive <ArrowRight size={16} />
            </Link>
            <Link href="/grafo" className="inline-flex items-center gap-2 px-5 py-3 border border-white/25 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              See the live map
            </Link>
            <Link href="/en/informe-2026" className="inline-flex items-center gap-2 px-5 py-3 border border-white/25 text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              2026 Report
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 border-b border-gray-200/50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="font-serif-display text-lg sm:text-xl text-gray-800 leading-snug mb-6 max-w-3xl">
            The Mexican state made <strong className="text-gray-900">{stats.total} public AI promises</strong>:{' '}
            <span className="text-emerald-600 font-medium">{stats.operando} already operating</span>,{' '}
            <span className="text-blue-600 font-medium">{stats.enDesarrollo} in development</span>,{' '}
            <span className="text-gray-500 font-medium">{stats.prometido} promised</span>
            {stats.concluido > 0 && <>, <span className="text-teal-600 font-medium">{stats.concluido} concluded</span></>}
            {stats.incumplido > 0 && <> and <span className="text-red-600 font-semibold">{stats.incumplido} broken</span></>}
            {stats.sinClasificar > 0 && <> ({stats.sinClasificar} unclassified)</>}.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            <div className="bg-white rounded-lg py-3 px-2 border border-gray-200"><div className="text-xl font-bold text-gray-900">{stats.total}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div></div>
            <div className="bg-emerald-50 rounded-lg py-3 px-2 border border-emerald-200"><div className="text-xl font-bold text-emerald-600">{stats.operando}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Operating</div></div>
            <div className="bg-blue-50 rounded-lg py-3 px-2 border border-blue-200"><div className="text-xl font-bold text-blue-600">{stats.enDesarrollo}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">In dev.</div></div>
            <div className="bg-gray-100 rounded-lg py-3 px-2 border border-gray-200"><div className="text-xl font-bold text-gray-600">{stats.prometido}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Promised</div></div>
            <div className="bg-red-50 rounded-lg py-3 px-2 border border-red-200"><div className="text-xl font-bold text-red-600">{stats.incumplido}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Broken</div></div>
            <div className="bg-teal-50 rounded-lg py-3 px-2 border border-teal-200"><div className="text-xl font-bold text-teal-600">{stats.concluido}</div><div className="text-[10px] text-gray-500 uppercase tracking-wide">Concluded</div></div>
          </div>
        </div>
      </section>

      {/* Legislation + Cases summary */}
      <section className="py-14 px-4 bg-white border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-6">
          <Link href="/legislacion" className="group rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
            <h2 className="font-serif-display text-2xl text-gray-900 mb-2">Legislation</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong className="text-gray-900">{iniciativas.length} bills</strong> tracked in Congress and state
              legislatures, {verificadas} independently verified against the official gazette.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
              View tracker <ArrowRight size={14} />
            </span>
          </Link>
          <Link href="/casos-ia" className="group rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all">
            <h2 className="font-serif-display text-2xl text-gray-900 mb-2">Judicial cases</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong className="text-gray-900">{casos.length} cases</strong> where AI is the subject of litigation or
              a tool in the judicial process, {casosConCriterio} with a settled legal standard.
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
              View cases <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Featured cases */}
      {casosDestacados.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-200/50 py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif-display text-3xl text-gray-900 mb-6">Featured cases</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {casosDestacados.map((c) => {
                const t = traduccionCaso(c.id);
                return (
                  <Link key={c.id} href={`/casos-ia/${c.id}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all">
                    <h3 className="font-sans-tech font-medium text-gray-900 text-sm mb-2 line-clamp-2">{t?.nombre ?? c.nombre}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3">{t?.resumen ?? c.resumen}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Announcement cards */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-900 mb-8">Recent AI announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {anunciosDestacados.map((item) => {
              const tr = traducirAnuncio(item);
              return (
                <Link
                  key={item.id}
                  href={`/anuncio/${item.id}`}
                  className="group rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {STATUS_LABEL_EN[item.status] ?? item.status}
                    </span>
                  </div>
                  <h3 className="font-sans-tech font-semibold text-gray-900 text-sm mb-1.5 line-clamp-2 group-hover:text-blue-700">{tr.titulo}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{tr.descripcion}</p>
                  <div className="text-xs text-gray-400">{item.responsable}</div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
              See full tracker in Spanish <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-t border-gray-200/50 py-6 px-4 text-center text-xs text-gray-400">
        Some content is machine-translated from the Spanish original; law, tribunal and agency names are kept in
        Spanish with an English gloss. Open data (CSV):{' '}
        <a href="/api/export?coleccion=anuncios" className="underline hover:text-blue-600">announcements</a>
        {' · '}
        <a href="/api/export?coleccion=iniciativas" className="underline hover:text-blue-600">bills</a>
        {' · '}
        <a href="/api/export?coleccion=casos" className="underline hover:text-blue-600">cases</a>
      </section>
    </div>
  );
}
