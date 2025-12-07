'use client';

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
      incumplido: 'bg-red-50 text-red-600 border-red-200',
      en_desarrollo: 'bg-amber-50 text-amber-600 border-amber-200',
      prometido: 'bg-gray-100 text-gray-600 border-gray-300',
      operando: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      abandonado: 'bg-gray-200 text-gray-700 border-gray-300',
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
      {/* Hero con impacto - Estilo Light */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white text-gray-900 py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
        {/* Fondo con patrón de grid sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradiente de acento */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-gradient-to-b from-cyan-200/40 via-blue-100/30 to-transparent blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto">
          {/* Badge de IA */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs sm:text-sm shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-gray-600">Auditoría automatizada con agentes de IA</span>
              <span className="text-cyan-600">🤖</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 text-center max-w-md">
              Un sistema que usa inteligencia artificial para rastrear y verificar automáticamente las promesas del gobierno mexicano sobre IA
            </p>
          </div>
          
          <div className="flex items-baseline justify-center gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-8xl font-bold mb-1 sm:mb-2 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent">10</div>
              <div className="text-xs sm:text-sm text-gray-500">anuncios principales<br />en 2025</div>
            </div>
            <div className="text-center">
              <div className="text-5xl sm:text-6xl md:text-8xl font-bold mb-1 sm:mb-2 bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">0</div>
              <div className="text-xs sm:text-sm text-gray-500">productos funcionando<br />a escala</div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-gray-600 text-center px-2">
            México ha anunciado ambiciosas metas en IA: laboratorios nacionales, modelos de lenguaje 
            soberanos, supercomputadoras. <span className="font-semibold text-gray-900">A diciembre de 2025, el inventario de lo que realmente funciona: cero productos a escala.</span>
          </p>

          {/* Badge México + IA */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <span className="text-2xl">🇲🇽</span>
              <div className="h-6 w-px bg-gray-200" />
              <span className="text-sm font-medium text-gray-600">Observatorio ciudadano de <span className="text-cyan-600 font-semibold">Inteligencia Artificial</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Cómo funciona - Observatorio Automatizado */}
      <section className="bg-gray-50 border-y border-gray-200 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              <span className="text-cyan-600">🤖</span> Auditoría automatizada con IA
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Este observatorio utiliza <span className="text-cyan-600 font-medium">agentes de inteligencia artificial</span> que trabajan 24/7 para rastrear, verificar y actualizar el estado de cada promesa gubernamental.
            </p>
          </div>

          {/* Flujo de los agentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Agente 1: Detección */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Agente de Detección</h3>
                  <p className="text-xs text-gray-500">Busca nuevos anuncios</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Escanea diariamente noticias, comunicados oficiales y redes sociales para detectar <span className="text-cyan-600">nuevas promesas</span> del gobierno relacionadas con IA.
              </p>
            </div>

            {/* Agente 2: Monitoreo */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-amber-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <span className="text-lg">📡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Agente de Monitoreo</h3>
                  <p className="text-xs text-gray-500">Verifica el progreso</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Rastrea cada anuncio existente buscando <span className="text-amber-600">evidencia de avance</span>: ¿hay presupuesto? ¿hay licitaciones? ¿hay código público? ¿hay producto funcionando?
              </p>
            </div>

            {/* Resultado: Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Timeline Verificable</h3>
                  <p className="text-xs text-gray-500">Con fuentes citadas</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Cada cambio de estado incluye <span className="text-emerald-600">fuentes verificables</span>: enlaces a notas de prensa, documentos oficiales y citas textuales.
              </p>
            </div>
          </div>

          {/* Nota técnica */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Ejecutándose automáticamente cada 24 horas
            </div>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-xs text-gray-500">
              Construido con Claude AI + web search
            </span>
          </div>
        </div>
      </section>

      {/* Barra de estadísticas */}
      <section className="bg-white border-y border-gray-200 py-3 sm:py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Vista móvil: grid compacto */}
          <div className="grid grid-cols-5 gap-2 text-center sm:hidden">
            <div className="bg-gray-50 rounded-lg py-2 px-1 border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-[10px] text-gray-500">Total</div>
            </div>
            <div className="bg-emerald-50 rounded-lg py-2 px-1 border border-emerald-200">
              <div className="text-lg font-bold text-emerald-600">{stats.operando}</div>
              <div className="text-[10px] text-gray-500">Operando</div>
            </div>
            <div className="bg-amber-50 rounded-lg py-2 px-1 border border-amber-200">
              <div className="text-lg font-bold text-amber-600">{stats.enDesarrollo}</div>
              <div className="text-[10px] text-gray-500">Desarrollo</div>
            </div>
            <div className="bg-red-50 rounded-lg py-2 px-1 border border-red-200">
              <div className="text-lg font-bold text-red-600">{stats.incumplido}</div>
              <div className="text-[10px] text-gray-500">Incumplido</div>
            </div>
            <div className="bg-gray-50 rounded-lg py-2 px-1 border border-gray-200">
              <div className="text-lg font-bold text-gray-600">{stats.prometido}</div>
              <div className="text-[10px] text-gray-500">Prometido</div>
            </div>
          </div>

          {/* Vista desktop: horizontal */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <span className="font-medium text-gray-500">Total:</span>{' '}
                <span className="text-gray-900 font-semibold">{stats.total}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-emerald-600">Operando:</span>{' '}
                <span className="font-bold text-emerald-600">{stats.operando}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-amber-600">En desarrollo:</span>{' '}
                <span className="text-amber-600">{stats.enDesarrollo}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-red-600">Incumplido:</span>{' '}
                <span className="text-red-600">{stats.incumplido}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-gray-500">Prometido:</span>{' '}
                <span className="text-gray-600">{stats.prometido}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Última actualización: 6 dic 2025
            </div>
          </div>
          
          {/* Fecha de actualización móvil */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-[10px] text-gray-500">Última actualización: 6 dic 2025</span>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-cyan-600">📊</span>
              Anuncios de IA en 2025
            </h2>
            
            {/* Filtro por status */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-500 hidden sm:inline">Filtrar:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-gray-700"
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
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-cyan-300 hover:shadow-md cursor-pointer transition-all active:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.fecha}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-500">{item.responsable}</span>
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
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table key={filtroStatus} className="w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Anuncio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {anunciosFiltrados.map((item, index) => (
                  <tr 
                    key={index}
                    onClick={() => router.push(`/anuncio/${item.id}`)}
                    className={`border-b border-gray-100 hover:bg-cyan-50 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{item.fecha}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.anuncio}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.detalle}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.responsable}</td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded ${getStatusColor(item.status)}`}>
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
