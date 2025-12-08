'use client';

import { useState } from 'react';
import { IniciativaLegislativa, IniciativaStatus } from '@/types';
import { FileText, Scale, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  iniciativas: IniciativaLegislativa[];
}

export default function LegislacionClient({ iniciativas }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<IniciativaStatus | 'todos'>('todos');
  const [filtroLegislatura, setFiltroLegislatura] = useState<string>('todos');

  const iniciativasFiltradas = iniciativas.filter(i => {
    if (filtroStatus !== 'todos' && i.status !== filtroStatus) return false;
    if (filtroLegislatura !== 'todos' && i.legislatura !== filtroLegislatura) return false;
    return true;
  });

  const stats = {
    total: iniciativas.length,
    activas: iniciativas.filter(i => i.status === 'en_comisiones').length,
    desechadas: iniciativas.filter(i => i.status === 'desechada_termino' || i.status === 'archivada').length,
    aprobadas: iniciativas.filter(i => i.status === 'aprobada').length
  };

  const getStatusBadge = (status: IniciativaStatus) => {
    const badges = {
      'en_comisiones': { text: 'En comisiones', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'desechada_termino': { text: 'Desechada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: 'Archivada', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'aprobada': { text: 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' },
      'rechazada': { text: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
      'turnada': { text: 'Turnada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Dictaminada', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    };
    return badges[status] || badges['en_comisiones'];
  };

  const formatFecha = (fecha: any) => {
    if (!fecha) return 'N/A';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (iniciativas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Base de datos en preparación
          </h2>
          <p className="text-gray-600">
            Estamos importando las 69 iniciativas legislativas documentadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-serif font-bold text-gray-900">
              Legislación en IA
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Seguimiento automatizado de iniciativas, dictámenes y leyes relacionadas con inteligencia artificial en México
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Iniciativas</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-3xl font-bold text-blue-700">{stats.activas}</div>
              <div className="text-sm text-blue-600 mt-1">Activas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-3xl font-bold text-gray-700">{stats.desechadas}</div>
              <div className="text-sm text-gray-600 mt-1">Desechadas</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-3xl font-bold text-green-700">{stats.aprobadas}</div>
              <div className="text-sm text-green-600 mt-1">Aprobadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as IniciativaStatus | 'todos')}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="en_comisiones">En comisiones</option>
              <option value="desechada_termino">Desechadas</option>
              <option value="archivada">Archivadas</option>
              <option value="aprobada">Aprobadas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Legislatura</label>
            <select
              value={filtroLegislatura}
              onChange={(e) => setFiltroLegislatura(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todas</option>
              <option value="LXV">LXV (2021-2024)</option>
              <option value="LXVI">LXVI (2024-2027)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iniciativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proponente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Legislatura
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {iniciativasFiltradas.map((iniciativa) => {
                const badge = getStatusBadge(iniciativa.status);
                return (
                  <tr key={iniciativa.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/legislacion/${iniciativa.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {iniciativa.titulo}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        {iniciativa.tipo} · {iniciativa.camara}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {iniciativa.proponente}
                      <div className="text-xs text-gray-500">{iniciativa.partido}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatFecha(iniciativa.fecha)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {iniciativa.legislatura}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
