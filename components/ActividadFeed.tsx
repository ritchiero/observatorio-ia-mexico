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
      <div className="text-gray-500 text-center py-8">
        No hay actividad registrada aún.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actividad.map((item) => {
        const fecha = item.fecha ? new Date(item.fecha as unknown as string) : null;
        const Icon = tipoIconos[item.tipo] || ClipboardDocumentListIcon;

        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Icon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDate(fecha)}
                </div>
                <p className="text-gray-700">{item.descripcion}</p>
                {item.anuncioId && item.anuncioTitulo && (
                  <Link
                    href={`/anuncio/${item.anuncioId}`}
                    className="text-gray-900 hover:underline text-sm mt-2 inline-block font-medium"
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
