'use client';

import { useState } from 'react';
import { IniciativaLegislativa, IniciativaStatus, CategoriaImpacto } from '@/types';
import { FileText, Scale, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Props {
  iniciativas: IniciativaLegislativa[];
}

export default function LegislacionClient({ iniciativas }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<IniciativaStatus | 'todos'>('todos');
  const [filtroLegislatura, setFiltroLegislatura] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const getCategoriaLabel = (categoria: CategoriaImpacto | string): string => {
    const labels: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'Propiedad Intelectual',
      'responsabilidad': 'Responsabilidad',
      'etica': 'Ética',
      'ciberseguridad': 'Ciberseguridad',
      'seguridad_nacional': 'Seguridad Nacional',
      'justicia': 'Justicia',
      'educacion': 'Educación',
      'salud': 'Salud',
      'privacidad': 'Privacidad',
      'derechos_autor': 'Derechos de Autor',
      'violencia_genero': 'Violencia de Género',
      'transparencia': 'Transparencia',
      'trabajo': 'Trabajo',
      'economia': 'Economía'
    };
    return labels[categoria as CategoriaImpacto] || categoria;
  };

  const getCategoriaColor = (categoria: CategoriaImpacto | string): string => {
    const colors: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'bg-purple-100 text-purple-700 border-purple-200',
      'responsabilidad': 'bg-red-100 text-red-700 border-red-200',
      'etica': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'ciberseguridad': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'seguridad_nacional': 'bg-orange-100 text-orange-700 border-orange-200',
      'justicia': 'bg-blue-100 text-blue-700 border-blue-200',
      'educacion': 'bg-green-100 text-green-700 border-green-200',
      'salud': 'bg-pink-100 text-pink-700 border-pink-200',
      'privacidad': 'bg-violet-100 text-violet-700 border-violet-200',
      'derechos_autor': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'violencia_genero': 'bg-rose-100 text-rose-700 border-rose-200',
      'transparencia': 'bg-teal-100 text-teal-700 border-teal-200',
      'trabajo': 'bg-amber-100 text-amber-700 border-amber-200',
      'economia': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return colors[categoria as CategoriaImpacto] || 'bg-gray-100 text-gray-700 border-gray-200';
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
                <th className="w-8 px-2 py-3"></th>
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
                const isExpanded = expandedId === iniciativa.id;
                
                return (
                  <>
                    <tr 
                      key={iniciativa.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : iniciativa.id)}
                    >
                      <td className="px-2 py-4 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-blue-600 font-medium">
                          {iniciativa.titulo}
                        </div>
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
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr key={`${iniciativa.id}-expanded`}>
                        <td colSpan={6} className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                          <div className="max-w-4xl">
                            {/* Resumen */}
                            {iniciativa.resumen && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Resumen de la propuesta</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {iniciativa.resumen}
                                </p>
                              </div>
                            )}
                            
                            {/* Categorías de Impacto */}
                            {iniciativa.categoriasImpacto && iniciativa.categoriasImpacto.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Categorías de impacto</h4>
                                <div className="flex flex-wrap gap-2">
                                  {iniciativa.categoriasImpacto.map((categoria) => (
                                    <span 
                                      key={categoria}
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoriaColor(categoria)}`}
                                    >
                                      {getCategoriaLabel(categoria)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Mensaje cuando no hay datos */}
                            {!iniciativa.resumen && (!iniciativa.categoriasImpacto || iniciativa.categoriasImpacto.length === 0) && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 italic">
                                  Esta iniciativa aún no cuenta con resumen detallado ni categorías de impacto.
                                </p>
                              </div>
                            )}
                            
                            {/* Enlaces */}
                            <div className="flex gap-4 mt-4">
                              <Link 
                                href={`/legislacion/${iniciativa.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ver detalles completos →
                              </Link>
                              {iniciativa.urlPDF && (
                                <a 
                                  href={iniciativa.urlPDF}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Ver PDF oficial ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
