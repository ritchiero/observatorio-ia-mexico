'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function Home() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const anuncios = [
    // Mapeo: título hardcodeado → ID de Firestore
    {
      id: 'UfSnLrpDhXrNnqy0BKC1',
      fecha: 'Abril',
      anuncio: 'Laboratorio Nacional de IA',
      responsable: 'Sheinbaum',
      status: 'incumplido',
      statusLabel: 'INCUMPLIDO',
      fechaPrometida: 'Oct 2025',
      cumplida: false,
      detalle: 'Prometido para octubre por la presidenta Sheinbaum. Octubre llegó y el laboratorio no.',
    },
    {
      id: 'vfAcJmOlrgAVbwrwU9bA',
      fecha: 'Julio',
      anuncio: 'Modelo de lenguaje propio',
      responsable: 'Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Anunciado en julio por Marcelo Ebrard. Sin documentación técnica ni código público.',
    },
    {
      id: 'fpQIXV5So7Df0Y0TYqaW',
      fecha: 'Julio',
      anuncio: 'Plataforma México IA+',
      responsable: 'Economía + CCE',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Evento realizado. Sin productos concretos.',
    },
    {
      id: 'zSmTpbbyDUtKxc3bhT3a',
      fecha: 'Sept',
      anuncio: 'Inversión CloudHQ $4.8B USD',
      responsable: 'Sheinbaum / Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Anunciado. En planeación.',
    },
    {
      id: 'BUqQ3xZSWblpv5Qb46vB',
      fecha: 'Oct',
      anuncio: 'Marco normativo de IA',
      responsable: 'Senado',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Propuesta publicada. Sin aprobación.',
    },
    {
      id: 'ADyLAhTng95KSjFPUzfO',
      fecha: 'Nov',
      anuncio: 'Centro Público de Formación en IA',
      responsable: 'ATDT + Infotec + TecNM',
      status: 'en_desarrollo',
      statusLabel: 'EN DESARROLLO',
      detalle: 'Convocatoria cerrada. Las clases inician en enero de 2026.',
    },
    {
      id: 'VqNqNJqNGIWqHMsQYGHV',
      fecha: 'Nov',
      anuncio: 'KAL - Modelo de lenguaje mexicano',
      responsable: 'Saptiva + SE',
      status: 'en_desarrollo',
      statusLabel: 'EN DESARROLLO',
      detalle: 'Presentado sin documentación técnica, sin código público, sin benchmarks.',
    },
    {
      id: 'zzNvFLxYWkQrFMZhXOxo',
      fecha: 'Nov',
      anuncio: 'Coatlicue - Supercomputadora',
      responsable: 'Sheinbaum',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Será "la más poderosa de América Latina" cuando se construya en 2026, si todo sale bien.',
    },
    {
      id: 'bfPbGHMxbgHOxNgMJzpH',
      fecha: 'Nov',
      anuncio: 'Regulación regional IA (APEC)',
      responsable: 'Marcelo Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Propuesta diplomática. Sin acuerdo vinculante.',
    },
    {
      id: 'RNMzXVQQOJZZZBHhxlbV',
      fecha: 'Dic',
      anuncio: '15 carreras de bachillerato con IA',
      responsable: 'SEP',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Aprobadas. Implementación: próximo ciclo escolar.',
    },
  ];

  // Filtrar anuncios
  const anunciosFiltrados = useMemo(() => {
    if (filtroStatus === 'todos') return anuncios;
    return anuncios.filter(item => item.status === filtroStatus);
  }, [filtroStatus]);

  // Calcular estadísticas
  const stats = {
    total: anuncios.length,
    operando: anuncios.filter(a => a.status === 'operando').length,
    enDesarrollo: anuncios.filter(a => a.status === 'en_desarrollo').length,
    incumplido: anuncios.filter(a => a.status === 'incumplido').length,
    prometido: anuncios.filter(a => a.status === 'prometido').length,
  };

  const getStatusColor = (status: string) => {
    const colors = {
      incumplido: 'bg-red-50 text-red-700 border-red-200',
      en_desarrollo: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      prometido: 'bg-gray-100 text-gray-700 border-gray-300',
      operando: 'bg-green-50 text-green-700 border-green-200',
      abandonado: 'bg-black text-white border-black',
    };
    return colors[status as keyof typeof colors] || colors.prometido;
  };

  const getStatusEmoji = (status: string) => {
    const emojis = {
      incumplido: '🔴',
      en_desarrollo: '🟡',
      prometido: '⚪',
      operando: '🟢',
      abandonado: '⚫',
    };
    return emojis[status as keyof typeof emojis] || '⚪';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero con impacto - Fondo oscuro */}
      <section className="bg-gray-900 text-white py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline justify-center gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-8xl font-bold mb-1 sm:mb-2">10</div>
              <div className="text-xs sm:text-sm text-gray-400">anuncios principales<br />en 2025</div>
            </div>
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-8xl font-bold text-red-600 mb-1 sm:mb-2">0</div>
              <div className="text-xs sm:text-sm text-gray-400">productos funcionando<br />a escala</div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-gray-300 text-center px-2">
            El gobierno mexicano prometió laboratorios nacionales, modelos de lenguaje soberanos, 
            supercomputadoras con nombres aztecas. A diciembre de 2025, el inventario de lo que 
            realmente funciona cabe en una servilleta.
          </p>


        </div>
      </section>

      {/* Barra de estadísticas */}
      <section className="bg-gray-50 border-y border-gray-200 py-3 sm:py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Vista móvil: grid compacto */}
          <div className="grid grid-cols-5 gap-2 text-center sm:hidden">
            <div className="bg-white rounded-lg py-2 px-1 border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-[10px] text-gray-500">Total</div>
            </div>
            <div className="bg-white rounded-lg py-2 px-1 border border-green-200">
              <div className="text-lg font-bold text-green-600">{stats.operando}</div>
              <div className="text-[10px] text-gray-500">Operando</div>
            </div>
            <div className="bg-white rounded-lg py-2 px-1 border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">{stats.enDesarrollo}</div>
              <div className="text-[10px] text-gray-500">Desarrollo</div>
            </div>
            <div className="bg-white rounded-lg py-2 px-1 border border-red-200">
              <div className="text-lg font-bold text-red-600">{stats.incumplido}</div>
              <div className="text-[10px] text-gray-500">Incumplido</div>
            </div>
            <div className="bg-white rounded-lg py-2 px-1 border border-gray-200">
              <div className="text-lg font-bold text-gray-600">{stats.prometido}</div>
              <div className="text-[10px] text-gray-500">Prometido</div>
            </div>
          </div>

          {/* Vista desktop: horizontal */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <span className="font-medium text-gray-900">Total:</span>{' '}
                <span className="text-gray-600">{stats.total}</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden md:block" />
              <div>
                <span className="font-medium text-green-700">Operando:</span>{' '}
                <span className="font-bold text-green-600">{stats.operando}</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden md:block" />
              <div>
                <span className="font-medium text-yellow-700">En desarrollo:</span>{' '}
                <span className="text-gray-600">{stats.enDesarrollo}</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden md:block" />
              <div>
                <span className="font-medium text-red-700">Incumplido:</span>{' '}
                <span className="text-gray-600">{stats.incumplido}</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden md:block" />
              <div>
                <span className="font-medium text-gray-700">Prometido:</span>{' '}
                <span className="text-gray-600">{stats.prometido}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Última actualización: 6 dic 2025
            </div>
          </div>
          
          {/* Fecha de actualización móvil */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-[10px] text-gray-400">Última actualización: 6 dic 2025</span>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Anuncios de IA en 2025</h2>
            
            {/* Filtro por status */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 hidden sm:inline">Filtrar:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="todos">Todos ({stats.total})</option>
                <option value="incumplido">🔴 Incumplido ({stats.incumplido})</option>
                <option value="en_desarrollo">🟡 En desarrollo ({stats.enDesarrollo})</option>
                <option value="prometido">⚪ Prometido ({stats.prometido})</option>
                <option value="operando">🟢 Operando ({stats.operando})</option>
              </select>
            </div>
          </div>
          
          {/* Vista móvil: Cards */}
          <div className="md:hidden space-y-3">
            {anunciosFiltrados.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(`/anuncio/${item.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all active:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.fecha}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-600">{item.responsable}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{item.anuncio}</h3>
                  </div>
                  <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${getStatusColor(item.status)}`}>
                    <span>{getStatusEmoji(item.status)}</span>
                    <span className="hidden xs:inline">{item.statusLabel}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{item.detalle}</p>
                {item.fechaPrometida && !item.cumplida && (
                  <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <span>📅</span> Prometido: {item.fechaPrometida} ❌
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista desktop: Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table key={filtroStatus} className="w-full border border-gray-200">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Anuncio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {anunciosFiltrados.map((item, index) => (
                  <tr 
                    key={index}
                    onClick={() => router.push(`/anuncio/${item.id}`)}
                    className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{item.fecha}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.anuncio}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.detalle}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.responsable}</td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border ${getStatusColor(item.status)}`}>
                        <span>{getStatusEmoji(item.status)}</span>
                        <span>{item.statusLabel}</span>
                      </div>
                      {item.fechaPrometida && !item.cumplida && (
                        <div className="text-xs text-red-600 mt-1">
                          Fecha prometida: {item.fechaPrometida} ❌
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


        </div>
      </section>
    </div>
  );
}
