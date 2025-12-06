import { Actualizacion } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface TimelineProps {
  actualizaciones: Actualizacion[];
}

export default function Timeline({ actualizaciones }: TimelineProps) {
  if (actualizaciones.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No hay actualizaciones registradas aún.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actualizaciones.map((act, index) => {
        const fecha = act.fecha ? new Date(act.fecha as unknown as string) : null;
        const Icon = act.cambioStatus ? ArrowPathIcon : DocumentTextIcon;
        
        return (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
              {index < actualizaciones.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mx-auto mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(fecha)}
                </div>
                {act.cambioStatus && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      Status: {act.statusAnterior} → {act.statusNuevo}
                    </span>
                  </div>
                )}
                <p className="text-gray-700">{act.descripcion}</p>
                {act.fuente && (
                  <a
                    href={act.fuente}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline text-sm mt-2 inline-block"
                  >
                    Ver fuente →
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
