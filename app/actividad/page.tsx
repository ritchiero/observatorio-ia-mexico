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
      <div className="flex justify-center items-center min-h-[400px] bg-gray-950">
        <div className="text-lg sm:text-xl text-gray-400 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-3">
          <span className="text-cyan-400">⚡</span>
          Actividad Reciente
        </h1>
        <ActividadFeed actividad={actividad} />
      </div>
    </div>
  );
}
