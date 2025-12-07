'use client';

import { useEffect, useState } from 'react';
import { ActividadLog } from '@/types';
import ActividadFeed from '@/components/ActividadFeed';

export default function ActividadPage() {
  const [actividad, setActividad] = useState<ActividadLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/actividad')
      .then(res => res.json())
      .then(data => {
        setActividad(data.actividad || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar actividad:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg sm:text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
        Actividad Reciente
      </h1>
      <ActividadFeed actividad={actividad} />
    </div>
  );
}
