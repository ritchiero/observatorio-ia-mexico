import Link from 'next/link';
import { ActividadLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  CpuChipIcon, 
  PencilSquareIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface ActividadFeedProps {
  actividad: ActividadLog[];
}

const tipoIconos: Record<string, React.ComponentType<{ className?: string }>> = {
  nuevo_anuncio: PlusCircleIcon,
  cambio_status: ArrowPathIcon,
  actualizacion: DocumentTextIcon,
  agente_ejecutado: CpuChipIcon,
  anuncio_manual: PencilSquareIcon,
};

export default function ActividadFeed({ actividad }: ActividadFeedProps) {
  if (actividad.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8 text-sm sm:text-base">
        No hay actividad registrada aún.
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {actividad.map((item) => {
        const fecha = item.fecha ? new Date(item.fecha as unknown as string) : null;
        const Icon = tipoIconos[item.tipo] || ClipboardDocumentListIcon;

        return (
          <div
            key={item.id}
            className="bg-gray-900 rounded-lg border border-gray-800 p-3 sm:p-4 hover:border-cyan-800/50 transition-colors"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">
                  {formatDate(fecha)}
                </div>
                <p className="text-sm sm:text-base text-gray-300">{item.descripcion}</p>
                {item.anuncioId && item.anuncioTitulo && (
                  <Link
                    href={`/anuncio/${item.anuncioId}`}
                    className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm mt-2 inline-block font-medium transition-colors"
                  >
                    Ver anuncio: {item.anuncioTitulo} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
