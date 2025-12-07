'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anuncio } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import { formatDate } from '@/lib/utils';

export default function AnuncioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/anuncios/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setAnuncio(data.anuncio || null);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al cargar anuncio:', err);
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

  return (
    <div className="space-y-8">
      {/* Botón volver */}
      <button
        onClick={() => router.push('/')}
        className="text-blue-600 hover:underline flex items-center gap-2"
      >
        ← Volver al dashboard
      </button>

      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {anuncio.titulo}
          </h1>
          <StatusBadge status={anuncio.status} />
        </div>

        <p className="text-gray-700 text-lg mb-6">
          {anuncio.descripcion}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Responsable:</span>
            <span className="ml-2 text-gray-900">{anuncio.responsable}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Dependencia:</span>
            <span className="ml-2 text-gray-900">{anuncio.dependencia}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Fecha de anuncio:</span>
            <span className="ml-2 text-gray-900">{formatDate(fechaAnuncio)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Fecha prometida:</span>
            <span className="ml-2 text-gray-900">{formatDate(fechaPrometida)}</span>
          </div>
        </div>

        {anuncio.citaPromesa && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Cita de la promesa:
            </p>
            <p className="text-gray-700 italic">&ldquo;{anuncio.citaPromesa}&rdquo;</p>
          </div>
        )}

        {anuncio.fuenteOriginal && (
          <div className="mt-4">
            <a
              href={anuncio.fuenteOriginal}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Ver fuente original →
            </a>
          </div>
        )}
      </div>

      {/* Historial de seguimiento */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Historial de Seguimiento
        </h2>
        <Timeline actualizaciones={anuncio.actualizaciones || []} />
      </div>
    </div>
  );
}
