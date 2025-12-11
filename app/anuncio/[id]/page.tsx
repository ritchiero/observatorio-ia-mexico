'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anuncio, EventoTimeline, Fuente } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Building2, ExternalLink, Newspaper, Clock, TrendingUp, TrendingDown, Minus }  from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Helper para convertir Firestore Timestamp a Date
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

export default function AnuncioDetailPage() {
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
      ])
        .then(([anuncioData, timelineData]) => {
          setAnuncio(anuncioData.anuncio || null);
          setEventos(timelineData.eventos || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al cargar datos:', err);
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
          Cargando promesa...
        </div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="text-center py-24 bg-white min-h-screen">
        <h2 className="text-2xl font-bold font-serif-display text-gray-900 mb-4">
          Promesa no encontrada
        </h2>
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:text-blue-500 transition-colors font-sans-tech inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    );
  }

  const fechaAnuncio = anuncio.fechaAnuncio ? new Date(anuncio.fechaAnuncio as unknown as string) : null;
  const fechaPrometida = anuncio.fechaPrometida ? new Date(anuncio.fechaPrometida as unknown as string) : null;

  // Combinar todas las fuentes (oficiales primero, luego prensa, luego otras)
  const todasLasFuentes = [
    ...(anuncio.fuentes?.filter(f => f.tipo === 'anuncio_original' || f.tipo === 'declaracion' || f.tipo === 'transparencia') || []),
    ...(anuncio.fuentes?.filter(f => f.tipo === 'nota_prensa') || []),
    ...(anuncio.fuentes?.filter(f => f.tipo === 'otro') || []),
  ];

  // Agrupar eventos por mes
  const eventosAgrupados = agruparEventosPorMes(eventos);

  // Estadísticas
  const eventosPositivos = eventos.filter(e => e.impacto === 'positivo').length;
  const eventosNegativos = eventos.filter(e => e.impacto === 'negativo').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        {/* Pattern de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Navegación */}
          <button
            onClick={() => router.push('/')}
            className="mb-6 sm:mb-8 text-white/70 hover:text-white flex items-center gap-2 text-sm transition-colors font-sans-tech group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al observatorio
          </button>

          {/* Status Badge */}
          <div className="mb-4">
            <StatusBadge status={anuncio.status} />
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light font-serif-display leading-tight mb-6">
            {anuncio.titulo}
          </h1>

          {/* Descripción breve */}
          <p className="text-base sm:text-lg text-white/80 font-sans-tech leading-relaxed max-w-3xl mb-8">
            {anuncio.descripcion}
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <InfoCard 
              icon={<Calendar size={18} />}
              label="Fecha de anuncio"
              value={formatDate(fechaAnuncio)}
            />
            <InfoCard 
              icon={<User size={18} />}
              label="Presentado por"
              value={anuncio.responsable}
            />
            <InfoCard 
              icon={<Building2 size={18} />}
              label="Dependencia"
              value={anuncio.dependencia}
            />
            {fechaPrometida && (
              <InfoCard 
                icon={<Clock size={18} />}
                label="Fecha prometida"
                value={formatDate(fechaPrometida)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        
        {/* Cita de la promesa */}
        {anuncio.citaPromesa && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-3 font-sans-tech">
              Cita textual de la promesa
            </p>
            <blockquote className="text-lg sm:text-xl md:text-2xl text-gray-800 italic font-serif-display leading-relaxed">
              &ldquo;{anuncio.citaPromesa}&rdquo;
            </blockquote>
            <footer className="mt-4 text-sm text-gray-600 font-sans-tech">
              — {anuncio.responsable}, {formatDate(fechaAnuncio)}
            </footer>
          </section>
        )}

        {/* Resumen contextual */}
        <section className="prose prose-lg max-w-none">
          <p className="text-gray-700 font-sans-tech leading-relaxed text-base sm:text-lg">
            {generarResumenContextual(anuncio, fechaAnuncio, fechaPrometida)}
          </p>
        </section>

        {/* Hallazgos del monitoreo (si hay información adicional del agente) */}
        {anuncio.resumenAgente && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h2 className="text-sm uppercase tracking-wider text-amber-700 font-semibold font-sans-tech">
                Hallazgos del monitoreo automático
              </h2>
            </div>
            <p className="text-gray-800 font-sans-tech leading-relaxed">
              {anuncio.resumenAgente}
            </p>
          </section>
        )}

        {/* Cobertura de Prensa y Fuentes */}
        <section>
          <h2 className="text-xl sm:text-2xl font-light font-serif-display text-gray-900 mb-6 flex items-center gap-3">
            <Newspaper className="text-blue-500" size={24} />
            Cobertura y fuentes
          </h2>

          {/* Grid de tarjetas de noticias */}
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
                  titulo: 'Fuente original del anuncio',
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
                No hay fuentes registradas para esta promesa
              </p>
            </div>
          )}
        </section>

        {/* Historial de Seguimiento */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-light font-serif-display text-gray-900 flex items-center gap-3">
              <Calendar className="text-blue-500" size={24} />
              Historial de seguimiento
            </h2>
            
            {eventos.length > 0 && (
              <div className="flex items-center gap-4 text-sm font-sans-tech">
                <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={14} />
                  {eventosPositivos} avances
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <TrendingDown size={14} />
                  {eventosNegativos} retrocesos
                </span>
              </div>
            )}
          </div>

          {eventos.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(eventosAgrupados)
                .sort(([a], [b]) => b.localeCompare(a)) // Más recientes primero
                .map(([mes, eventosDelMes]) => (
                  <MesTimeline key={mes} mes={mes} eventos={eventosDelMes} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <Clock className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-600 font-sans-tech mb-2">
                No hay eventos registrados aún
              </p>
              <p className="text-sm text-gray-400 font-sans-tech max-w-md mx-auto">
                El historial se construirá automáticamente cuando se detecten 
                actualizaciones sobre esta promesa.
              </p>
            </div>
          )}
        </section>

        {/* Nota sobre el monitoreo */}
        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 font-sans-tech">
                Sobre este seguimiento
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans-tech">
                Este historial se actualiza automáticamente mediante agentes de IA que monitorean 
                noticias y comunicados oficiales. Cada evento está respaldado por fuentes verificables 
                para garantizar la transparencia y accountability del gobierno mexicano en materia de IA.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Componente InfoCard para el hero
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

// Logos de medios conocidos
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

// Colores de fondo por tipo de medio
const COLORES_TIPO: Record<string, { bg: string; accent: string }> = {
  'anuncio_original': { bg: 'from-blue-600 to-blue-800', accent: 'bg-blue-500' },
  'declaracion': { bg: 'from-indigo-600 to-indigo-800', accent: 'bg-indigo-500' },
  'transparencia': { bg: 'from-cyan-600 to-cyan-800', accent: 'bg-cyan-500' },
  'nota_prensa': { bg: 'from-purple-600 to-purple-800', accent: 'bg-purple-500' },
  'otro': { bg: 'from-gray-600 to-gray-800', accent: 'bg-gray-500' },
};

// Extraer medio de una URL
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
    return 'Fuente';
  }
}

// Componente NoticiaCard - Tarjeta visual tipo noticia
function NoticiaCard({ fuente }: { fuente: Fuente }) {
  const medio = fuente.medio || extraerMedio(fuente.url);
  const logoEmoji = LOGOS_MEDIOS[medio] || '📄';
  const colores = COLORES_TIPO[fuente.tipo] || COLORES_TIPO['otro'];
  
  // Convertir timestamp a fecha
  let fechaStr = '';
  const fechaDate = timestampToDate(fuente.fecha);
  if (fechaDate) {
    fechaStr = fechaDate.toLocaleDateString('es-MX', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });
  }

  // Etiqueta del tipo
  const etiquetaTipo: Record<string, string> = {
    'anuncio_original': 'Oficial',
    'declaracion': 'Declaración',
    'transparencia': 'Transparencia',
    'nota_prensa': 'Prensa',
    'otro': 'Enlace',
  };

  return (
    <a
      href={fuente.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {/* Miniatura / Header visual */}
      <div className={`relative h-24 bg-gradient-to-br ${colores.bg} flex items-center justify-center overflow-hidden`}>
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20h20v20H20V20zM0 0h20v20H0V0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Logo/Emoji del medio */}
        <span className="text-4xl opacity-90 group-hover:scale-110 transition-transform">
          {logoEmoji}
        </span>
        
        {/* Badge de tipo */}
        <span className={`absolute top-2 right-2 text-xs font-medium text-white px-2 py-0.5 rounded-full ${colores.accent} bg-opacity-80`}>
          {etiquetaTipo[fuente.tipo] || 'Enlace'}
        </span>
        
        {/* Indicador de no disponible */}
        {fuente.accesible === false && (
          <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            ⚠️ No disponible
          </span>
        )}
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        {/* Medio y fecha */}
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
        
        {/* Título */}
        <h3 className="font-medium text-gray-900 font-sans-tech leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {fuente.titulo}
        </h3>
        
        {/* Extracto */}
        {fuente.extracto && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-sans-tech">
            {fuente.extracto}
          </p>
        )}
        
        {/* Link indicator */}
        <div className="flex items-center gap-1 mt-3 text-xs text-blue-500 font-sans-tech">
          <span>Leer más</span>
          <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
      
      {/* Wayback indicator */}
      {fuente.waybackUrl && fuente.accesible === false && (
        <div className="px-4 pb-3">
          <span className="text-xs text-amber-600 font-sans-tech flex items-center gap-1">
            📦 Disponible en Archive.org
          </span>
        </div>
      )}
    </a>
  );
}

// Componente MesTimeline
function MesTimeline({ mes, eventos }: { mes: string; eventos: EventoTimeline[] }) {
  const [mesStr, anio] = mes.split('-');
  const nombreMes = new Date(parseInt(anio), parseInt(mesStr) - 1).toLocaleDateString('es-MX', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent"></div>
        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider font-sans-tech">
          {nombreMes}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent"></div>
      </div>
      
      <div className="space-y-4">
        {eventos.map((evento) => (
          <EventoCard key={evento.id} evento={evento} />
        ))}
      </div>
    </div>
  );
}

// Componente EventoCard
function EventoCard({ evento }: { evento: EventoTimeline }) {
  const [expandido, setExpandido] = useState(false);

  // Convertir timestamp a fecha
  const fecha = timestampToDate(evento.fecha) || new Date();
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short'
  });

  const impactoConfig = {
    positivo: { icon: <TrendingUp size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    neutral: { icon: <Minus size={16} />, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
    negativo: { icon: <TrendingDown size={16} />, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
  };

  const config = impactoConfig[evento.impacto];

  return (
    <div className={`rounded-xl border ${config.border} bg-white overflow-hidden`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Indicador de impacto */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-400 font-mono">
                {fechaFormateada}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-sans-tech`}>
                {evento.impacto === 'positivo' ? 'Avance' : evento.impacto === 'negativo' ? 'Retroceso' : 'Actualización'}
              </span>
            </div>
            
            {/* Título */}
            <h4 className="font-semibold text-gray-900 font-sans-tech mb-2">
              {evento.titulo}
            </h4>
            
            {/* Descripción */}
            <p className="text-sm text-gray-600 font-sans-tech leading-relaxed">
              {evento.descripcion}
            </p>

            {/* Cita textual */}
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

            {/* Fuentes */}
            {evento.fuentes.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandido(!expandido)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium font-sans-tech flex items-center gap-1"
                >
                  {expandido ? 'Ocultar fuentes' : `Ver ${evento.fuentes.length} fuente${evento.fuentes.length > 1 ? 's' : ''}`}
                </button>
                
                {expandido && (
                  <div className="mt-3 space-y-2">
                    {evento.fuentes.map((fuente, idx) => (
                      <a
                        key={idx}
                        href={fuente.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {fuente.medio && (
                              <span className="text-xs text-gray-500 font-sans-tech">{fuente.medio}</span>
                            )}
                            <p className="text-sm font-medium text-gray-800 font-sans-tech">
                              {fuente.titulo}
                            </p>
                          </div>
                          <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para generar resumen contextual narrativo
function generarResumenContextual(anuncio: Anuncio, fechaAnuncio: Date | null, fechaPrometida: Date | null): string {
  const fechaAnuncioStr = fechaAnuncio 
    ? fechaAnuncio.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'fecha no especificada';
  
  const fechaPrometidaStr = fechaPrometida
    ? fechaPrometida.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    : null;

  // Determinar el estado actual en texto
  const estadoTexto: Record<string, string> = {
    'prometido': 'permanece como una promesa sin acciones concretas reportadas',
    'en_desarrollo': 'se encuentra en fase de desarrollo según fuentes oficiales',
    'operando': 'está operando según los reportes oficiales',
    'incumplido': 'permanece incumplido sin que se hayan materializado las acciones prometidas',
    'abandonado': 'parece haber sido abandonado sin comunicación oficial al respecto'
  };

  const estadoActual = estadoTexto[anuncio.status] || 'tiene un estado indeterminado';

  // Construir el párrafo
  let resumen = `El ${fechaAnuncioStr}, ${anuncio.responsable} anunció ${anuncio.titulo.toLowerCase().startsWith('el ') || anuncio.titulo.toLowerCase().startsWith('la ') ? '' : 'la iniciativa de '}${anuncio.titulo}`;
  
  if (fechaPrometidaStr) {
    resumen += `, comprometiéndose públicamente a su implementación para ${fechaPrometidaStr}`;
  }
  
  resumen += `. ${anuncio.descripcion}`;
  
  // Agregar estado actual si no es "operando"
  if (anuncio.status !== 'operando') {
    resumen += ` A la fecha, el proyecto ${estadoActual}.`;
  }

  return resumen;
}

// Función para agrupar eventos por mes
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
  
  // Ordenar eventos dentro de cada mes por fecha (más recientes primero)
  Object.keys(agrupados).forEach(mes => {
    agrupados[mes].sort((a, b) => {
      const fechaA = timestampToDate(a.fecha)?.getTime() || 0;
      const fechaB = timestampToDate(b.fecha)?.getTime() || 0;
      return fechaB - fechaA;
    });
  });
  
  return agrupados;
}
