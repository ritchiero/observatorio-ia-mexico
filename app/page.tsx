'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  // Función para calcular días vencidos
  const calcularDiasVencidos = (fechaPrometida: string): number => {
    const meses: {[key: string]: number} = {
      'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
    };
    const [mesStr, yearStr] = fechaPrometida.split(' ');
    const mes = meses[mesStr];
    const year = parseInt(yearStr);
    // Último día del mes prometido
    const fechaLimite = new Date(year, mes + 1, 0);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fechaLimite.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
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
      diasVencidos: 67,
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
      incumplido: 'bg-red-900/20 text-red-400 border-red-800/30',
      en_desarrollo: 'bg-amber-900/20 text-amber-400 border-amber-800/30',
      prometido: 'bg-gray-800/40 text-gray-400 border-gray-700/30',
      operando: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30',
      abandonado: 'bg-gray-800/40 text-gray-500 border-gray-700/30',
    };
    return colors[status as keyof typeof colors] || colors.prometido;
  };

  const getLogo = (responsable: string) => {
    if (responsable.includes('Sheinbaum')) return '/logos/presidencia.jpg';
    if (responsable.includes('Ebrard')) return '/logos/economia.png';
    if (responsable.includes('Economía') || responsable.includes('SE')) return '/logos/economia.png';
    if (responsable.includes('SEP')) return '/logos/sep.png';
    if (responsable.includes('Senado')) return '/logos/senado.jpg';
    if (responsable.includes('CCE')) return '/logos/cce.jpg';
    if (responsable.includes('Infotec') || responsable.includes('ATDT') || responsable.includes('TecNM')) return '/logos/infotec.jpg';
    if (responsable.includes('Saptiva')) return '/logos/economia.png';
    return '/logos/presidencia.jpg'; // Default
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
    <div className="min-h-screen bg-[#030303]">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Sección: Cómo funciona - Observatorio Automatizado */}
      <section id="metodologia" className="bg-[#0a0a0a] border-y border-white/5 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-white mb-3">
              Auditoría <span className="italic text-amber-500">automatizada</span>
            </h2>
            <p className="text-white/60 font-sans-tech text-sm sm:text-base max-w-2xl mx-auto">
              Este observatorio utiliza <span className="text-amber-400 font-medium">agentes de inteligencia artificial</span> que trabajan 24/7 para rastrear, verificar y actualizar el estado de cada promesa gubernamental.
            </p>
          </div>

          {/* Flujo de los agentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Agente 1: Detección */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-amber-500/30 hover:bg-white/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-900/30 border border-amber-700/30 flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-white text-sm sm:text-base">Agente de Detección</h3>
                  <p className="text-xs text-white/40">Busca nuevos anuncios</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Escanea diariamente noticias, comunicados oficiales y redes sociales para detectar <span className="text-amber-400">nuevas promesas</span> del gobierno relacionadas con IA.
              </p>
            </div>

            {/* Agente 2: Monitoreo */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-amber-500/30 hover:bg-white/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-900/30 border border-amber-700/30 flex items-center justify-center">
                  <span className="text-lg">📡</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-white text-sm sm:text-base">Agente de Monitoreo</h3>
                  <p className="text-xs text-white/40">Verifica el progreso</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Rastrea cada anuncio existente buscando <span className="text-amber-400">evidencia de avance</span>: ¿hay presupuesto? ¿hay licitaciones? ¿hay código público? ¿hay producto funcionando?
              </p>
            </div>

            {/* Resultado: Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-amber-500/30 hover:bg-white/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-900/30 border border-amber-700/30 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-white text-sm sm:text-base">Timeline Verificable</h3>
                  <p className="text-xs text-white/40">Con fuentes citadas</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Cada cambio de estado incluye <span className="text-amber-400">fuentes verificables</span>: enlaces a notas de prensa, documentos oficiales y citas textuales.
              </p>
            </div>
          </div>

          {/* Nota técnica */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              Ejecutándose automáticamente cada 24 horas
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-xs text-white/40 font-mono">
              Construido con Claude AI + web search
            </span>
          </div>
        </div>
      </section>

      {/* Barra de estadísticas */}
      <section className="bg-[#0a0a0a] border-b border-white/5 py-3 sm:py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Vista móvil: grid compacto */}
          <div className="grid grid-cols-5 gap-2 text-center sm:hidden">
            <div className="bg-white/5 rounded-lg py-2 px-1 border border-white/10">
              <div className="text-lg font-bold text-white">{stats.total}</div>
              <div className="text-[10px] text-white/40">Total</div>
            </div>
            <div className="bg-red-900/20 rounded-lg py-2 px-1 border border-red-800/30">
              <div className="text-lg font-bold text-red-400">{stats.operando}</div>
              <div className="text-[10px] text-white/40">Operando</div>
            </div>
            <div className="bg-amber-900/20 rounded-lg py-2 px-1 border border-amber-800/30">
              <div className="text-lg font-bold text-amber-400">{stats.enDesarrollo}</div>
              <div className="text-[10px] text-white/40">Desarrollo</div>
            </div>
            <div className="bg-red-900/20 rounded-lg py-2 px-1 border border-red-800/30">
              <div className="text-lg font-bold text-red-400">{stats.incumplido}</div>
              <div className="text-[10px] text-white/40">Incumplido</div>
            </div>
            <div className="bg-white/5 rounded-lg py-2 px-1 border border-white/10">
              <div className="text-lg font-bold text-white/60">{stats.prometido}</div>
              <div className="text-[10px] text-white/40">Prometido</div>
            </div>
          </div>

          {/* Vista desktop: horizontal */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 text-sm font-sans-tech">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <span className="font-medium text-white/50">Total:</span>{' '}
                <span className="text-white font-semibold">{stats.total}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div>
                <span className="font-medium text-red-400">Operando:</span>{' '}
                <span className="font-bold text-red-400">{stats.operando}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div>
                <span className="font-medium text-amber-400">En desarrollo:</span>{' '}
                <span className="text-amber-400">{stats.enDesarrollo}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div>
                <span className="font-medium text-red-400">Incumplido:</span>{' '}
                <span className="text-red-400">{stats.incumplido}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden md:block" />
              <div>
                <span className="font-medium text-white/50">Prometido:</span>{' '}
                <span className="text-white/60">{stats.prometido}</span>
              </div>
            </div>
            <div className="text-xs text-white/30 flex items-center gap-1.5 font-mono">
              <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Última actualización: 6 dic 2025
            </div>
          </div>
          
          {/* Fecha de actualización móvil */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-[10px] text-white/30 font-mono">Última actualización: 6 dic 2025</span>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section id="tracker" className="py-8 sm:py-12 md:py-16 px-4 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-white flex items-center gap-3">
              Anuncios de <span className="italic text-amber-500">IA</span> en 2025
            </h2>
            
            {/* Filtro por status */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium font-sans-tech text-white/50 hidden sm:inline">Filtrar:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/5 text-white font-sans-tech backdrop-blur-sm"
              >
                <option value="todos" className="bg-[#0a0a0a]">Todos ({stats.total})</option>
                <option value="incumplido" className="bg-[#0a0a0a]">🔴 Incumplido ({stats.incumplido})</option>
                <option value="en_desarrollo" className="bg-[#0a0a0a]">🟡 En desarrollo ({stats.enDesarrollo})</option>
                <option value="prometido" className="bg-[#0a0a0a]">⚪ Prometido ({stats.prometido})</option>
                <option value="operando" className="bg-[#0a0a0a]">🟢 Operando ({stats.operando})</option>
              </select>
            </div>
          </div>

          {/* Vista móvil: Cards */}
          <div className="md:hidden space-y-3">
            {anunciosFiltrados.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(`/anuncio/${item.id}`)}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-amber-500/30 hover:bg-white/[0.07] cursor-pointer transition-all active:bg-white/10 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={getLogo(item.responsable)} alt="" className="w-7 h-7 object-contain rounded" />
                      <span className="text-xs text-white/40 font-mono">{item.fecha}</span>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs text-white/40 font-sans-tech">{item.responsable}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white font-sans-tech">{item.anuncio}</h3>
                  </div>
                  <div className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded font-sans-tech ${getStatusColor(item.status)}`}>
                    <span>{getStatusEmoji(item.status)}</span>
                    <span className="hidden xs:inline">{item.statusLabel}</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 font-sans-tech">{item.detalle}</p>
                {item.fechaPrometida && !item.cumplida && item.status === 'incumplido' && (
                  <div className="text-xs text-red-400 mt-2 flex items-center gap-1 font-medium font-mono">
                    <span>⏱️</span> Incumplido hace {item.diasVencidos || calcularDiasVencidos(item.fechaPrometida)} días
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista desktop: Tabla */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-white/10 backdrop-blur-sm">
            <table key={filtroStatus} className="w-full">
              <thead className="bg-white/5 text-white/70 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium font-sans-tech">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium font-sans-tech">Anuncio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium font-sans-tech">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium font-sans-tech">Estado</th>
                </tr>
              </thead>
              <tbody>
                {anunciosFiltrados.map((item, index) => (
                  <tr 
                    key={index}
                    onClick={() => router.push(`/anuncio/${item.id}`)}
                    className={`border-b border-white/5 hover:bg-white/[0.07] cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-white/50 font-mono whitespace-nowrap">{item.fecha}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white font-sans-tech">{item.anuncio}</div>
                      <div className="text-xs text-white/40 mt-1 font-sans-tech">{item.detalle}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <img src={getLogo(item.responsable)} alt="" className="w-8 h-8 object-contain rounded" />
                        <span className="text-sm text-white/60 font-sans-tech">{item.responsable}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded font-sans-tech ${getStatusColor(item.status)}`}>
                        <span>{getStatusEmoji(item.status)}</span>
                        <span>{item.statusLabel}</span>
                      </div>
                      {item.fechaPrometida && !item.cumplida && item.status === 'incumplido' && (
                        <div className="text-xs text-red-400 mt-1 font-medium font-mono">
                          ⏱️ Incumplido hace {item.diasVencidos || calcularDiasVencidos(item.fechaPrometida)} días
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
