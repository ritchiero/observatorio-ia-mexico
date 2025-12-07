'use client';

import { useState } from 'react';
import { EventoTimeline, TipoEvento, ImpactoEvento } from '@/types';

interface TimelineInteractivoProps {
  eventos: EventoTimeline[];
}

// Iconos y colores según tipo de evento - tema claro
const tipoEventoConfig: Record<TipoEvento, { icon: string; color: string; bgColor: string }> = {
  anuncio_inicial: { icon: '📢', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  actualizacion: { icon: '📰', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  cambio_status: { icon: '🔄', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  cumplimiento: { icon: '✅', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  incumplimiento: { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-50' },
  retraso: { icon: '⏰', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  progreso: { icon: '📈', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
};

const impactoConfig: Record<ImpactoEvento, { color: string; bgColor: string; label: string }> = {
  positivo: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Positivo' },
  neutral: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Neutral' },
  negativo: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Negativo' },
};

function EventoItem({ evento }: { evento: EventoTimeline }) {
  const [expandido, setExpandido] = useState(false);
  const config = tipoEventoConfig[evento.tipo];
  const impacto = impactoConfig[evento.impacto];

  // Convertir timestamp a fecha - FIX para Invalid Date
  let fecha: Date;
  if ((evento.fecha as any)._seconds) {
    fecha = new Date((evento.fecha as any)._seconds * 1000);
  } else if ((evento.fecha as any).seconds) {
    fecha = new Date((evento.fecha as any).seconds * 1000);
  } else {
    fecha = new Date(evento.fecha as any);
  }
  
  const fechaFormateada = fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="relative pl-6 sm:pl-8 pb-6 sm:pb-8 last:pb-0">
      {/* Línea vertical */}
      <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-0.5 bg-gray-200 last:hidden" />
      
      {/* Punto del timeline */}
      <div className={`absolute left-0 top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${config.bgColor} ${config.color} flex items-center justify-center text-xs sm:text-sm border border-gray-200`}>
        {config.icon}
      </div>

      {/* Contenido del evento */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-cyan-300 hover:shadow-sm transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-medium text-gray-500">{fechaFormateada}</span>
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded ${impacto.color} ${impacto.bgColor}`}>
                {impacto.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{evento.titulo}</h3>
          </div>
          
          {evento.fuentes.length > 0 && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="sm:ml-4 text-xs sm:text-sm text-cyan-600 hover:text-cyan-700 font-medium px-2 py-1 sm:px-0 sm:py-0 rounded hover:bg-cyan-50 sm:hover:bg-transparent self-start transition-colors"
            >
              {expandido ? 'Ocultar' : `${evento.fuentes.length} fuente${evento.fuentes.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Descripción */}
        <p className="text-sm sm:text-base text-gray-600 mb-3">{evento.descripcion}</p>

        {/* Cita textual */}
        {evento.citaTextual && (
          <blockquote className="border-l-2 sm:border-l-4 border-cyan-500 pl-3 sm:pl-4 py-2 mb-3 bg-cyan-50 rounded-r">
            <p className="text-gray-700 italic text-xs sm:text-sm">
              &ldquo;{evento.citaTextual}&rdquo;
            </p>
            {evento.responsable && (
              <footer className="text-xs text-gray-500 mt-1">
                — {evento.responsable}
              </footer>
            )}
          </blockquote>
        )}

        {/* Fuentes (expandible) */}
        {expandido && evento.fuentes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-cyan-600">📎</span> Fuentes Verificables
            </h4>
            <div className="space-y-2">
              {evento.fuentes.map((fuente) => {
                let fechaFuente: Date;
                if ((fuente.fechaPublicacion as any)._seconds) {
                  fechaFuente = new Date((fuente.fechaPublicacion as any)._seconds * 1000);
                } else if ((fuente.fechaPublicacion as any).seconds) {
                  fechaFuente = new Date((fuente.fechaPublicacion as any).seconds * 1000);
                } else {
                  fechaFuente = new Date(fuente.fechaPublicacion as any);
                }
                
                const fechaFuenteFormateada = fechaFuente.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={fuente.id} className="bg-gray-50 border border-gray-200 rounded p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            {fuente.tipo.replace('_', ' ')}
                          </span>
                          {fuente.medio && (
                            <span className="text-xs text-gray-500">{fuente.medio}</span>
                          )}
                          <span className="text-xs text-gray-400">{fechaFuenteFormateada}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {fuente.titulo}
                        </p>
                        {fuente.descripcion && (
                          <p className="text-xs text-gray-500 mb-2">{fuente.descripcion}</p>
                        )}
                        <a
                          href={fuente.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-600 hover:text-cyan-700 inline-block py-1 transition-colors"
                        >
                          Ver fuente →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelineInteractivo({ eventos }: TimelineInteractivoProps) {
  if (eventos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay eventos en el timeline aún.
      </div>
    );
  }

  return (
    <div className="relative">
      {eventos.map((evento) => (
        <EventoItem key={evento.id} evento={evento} />
      ))}
    </div>
  );
}
