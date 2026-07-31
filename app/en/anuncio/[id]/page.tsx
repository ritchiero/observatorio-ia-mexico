'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anuncio, EventoTimeline, Fuente } from '@/types';
import StatusBadgeEn from '@/components/StatusBadgeEn';
import NivelConfianzaBadgeEn from '@/components/NivelConfianzaBadgeEn';
import FolioBadge from '@/components/FolioBadge';
import { fetchOverlayEn, aplicarOverlayDoc } from '@/lib/i18n/client';
import { ArrowLeft, Calendar, User, Building2, ExternalLink, Newspaper, Clock, TrendingUp, TrendingDown, Minus, ChevronDown, Megaphone, Circle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Helper to convert a Firestore Timestamp into a Date
interface FirestoreTimestamp {
  _seconds?: number;
  seconds?: number;
  toDate?: () => Date;
}

function timestampToDate(timestamp: Timestamp | FirestoreTimestamp | Date | string | null): Date | null {
  if (!timestamp) return null;

  if (timestamp instanceof Date) return timestamp;

  const ts = timestamp as FirestoreTimestamp;
  if (ts._seconds) return new Date(ts._seconds * 1000);
  if (ts.seconds) return new Date(ts.seconds * 1000);
  if (ts.toDate) return ts.toDate();

  return new Date(timestamp as string);
}

// English date formatter — lib/utils' formatDate is hardcoded to the es-MX locale,
// so the EN twin gets its own local equivalent instead.
function formatDate(date: Date | null): string {
  if (!date) return 'Not specified';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function AnuncioDetailPageEn() {
  const params = useParams();
  const router = useRouter();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [eventos, setEventos] = useState<EventoTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      Promise.all([
        fetch(`/api/anuncios/${params.id}`).then(res => res.json()),
        fetch(`/api/timeline/${params.id}`).then(res => res.json()),
        fetchOverlayEn('anuncios'),
        fetchOverlayEn('eventos'),
      ])
        .then(([anuncioData, timelineData, overlayAnuncios, overlayEventos]) => {
          const anuncioBase: Anuncio | null = anuncioData.anuncio || null;
          const eventosBase: EventoTimeline[] = timelineData.eventos || [];

          setAnuncio(
            anuncioBase
              ? aplicarOverlayDoc<Anuncio>(anuncioBase, overlayAnuncios, anuncioBase.id ?? (params.id as string))
              : null
          );
          setEventos(
            eventosBase.map(evento => aplicarOverlayDoc<EventoTimeline>(evento, overlayEventos, evento.id))
          );
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading data:', err);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-xl text-gray-500 flex items-center gap-3 font-sans-tech">
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading promise...
        </div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="text-center py-24 bg-white min-h-screen">
        <h2 className="text-2xl font-bold font-serif-display text-gray-900 mb-4">
          Promise not found
        </h2>
        <button
          onClick={() => router.push('/en')}
          className="text-blue-600 hover:text-blue-500 transition-colors font-sans-tech inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>
      </div>
    );
  }

  const fechaAnuncio = anuncio.fechaAnuncio ? new Date(anuncio.fechaAnuncio as unknown as string) : null;
  const fechaPrometida = anuncio.fechaPrometida ? new Date(anuncio.fechaPrometida as unknown as string) : null;

  // Combine all sources (official first, then press, then other)
  const todasLasFuentes = [
    ...(anuncio.fuentes?.filter(f => f.tipo === 'anuncio_original' || f.tipo === 'declaracion' || f.tipo === 'transparencia') || []),
    ...(anuncio.fuentes?.filter(f => f.tipo === 'nota_prensa') || []),
    ...(anuncio.fuentes?.filter(f => f.tipo === 'otro') || []),
  ];

  // Group events by month
  const eventosAgrupados = agruparEventosPorMes(eventos);

  // Stats
  const eventosPositivos = eventos.filter(e => e.impacto === 'positivo').length;
  const eventosNegativos = eventos.filter(e => e.impacto === 'negativo').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Navigation */}
          <button
            onClick={() => router.push('/en')}
            className="mb-6 sm:mb-8 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors font-sans-tech group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to the observatory
          </button>

          {/* Status + confidence level */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadgeEn status={anuncio.status} />
            <NivelConfianzaBadgeEn item={anuncio} size="md" />
            <FolioBadge folio={anuncio.folio} locale="en" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light font-serif-display leading-tight mb-6">
            {anuncio.titulo}
          </h1>

          {/* Short description */}
          <p className="text-base sm:text-lg text-white/80 font-sans-tech leading-relaxed max-w-3xl mb-8">
            {anuncio.descripcion}
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <InfoCard
              icon={<Calendar size={18} />}
              label="Announced on"
              value={formatDate(fechaAnuncio)}
            />
            <InfoCard
              icon={<User size={18} />}
              label="Announced by"
              value={anuncio.responsable}
            />
            <InfoCard
              icon={<Building2 size={18} />}
              label="Agency"
              value={anuncio.dependencia}
            />
            {fechaPrometida && (
              <InfoCard
                icon={<Clock size={18} />}
                label="Promised for"
                value={formatDate(fechaPrometida)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">

        {/* Quote of the promise */}
        {anuncio.citaPromesa && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3 font-sans-tech">
              Direct quote of the promise
            </p>
            <blockquote className="text-lg sm:text-xl md:text-2xl text-gray-800 italic font-serif-display leading-relaxed">
              &ldquo;{anuncio.citaPromesa}&rdquo;
            </blockquote>
            <footer className="mt-4 text-sm text-gray-600 font-sans-tech">
              — {anuncio.responsable}, {formatDate(fechaAnuncio)}
            </footer>
          </section>
        )}

        {/* Contextual summary */}
        <section className="prose prose-lg max-w-none">
          <p className="text-gray-700 font-sans-tech leading-relaxed text-base sm:text-lg">
            {generarResumenContextual(anuncio, fechaAnuncio, fechaPrometida)}
          </p>
        </section>

        {/* Monitoring findings (when the agent has additional information) */}
        {anuncio.resumenAgente && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h2 className="text-sm uppercase tracking-wider text-amber-700 font-semibold font-sans-tech">
                Automated monitoring findings
              </h2>
            </div>
            <p className="text-gray-800 font-sans-tech leading-relaxed">
              {anuncio.resumenAgente}
            </p>
          </section>
        )}

        {/* Press Coverage and Sources */}
        <section>
          <h2 className="text-xl sm:text-2xl font-light font-serif-display text-gray-900 mb-6 flex items-center gap-3">
            <Newspaper className="text-blue-500" size={24} />
            Coverage and sources
          </h2>

          {/* Grid of news cards */}
          {todasLasFuentes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {todasLasFuentes.map((fuente, idx) => (
                <NoticiaCard key={idx} fuente={fuente} />
              ))}
            </div>
          ) : anuncio.fuenteOriginal ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <NoticiaCard
                fuente={{
                  url: anuncio.fuenteOriginal,
                  titulo: 'Original source of the announcement',
                  fecha: anuncio.fechaAnuncio,
                  tipo: 'anuncio_original',
                  medio: extraerMedio(anuncio.fuenteOriginal)
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Newspaper className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500 font-sans-tech text-sm">
                No sources on file for this promise
              </p>
            </div>
          )}
        </section>

        {/* Tracking History */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-light font-serif-display text-gray-900 flex items-center gap-3">
              <Calendar className="text-blue-500" size={24} />
              Tracking history
            </h2>

            {eventos.length > 0 && (
              <div className="flex items-center gap-4 text-sm font-sans-tech">
                <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={14} />
                  {eventosPositivos} progress
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <TrendingDown size={14} />
                  {eventosNegativos} setbacks
                </span>
              </div>
            )}
          </div>

          {/* Monthly timeline from the announcement date through today */}
          <TimelineMensual
            fechaAnuncio={fechaAnuncio}
            eventos={eventos}
            eventosAgrupados={eventosAgrupados}
            anuncio={anuncio}
          />
        </section>

        {/* Note about the monitoring */}
        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 font-sans-tech">
                About this tracking
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans-tech">
                This record is updated automatically by AI agents that monitor
                news and official statements. Every event is backed by verifiable sources
                to guarantee the transparency and accountability of the Mexican government on AI matters.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// InfoCard component for the hero
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center gap-2 text-white/60 mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wider font-sans-tech">{label}</span>
      </div>
      <p className="text-white font-medium font-sans-tech truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

// Logos for known outlets. Outlet and institution names are kept in Spanish —
// they mirror what's actually stored in Firestore's `fuente.medio` field, so the
// keys below must match those values verbatim (translating them would silently
// break the emoji lookup for any source whose `medio` was entered by hand).
const LOGOS_MEDIOS: Record<string, string> = {
  'El Universal': '🗞️',
  'Reforma': '📰',
  'La Jornada': '📰',
  'Milenio': '📰',
  'El Financiero': '💼',
  'El Economista': '📊',
  'Expansión': '📈',
  'Forbes México': '💰',
  'Animal Político': '🐾',
  'Proceso': '📰',
  'Sin Embargo': '📰',
  'Infobae': '🌐',
  'Reuters': '🌍',
  'AP': '🌍',
  'EFE': '🌍',
  'Gobierno de México': '🏛️',
  'Presidencia': '🏛️',
  'gob.mx': '🏛️',
  'Senado': '🏛️',
  'Cámara de Diputados': '🏛️',
};

// Background colors by source type
const COLORES_TIPO: Record<string, { bg: string; accent: string }> = {
  'anuncio_original': { bg: 'from-blue-600 to-blue-800', accent: 'bg-blue-500' },
  'declaracion': { bg: 'from-indigo-600 to-indigo-800', accent: 'bg-indigo-500' },
  'transparencia': { bg: 'from-cyan-600 to-cyan-800', accent: 'bg-cyan-500' },
  'nota_prensa': { bg: 'from-purple-600 to-purple-800', accent: 'bg-purple-500' },
  'otro': { bg: 'from-gray-600 to-gray-800', accent: 'bg-gray-500' },
};

// Extract the outlet name from a URL. Values are deliberately left in Spanish
// (see LOGOS_MEDIOS above) so they line up with hand-entered `medio` values.
function extraerMedio(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const medios: Record<string, string> = {
      'eluniversal.com.mx': 'El Universal',
      'reforma.com': 'Reforma',
      'jornada.com.mx': 'La Jornada',
      'milenio.com': 'Milenio',
      'elfinanciero.com.mx': 'El Financiero',
      'eleconomista.com.mx': 'El Economista',
      'expansion.mx': 'Expansión',
      'forbes.com.mx': 'Forbes México',
      'animalpolitico.com': 'Animal Político',
      'proceso.com.mx': 'Proceso',
      'sinembargo.mx': 'Sin Embargo',
      'infobae.com': 'Infobae',
      'gob.mx': 'Gobierno de México',
      'presidente.gob.mx': 'Presidencia',
      'senado.gob.mx': 'Senado',
      'diputados.gob.mx': 'Cámara de Diputados',
    };
    return medios[hostname] || hostname;
  } catch {
    return 'Source';
  }
}

// The "Official" label is NOT decided by whoever captured the source: it's derived
// from the domain (OIA-005 — a private outlet had been mislabeled "Official").
// gob.mx covers dof/scjn/senado/diputados; unam.mx covers DGCS/Gaceta UNAM releases.
function esDominioOficial(url?: string): boolean {
  try {
    const h = new URL(url ?? '').hostname.toLowerCase();
    return h === 'gob.mx' || h.endsWith('.gob.mx') || h === 'unam.mx' || h.endsWith('.unam.mx');
  } catch {
    return false;
  }
}

// NoticiaCard component — visual news-style card
function NoticiaCard({ fuente }: { fuente: Fuente }) {
  const medio = fuente.medio || extraerMedio(fuente.url);
  const logoEmoji = LOGOS_MEDIOS[medio] || '📄';
  const colores = COLORES_TIPO[fuente.tipo] || COLORES_TIPO['otro'];

  // Convert timestamp to date
  let fechaStr = '';
  const fechaDate = timestampToDate(fuente.fecha);
  if (fechaDate) {
    fechaStr = fechaDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Type label
  const etiquetaTipo: Record<string, string> = {
    'anuncio_original': 'Official',
    'declaracion': 'Statement',
    'transparencia': 'Transparency',
    'nota_prensa': 'Press',
    'otro': 'Link',
  };

  return (
    <a
      href={fuente.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {/* Thumbnail / visual header */}
      <div className={`relative h-24 bg-gradient-to-br ${colores.bg} flex items-center justify-center overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20h20v20H20V20zM0 0h20v20H0V0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Outlet logo/emoji */}
        <span className="text-4xl opacity-90 group-hover:scale-110 transition-transform">
          {logoEmoji}
        </span>

        {/* Type badge — "Official" only when the domain is genuinely a government one */}
        <span className={`absolute top-2 right-2 text-xs font-medium text-white px-2 py-0.5 rounded-full ${colores.accent} bg-opacity-80`}>
          {fuente.tipo === 'anuncio_original' && !esDominioOficial(fuente.url)
            ? 'Documented'
            : etiquetaTipo[fuente.tipo] || 'Link'}
        </span>

        {/* Unavailable indicator */}
        {fuente.accesible === false && (
          <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            ⚠️ Unavailable
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Outlet and date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans-tech truncate">
            {medio}
          </span>
          {fechaStr && (
            <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
              {fechaStr}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-medium text-gray-900 font-sans-tech leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {fuente.titulo}
        </h3>

        {/* Excerpt */}
        {fuente.extracto && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-sans-tech">
            {fuente.extracto}
          </p>
        )}

        {/* Link indicator */}
        <div className="flex items-center gap-1 mt-3 text-xs text-blue-500 font-sans-tech">
          <span>Read more</span>
          <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Wayback indicator */}
      {fuente.waybackUrl && fuente.accesible === false && (
        <div className="px-4 pb-3">
          <span className="text-xs text-amber-600 font-sans-tech flex items-center gap-1">
            📦 Available on Archive.org
          </span>
        </div>
      )}
    </a>
  );
}

// Generate the list of months from the announcement date through today
function generarMesesDesdeAnuncio(fechaAnuncio: Date | null): string[] {
  if (!fechaAnuncio) return [];

  const meses: string[] = [];
  const hoy = new Date();
  const fecha = new Date(fechaAnuncio.getFullYear(), fechaAnuncio.getMonth(), 1);

  while (fecha <= hoy) {
    const mes = `${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
    meses.push(mes);
    fecha.setMonth(fecha.getMonth() + 1);
  }

  return meses.reverse(); // Most recent first
}

// Main Monthly Timeline component
function TimelineMensual({
  fechaAnuncio,
  eventos,
  eventosAgrupados,
  anuncio
}: {
  fechaAnuncio: Date | null;
  eventos: EventoTimeline[];
  eventosAgrupados: Record<string, EventoTimeline[]>;
  anuncio: Anuncio;
}) {
  const meses = generarMesesDesdeAnuncio(fechaAnuncio);
  const mesAnuncio = fechaAnuncio
    ? `${(fechaAnuncio.getMonth() + 1).toString().padStart(2, '0')}-${fechaAnuncio.getFullYear()}`
    : null;

  if (meses.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
        <Clock className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500 font-sans-tech">No announcement date on file</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {meses.map((mes, index) => {
        const eventosDelMes = eventosAgrupados[mes] || [];
        const esAnuncio = mes === mesAnuncio;
        const tieneMovimientos = eventosDelMes.length > 0;

        return (
          <FilaMes
            key={mes}
            mes={mes}
            eventos={eventosDelMes}
            esAnuncio={esAnuncio}
            tieneMovimientos={tieneMovimientos}
            esPrimero={index === 0}
            anuncio={anuncio}
          />
        );
      })}
    </div>
  );
}

// FilaMes component — collapsible row per month
function FilaMes({
  mes,
  eventos,
  esAnuncio,
  tieneMovimientos,
  esPrimero,
  anuncio
}: {
  mes: string;
  eventos: EventoTimeline[];
  esAnuncio: boolean;
  tieneMovimientos: boolean;
  esPrimero: boolean;
  anuncio: Anuncio;
}) {
  const [expandido, setExpandido] = useState(esAnuncio || tieneMovimientos);

  const [mesStr, anio] = mes.split('-');
  const nombreMes = new Date(parseInt(anio), parseInt(mesStr) - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Count progress and setbacks for the month
  const avances = eventos.filter(e => e.impacto === 'positivo').length;
  const retrocesos = eventos.filter(e => e.impacto === 'negativo').length;

  return (
    <div className={`${!esPrimero ? 'border-t border-gray-200' : ''}`}>
      {/* Month header — clickable */}
      <button
        onClick={() => setExpandido(!expandido)}
        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
          esAnuncio ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Indicator */}
          <div className={`w-2 h-2 rounded-full ${
            esAnuncio ? 'bg-blue-500' : tieneMovimientos ? 'bg-emerald-500' : 'bg-gray-300'
          }`} />

          {/* Month name */}
          <span className={`font-medium font-sans-tech capitalize ${
            esAnuncio ? 'text-blue-700' : 'text-gray-700'
          }`}>
            {nombreMes}
          </span>

          {/* Announcement badge */}
          {esAnuncio && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-sans-tech flex items-center gap-1">
              <Megaphone size={10} />
              Announcement
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Month status */}
          {tieneMovimientos ? (
            <div className="flex items-center gap-2 text-xs font-sans-tech">
              {avances > 0 && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {avances}
                </span>
              )}
              {retrocesos > 0 && (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown size={12} />
                  {retrocesos}
                </span>
              )}
              {avances === 0 && retrocesos === 0 && (
                <span className="text-gray-500">{eventos.length} update{eventos.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          ) : !esAnuncio ? (
            <span className="text-xs text-gray-400 font-sans-tech">No updates</span>
          ) : null}

          {/* Chevron */}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expandido ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable content */}
      {expandido && (
        <div className="px-4 pb-4 pt-2 bg-gray-50/50">
          {esAnuncio && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-3">
                <Megaphone className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-blue-800 font-sans-tech">
                    Official announcement date
                  </p>
                  <p className="text-xs text-blue-600 mt-1 font-sans-tech">
                    {anuncio.responsable} announced this initiative publicly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {eventos.length > 0 ? (
            <div className="space-y-3">
              {eventos.map((evento) => (
                <EventoCompacto key={evento.id} evento={evento} />
              ))}
            </div>
          ) : !esAnuncio ? (
            <p className="text-sm text-gray-400 font-sans-tech py-2 text-center">
              No updates recorded this month
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// EventoCompacto component — an event inside a month
function EventoCompacto({ evento }: { evento: EventoTimeline }) {
  const [expandido, setExpandido] = useState(false);

  const fecha = timestampToDate(evento.fecha) || new Date();
  const fechaFormateada = fecha.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  });

  const impactoConfig = {
    positivo: { icon: <TrendingUp size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    neutral: { icon: <Minus size={14} />, color: 'text-gray-500', bg: 'bg-gray-100' },
    negativo: { icon: <TrendingDown size={14} />, color: 'text-red-600', bg: 'bg-red-100' }
  };

  const config = impactoConfig[evento.impacto as keyof typeof impactoConfig] ?? impactoConfig.neutral;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Clickable header */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">{fechaFormateada}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color} font-sans-tech`}>
              {evento.impacto === 'positivo' ? 'Progress' : evento.impacto === 'negativo' ? 'Setback' : 'Info'}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 font-sans-tech text-sm truncate">
            {evento.titulo}
          </h4>
        </div>

        <ChevronDown
          size={14}
          className={`text-gray-400 flex-shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      {expandido && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <p className="text-sm text-gray-600 font-sans-tech mt-3 leading-relaxed">
            {evento.descripcion}
          </p>

          {evento.citaTextual && (
            <blockquote className="mt-3 border-l-2 border-blue-300 pl-3 py-1 bg-blue-50 rounded-r">
              <p className="text-sm text-gray-700 italic font-serif-display">
                &ldquo;{evento.citaTextual}&rdquo;
              </p>
              {evento.responsable && (
                <footer className="text-xs text-gray-500 mt-1 font-sans-tech">
                  — {evento.responsable}
                </footer>
              )}
            </blockquote>
          )}

          {evento.fuentes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {evento.fuentes.map((fuente, idx) => (
                <a
                  key={idx}
                  href={fuente.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 bg-blue-50 px-2 py-1 rounded font-sans-tech"
                >
                  {fuente.medio || 'Source'}
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Generate the narrative contextual summary
function generarResumenContextual(anuncio: Anuncio, fechaAnuncio: Date | null, fechaPrometida: Date | null): string {
  const fechaAnuncioStr = fechaAnuncio
    ? fechaAnuncio.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'an unspecified date';

  const fechaPrometidaStr = fechaPrometida
    ? fechaPrometida.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // Determine the current status, in prose form
  const estadoTexto: Record<string, string> = {
    'prometido': 'remains a promise with no concrete actions reported',
    'en_desarrollo': 'is in the development phase, according to official sources',
    'operando': 'is operating, according to official reports',
    'incumplido': 'remains unfulfilled, with none of the promised actions having materialized',
    'abandonado': 'appears to have been abandoned, with no official communication on the matter'
  };

  const estadoActual = estadoTexto[anuncio.status] || 'has an undetermined status';

  // Build the paragraph
  let resumen = `On ${fechaAnuncioStr}, ${anuncio.responsable} announced ${anuncio.titulo}`;

  if (fechaPrometidaStr) {
    resumen += `, publicly committing to implement it by ${fechaPrometidaStr}`;
  }

  resumen += `. ${anuncio.descripcion}`;

  // Add the current status unless it is "operating"
  if (anuncio.status !== 'operando') {
    resumen += ` As of now, the project ${estadoActual}.`;
  }

  return resumen;
}

// Group events by month
function agruparEventosPorMes(eventos: EventoTimeline[]): Record<string, EventoTimeline[]> {
  const agrupados: Record<string, EventoTimeline[]> = {};

  eventos.forEach(evento => {
    const fecha = timestampToDate(evento.fecha) || new Date();
    const mes = `${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;

    if (!agrupados[mes]) {
      agrupados[mes] = [];
    }
    agrupados[mes].push(evento);
  });

  // Sort events within each month by date (most recent first)
  Object.keys(agrupados).forEach(mes => {
    agrupados[mes].sort((a, b) => {
      const fechaA = timestampToDate(a.fecha)?.getTime() || 0;
      const fechaB = timestampToDate(b.fecha)?.getTime() || 0;
      return fechaB - fechaA;
    });
  });

  return agrupados;
}
