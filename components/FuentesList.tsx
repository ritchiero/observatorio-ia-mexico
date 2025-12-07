'use client';

import { Fuente } from '@/types';
import { Timestamp } from 'firebase/firestore';

interface FuentesListProps {
  fuentes?: Fuente[];
  fuenteOriginal?: string; // Fallback para anuncios no migrados
}

function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return date.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function FuentesList({ fuentes, fuenteOriginal }: FuentesListProps) {
  // Si no hay fuentes pero hay fuenteOriginal, mostrar fallback
  if (!fuentes || fuentes.length === 0) {
    if (fuenteOriginal) {
      return (
        <div className="space-y-3">
          <div className="border-l-2 border-gray-300/20 pl-4">
            <p className="font-medium font-sans-tech text-gray-900/70">Fuente original</p>
            <a 
              href={fuenteOriginal} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm break-all inline-flex items-center gap-1 font-mono transition-colors"
            >
              {fuenteOriginal}
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <p className="text-gray-900/50 italic text-sm font-sans-tech">
        No hay fuentes registradas para este anuncio.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {fuentes.map((fuente, index) => (
        <div key={index} className="border-l-2 border-blue-500/30 pl-4 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-900/50 font-mono">
              {formatDate(fuente.fecha)}
            </span>
            {fuente.tipo === 'anuncio_original' && (
              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded font-sans-tech">
                Original
              </span>
            )}
            {fuente.tipo === 'nota_prensa' && (
              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded font-sans-tech">
                Prensa
              </span>
            )}
            {fuente.tipo === 'declaracion' && (
              <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded font-sans-tech">
                Declaración
              </span>
            )}
            {fuente.accesible === true && (
              <span className="text-emerald-400 text-xs">✅</span>
            )}
            {fuente.accesible === false && (
              <span className="text-red-400 text-xs" title="Fuente no disponible">
                ❌
              </span>
            )}
          </div>
          
          <p className="font-medium font-sans-tech text-gray-900 mb-1">{fuente.titulo}</p>
          
          <a 
            href={fuente.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm break-all inline-flex items-center gap-1 font-mono transition-colors"
          >
            {fuente.url.length > 80 ? fuente.url.substring(0, 80) + '...' : fuente.url}
            <span className="text-xs">↗</span>
          </a>
          
          {fuente.waybackUrl && fuente.accesible === false && (
            <div className="mt-2">
              <a 
                href={fuente.waybackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900/60 hover:text-gray-900/80 text-xs inline-flex items-center gap-1 font-sans-tech transition-colors"
              >
                📦 Ver en Internet Archive
                <span className="text-xs">↗</span>
              </a>
            </div>
          )}
          
          {fuente.extracto && (
            <blockquote className="mt-2 text-gray-900/60 text-sm italic border-l-2 border-gray-300/20 pl-3 py-1 font-serif-display">
              "{fuente.extracto}"
            </blockquote>
          )}
        </div>
      ))}
    </div>
  );
}
