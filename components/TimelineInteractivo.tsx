'use client';

import { useState } from 'react';
import { EventoTimeline, TipoEvento, ImpactoEvento } from '@/types';

interface TimelineInteractivoProps {
  eventos: EventoTimeline[];
}

// Iconos y colores según tipo de evento - tema oscuro
const tipoEventoConfig: Record<TipoEvento, { icon: string; color: string; bgColor: string }> = {
  anuncio_inicial: { icon: '📢', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
  actualizacion: { icon: '📰', color: 'text-gray-900/60', bgColor: 'bg-gray-200' },
  cambio_status: { icon: '🔄', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
  cumplimiento: { icon: '✅', color: 'text-emerald-400', bgColor: 'bg-emerald-900/30' },
  incumplimiento: { icon: '❌', color: 'text-red-400', bgColor: 'bg-red-900/30' },
  retraso: { icon: '⏰', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
  progreso: { icon: '📈', color: 'text-emerald-400', bgColor: 'bg-emerald-900/30' },
};

const impactoConfig: Record<ImpactoEvento, { color: string; bgColor: string; label: string }> = {
  positivo: { color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', label: 'Positivo' },
  neutral: { color: 'text-gray-900/60', bgColor: 'bg-gray-200', label: 'Neutral' },
  negativo: { color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Negativo' },
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
      <div className={`absolute left-0 top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${config.bgColor} ${config.color} flex items-center justify-center text-xs sm:text-sm border border-gray-300/20 backdrop-blur-sm`}>
        {config.icon}
      </div>

      {/* Contenido del evento */}
      <div className="bg-gray-100 border border-gray-300/10 rounded-lg p-3 sm:p-4 hover:border-blue-500/30 hover:bg-gray-50/[0.07] transition-all backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs sm:text-sm font-medium font-mono text-gray-900/50">{fechaFormateada}</span>
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded font-sans-tech ${impacto.color} ${impacto.bgColor}`}>
                {impacto.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold font-sans-tech text-gray-900 leading-tight">{evento.titulo}</h3>
          </div>
          
          {evento.fuentes.length > 0 && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="sm:ml-4 text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium font-sans-tech px-2 py-1 sm:px-0 sm:py-0 rounded hover:bg-blue-50 sm:hover:bg-transparent self-start transition-colors"
            >
              {expandido ? 'Ocultar' : `${evento.fuentes.length} fuente${evento.fuentes.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Descripción */}
        <p className="text-sm sm:text-base text-gray-900/70 mb-3 font-sans-tech">{evento.descripcion}</p>

        {/* Cita textual */}
        {evento.citaTextual && (
          <blockquote className="border-l-2 sm:border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 mb-3 bg-blue-50 rounded-r backdrop-blur-sm">
            <p className="text-gray-900/80 italic text-xs sm:text-sm font-serif-display">
              &ldquo;{evento.citaTextual}&rdquo;
            </p>
            {evento.responsable && (
              <footer className="text-xs text-gray-900/50 mt-1 font-sans-tech">
                — {evento.responsable}
              </footer>
            )}
          </blockquote>
        )}

        {/* Fuentes (expandible) */}
        {expandido && evento.fuentes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-300/10">
            <h4 className="text-sm font-semibold font-sans-tech text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-500">📎</span> Fuentes Verificables
            </h4>
            <div className="space-y-2">
              {evento.fuentes.map((fuente) => {
                let fechaFuente: Date;
                if ((fuente.fecha as any)._seconds) {
                  fechaFuente = new Date((fuente.fecha as any)._seconds * 1000);
                } else if ((fuente.fecha as any).seconds) {
                  fechaFuente = new Date((fuente.fecha as any).seconds * 1000);
                } else {
                  fechaFuente = new Date(fuente.fecha as any);
                }
                
                const fechaFuenteFormateada = fechaFuente.toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={fuente.url} className="bg-gray-100 border border-gray-300/10 rounded p-2 sm:p-3 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-900/70 rounded font-sans-tech">
                            {fuente.tipo.replace('_', ' ')}
                          </span>
                          {fuente.medio && (
                            <span className="text-xs text-gray-900/50 font-sans-tech">{fuente.medio}</span>
                          )}
                          <span className="text-xs text-gray-900/40 font-mono">{fechaFuenteFormateada}</span>
                        </div>
                        <p className="text-sm font-medium font-sans-tech text-gray-900 mb-1">
                          {fuente.titulo}
                        </p>
                        {fuente.descripcion && (
                          <p className="text-xs text-gray-900/50 font-sans-tech mb-2">{fuente.descripcion}</p>
                        )}
                        <a
                          href={fuente.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 inline-block py-1 transition-colors font-sans-tech"
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
      <div className="text-center py-8 text-gray-900/50 font-sans-tech">
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
