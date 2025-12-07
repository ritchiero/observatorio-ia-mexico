'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anuncio, EventoTimeline } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import TimelineInteractivo from '@/components/TimelineInteractivo';
import { formatDate } from '@/lib/utils';
import { FuentesList } from '@/components/FuentesList';
import { ArrowLeft } from 'lucide-react';

export default function AnuncioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [eventos, setEventos] = useState<EventoTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      // Cargar anuncio y eventos de timeline
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
      <div className="flex justify-center items-center min-h-[400px] bg-[#030303]">
        <div className="text-xl text-white/50 flex items-center gap-2 font-sans-tech">
          <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="text-center py-12 bg-[#030303] min-h-screen">
        <h2 className="text-2xl font-bold font-serif-display text-white mb-4">
          Anuncio no encontrado
        </h2>
        <button
          onClick={() => router.push('/')}
          className="text-amber-500 hover:text-amber-400 transition-colors font-sans-tech"
        >
          ← Volver al inicio
        </button>
      </div>
    );
  }

  const fechaAnuncio = anuncio.fechaAnuncio ? new Date(anuncio.fechaAnuncio as unknown as string) : null;
  const fechaPrometida = anuncio.fechaPrometida ? new Date(anuncio.fechaPrometida as unknown as string) : null;

  // Calcular estadísticas
  const totalFuentes = eventos.reduce((sum, e) => sum + e.fuentes.length, 0);
  const eventosPositivos = eventos.filter(e => e.impacto === 'positivo').length;
  const eventosNegativos = eventos.filter(e => e.impacto === 'negativo').length;

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Textura de ruido */}
      <div className="noise-bg"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Botón volver */}
        <button
          onClick={() => router.push('/')}
          className="text-amber-500 hover:text-amber-400 flex items-center gap-2 text-sm sm:text-base transition-colors font-sans-tech group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al dashboard
        </button>

        {/* Encabezado */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-light font-serif-display text-white leading-tight">
              {anuncio.titulo}
            </h1>
            <StatusBadge status={anuncio.status} />
          </div>

          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-4 sm:mb-6 font-sans-tech leading-relaxed">
            {anuncio.descripcion}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6 font-sans-tech">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold text-white/50 mb-1 sm:mb-0">Responsable:</span>
              <span className="sm:ml-2 text-white/80">{anuncio.responsable}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold text-white/50 mb-1 sm:mb-0">Dependencia:</span>
              <span className="sm:ml-2 text-white/80">{anuncio.dependencia}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold text-white/50 mb-1 sm:mb-0">Fecha de anuncio:</span>
              <span className="sm:ml-2 text-white/80 font-mono">{formatDate(fechaAnuncio)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-semibold text-white/50 mb-1 sm:mb-0">Fecha prometida:</span>
              <span className="sm:ml-2 text-white/80 font-mono">{formatDate(fechaPrometida)}</span>
            </div>
          </div>

          {anuncio.citaPromesa && (
            <div className="p-3 sm:p-4 bg-amber-900/20 border-l-2 sm:border-l-4 border-amber-500 rounded mb-4 backdrop-blur-sm">
              <p className="text-xs sm:text-sm font-semibold text-amber-400 mb-1 font-sans-tech">
                Cita de la promesa:
              </p>
              <p className="text-sm sm:text-base text-white/80 italic font-serif-display">&ldquo;{anuncio.citaPromesa}&rdquo;</p>
            </div>
          )}

          {anuncio.resumenAgente && (
            <div className="p-3 sm:p-4 bg-amber-900/20 border-l-2 sm:border-l-4 border-amber-500 rounded mb-4 backdrop-blur-sm">
              <p className="text-xs sm:text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2 font-sans-tech">
                <span>🤖</span> Hallazgos del agente de monitoreo:
              </p>
              <p className="text-sm sm:text-base text-white/80 font-sans-tech leading-relaxed">{anuncio.resumenAgente}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-white/70 mb-3 font-sans-tech">Fuentes verificables:</h3>
            <FuentesList fuentes={anuncio.fuentes} fuenteOriginal={anuncio.fuenteOriginal} />
          </div>
        </div>

        {/* Estadísticas del Timeline */}
        {eventos.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl sm:text-3xl font-bold font-serif-display text-white">{eventos.length}</div>
                <div className="text-xs sm:text-sm text-white/50 font-sans-tech">Eventos registrados</div>
              </div>
              <div className="text-center p-3 bg-amber-900/20 rounded-lg border border-amber-800/30">
                <div className="text-2xl sm:text-3xl font-bold font-serif-display text-amber-400">{totalFuentes}</div>
                <div className="text-xs sm:text-sm text-white/50 font-sans-tech">Fuentes verificadas</div>
              </div>
              <div className="text-center p-3 bg-emerald-900/20 rounded-lg border border-emerald-800/30">
                <div className="text-2xl sm:text-3xl font-bold font-serif-display text-emerald-400">{eventosPositivos}</div>
                <div className="text-xs sm:text-sm text-white/50 font-sans-tech">Avances</div>
              </div>
              <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                <div className="text-2xl sm:text-3xl font-bold font-serif-display text-red-400">{eventosNegativos}</div>
                <div className="text-xs sm:text-sm text-white/50 font-sans-tech">Retrocesos</div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Interactivo */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-xl sm:text-2xl font-light font-serif-display text-white mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-amber-500">📅</span> Timeline de Eventos
          </h2>
          
          {eventos.length > 0 ? (
            <TimelineInteractivo eventos={eventos} />
          ) : (
            <div className="text-center py-8 text-white/50">
              <p className="mb-2 text-sm sm:text-base font-sans-tech">No hay eventos registrados aún.</p>
              <p className="text-xs sm:text-sm font-sans-tech">
                El timeline se construirá automáticamente cuando el agente de monitoreo 
                detecte actualizaciones sobre este anuncio.
              </p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
          <h3 className="text-base sm:text-lg font-semibold font-sans-tech text-white mb-2 sm:mb-3 flex items-center gap-2">
            <span className="text-amber-500">🤖</span> Sobre este Timeline
          </h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-sans-tech">
            Este timeline se actualiza automáticamente mediante agentes de IA que monitorean 
            noticias y comunicados oficiales. Cada evento está respaldado por fuentes verificables 
            para garantizar la transparencia y accountability del gobierno mexicano en materia de IA.
          </p>
        </div>
      </div>
    </div>
  );
}
