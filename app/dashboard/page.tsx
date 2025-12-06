'use client';

import { useEffect, useState } from 'react';
import { Anuncio } from '@/types';
import StatsOverview from '@/components/StatsOverview';
import AnuncioCard from '@/components/AnuncioCard';

export default function DashboardPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');

  useEffect(() => {
    fetch('/api/anuncios')
      .then(res => res.json())
      .then(data => {
        setAnuncios(data.anuncios || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar anuncios:', err);
        setLoading(false);
      });
  }, []);

  const filteredAnuncios = filter === 'todos'
    ? anuncios
    : anuncios.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Seguimiento en tiempo real de anuncios gubernamentales sobre inteligencia artificial
        </p>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Resumen General
        </h2>
        <StatsOverview anuncios={anuncios} />
      </section>

      {/* Anuncios List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Todos los Anuncios
          </h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="todos">Todos</option>
            <option value="operando">Operando</option>
            <option value="en_desarrollo">En Desarrollo</option>
            <option value="prometido">Prometido</option>
            <option value="incumplido">Incumplido</option>
            <option value="abandonado">Abandonado</option>
          </select>
        </div>

        {filteredAnuncios.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No hay anuncios registrados aún.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAnuncios.map((anuncio) => (
              <AnuncioCard key={anuncio.id} anuncio={anuncio} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
