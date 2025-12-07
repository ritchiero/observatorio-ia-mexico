'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anuncio, EventoTimeline } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import TimelineInteractivo from '@/components/TimelineInteractivo';
import { formatDate } from '@/lib/utils';

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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Anuncio no encontrado
        </h2>
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:underline"
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
    <div className="space-y-6 sm:space-y-8">
      {/* Botón volver */}
      <button
        onClick={() => router.push('/')}
        className="text-blue-600 hover:underline flex items-center gap-2 text-sm sm:text-base"
      >
        ← Volver al dashboard
      </button>

      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {anuncio.titulo}
          </h1>
          <StatusBadge status={anuncio.status} />
        </div>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6">
          {anuncio.descripcion}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-semibold text-gray-600 mb-1 sm:mb-0">Responsable:</span>
            <span className="sm:ml-2 text-gray-900">{anuncio.responsable}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-semibold text-gray-600 mb-1 sm:mb-0">Dependencia:</span>
            <span className="sm:ml-2 text-gray-900">{anuncio.dependencia}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-semibold text-gray-600 mb-1 sm:mb-0">Fecha de anuncio:</span>
            <span className="sm:ml-2 text-gray-900">{formatDate(fechaAnuncio)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-semibold text-gray-600 mb-1 sm:mb-0">Fecha prometida:</span>
            <span className="sm:ml-2 text-gray-900">{formatDate(fechaPrometida)}</span>
          </div>
        </div>

        {anuncio.citaPromesa && (
          <div className="p-3 sm:p-4 bg-blue-50 border-l-2 sm:border-l-4 border-blue-500 rounded mb-4">
            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
              Cita de la promesa:
            </p>
            <p className="text-sm sm:text-base text-gray-700 italic">&ldquo;{anuncio.citaPromesa}&rdquo;</p>
          </div>
        )}

        {anuncio.fuenteOriginal && (
          <div>
            <a
              href={anuncio.fuenteOriginal}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs sm:text-sm inline-block py-1"
            >
              Ver fuente original →
            </a>
          </div>
        )}
      </div>

      {/* Estadísticas del Timeline */}
      {eventos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{eventos.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Eventos registrados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalFuentes}</div>
              <div className="text-xs sm:text-sm text-gray-600">Fuentes verificadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{eventosPositivos}</div>
              <div className="text-xs sm:text-sm text-gray-600">Avances</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{eventosNegativos}</div>
              <div className="text-xs sm:text-sm text-gray-600">Retrocesos</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Interactivo */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          📅 Timeline de Eventos
        </h2>
        
        {eventos.length > 0 ? (
          <TimelineInteractivo eventos={eventos} />
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p className="mb-2 text-sm sm:text-base">No hay eventos registrados aún.</p>
            <p className="text-xs sm:text-sm">
              El timeline se construirá automáticamente cuando el agente de monitoreo 
              detecte actualizaciones sobre este anuncio.
            </p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
          Sobre este Timeline
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Este timeline se actualiza automáticamente mediante agentes de IA que monitorean 
          noticias y comunicados oficiales. Cada evento está respaldado por fuentes verificables 
          para garantizar la transparencia y accountability del gobierno mexicano en materia de IA.
        </p>
      </div>
    </div>
  );
}
