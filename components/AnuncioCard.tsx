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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-cyan-800/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-900/10">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white flex-1 line-clamp-2">
            {anuncio.titulo}
          </h3>
          <StatusBadge status={anuncio.status} />
        </div>

        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {anuncio.descripcion}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {fechaAnuncio && (
            <div>
              Anunciado: {fechaAnuncio.toLocaleDateString('es-MX')}
            </div>
          )}
          {fechaPrometida && (
            <div>
              Prometido: {fechaPrometida.toLocaleDateString('es-MX')}
            </div>
          )}
          {anuncio.responsable && (
            <div className="truncate text-cyan-500/70">
              {anuncio.responsable}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
