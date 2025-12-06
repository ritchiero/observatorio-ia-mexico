import Link from 'next/link';
import { Anuncio } from '@/types';
import StatusBadge from './StatusBadge';

interface AnuncioCardProps {
  anuncio: Anuncio;
}

export default function AnuncioCard({ anuncio }: AnuncioCardProps) {
  const fechaAnuncio = anuncio.fechaAnuncio ? new Date(anuncio.fechaAnuncio as unknown as string) : null;
  const fechaPrometida = anuncio.fechaPrometida ? new Date(anuncio.fechaPrometida as unknown as string) : null;

  return (
    <Link href={`/anuncio/${anuncio.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-colors cursor-pointer">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {anuncio.titulo}
          </h3>
          <StatusBadge status={anuncio.status} />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {anuncio.descripcion}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div>
            Anunciado: {fechaAnuncio?.toLocaleDateString('es-MX')}
          </div>
          {fechaPrometida && (
            <div>
              Prometido: {fechaPrometida.toLocaleDateString('es-MX')}
            </div>
          )}
          <div>
            {anuncio.responsable}
          </div>
        </div>
      </div>
    </Link>
  );
}
