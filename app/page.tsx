'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import HeroSectionGlass from '@/components/HeroSectionGlass';
import MetodologiaDAG from '@/components/MetodologiaDAG';
import LegislacionEnriched from '@/components/LegislacionEnriched';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnuncioData {
  id: string;
  titulo: string;
  descripcion: string;
  fechaAnuncio: string;
  fechaPrometida?: string;
  responsable: string;
  dependencia: string;
  status: string;
  imagen?: string;
}

export default function Home() {
  const router = useRouter();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [legStats, setLegStats] = useState({ total: 0, activas: 0, aprobadas: 0, verificadas: 0 });
  const [iniciativasDestacadas, setIniciativasDestacadas] = useState<Array<{
    id: string;
    titulo: string;
    status?: string;
    proponente?: string;
    fecha?: string;
    estadoVerificacion?: string;
  }>>([]);
  const [anuncios, setAnuncios] = useState<AnuncioData[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(true);
  const [errorAnuncios, setErrorAnuncios] = useState<string | null>(null);
  const [loadingLegStats, setLoadingLegStats] = useState(true);
  const [casosStats, setCasosStats] = useState({ total: 0, conCriterio: 0 });
  const [loadingCasos, setLoadingCasos] = useState(true);
  const [casosDestacados, setCasosDestacados] = useState<Array<{
    id: string;
    nombre: string;
    temaIA: string;
    resumen: string;
    criterio?: { tiene?: boolean; rubro?: string };
    criterios?: Array<{ tiene?: boolean }>;
  }>>([]);

  // Cargar anuncios/promesas de IA
  useEffect(() => {
    async function fetchAnuncios() {
      try {
        const response = await fetch('/api/anuncios');
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        if (data.anuncios) {
          setAnuncios(data.anuncios);
        }
      } catch (error) {
        console.error('Error fetching anuncios:', error);
        setErrorAnuncios('No se pudieron cargar las promesas');
      } finally {
        setLoadingAnuncios(false);
      }
    }
    fetchAnuncios();
  }, []);

  // Cargar estadísticas de legislación
  useEffect(() => {
    async function fetchLegislacion() {
      try {
        const response = await fetch('/api/iniciativas');
        const data = await response.json();
        if (data.success) {
          const iniciativas = data.data;
          
          // Calcular estadísticas
          const normalizeStatus = (status: string) => {
            const s = (status || '').toLowerCase();
            if (s.includes('aprobad') || s.includes('publicad')) return 'aprobada';
            if (s.includes('desechad') || s.includes('archivad')) return 'desechada';
            return 'activa';
          };
          
          setLegStats({
            total: iniciativas.length,
            activas: iniciativas.filter((i: { status?: string }) => normalizeStatus(i.status || '') === 'activa').length,
            aprobadas: iniciativas.filter((i: { status?: string }) => normalizeStatus(i.status || '') === 'aprobada').length,
            verificadas: iniciativas.filter((i: { estadoVerificacion?: string }) => i.estadoVerificacion === 'verificado').length,
          });
          
          // Obtener 3 iniciativas destacadas (verificadas y recientes)
          const destacadas = iniciativas
            .filter((i: { estadoVerificacion?: string }) => i.estadoVerificacion === 'verificado')
            .slice(0, 3);
          setIniciativasDestacadas(destacadas);
        }
      } catch (error) {
        console.error('Error fetching legislacion:', error);
      } finally {
        setLoadingLegStats(false);
      }
    }
    fetchLegislacion();
  }, []);

  // Cargar estadísticas de casos judiciales
  useEffect(() => {
    async function fetchCasos() {
      try {
        const response = await fetch('/api/casos-ia');
        const data = await response.json();
        if (data.casos) {
          const casos = data.casos;
          setCasosStats({
            total: casos.length,
            conCriterio: casos.filter((c: { criterio?: { tiene?: boolean }, criterios?: Array<{ tiene?: boolean }> }) => 
              c.criterio?.tiene || (c.criterios && c.criterios.length > 0)
            ).length,
          });
          // Guardar todos los casos para mostrar en home
          setCasosDestacados(casos);
        }
      } catch (error) {
        console.error('Error fetching casos:', error);
      } finally {
        setLoadingCasos(false);
      }
    }
    fetchCasos();
  }, []);
  
  // Función para calcular días vencidos (usando UTC)
  const calcularDiasVencidos = (fechaPrometida: string): number => {
    if (!fechaPrometida) return 0;
    try {
      const fecha = new Date(fechaPrometida);
      const hoy = new Date();
      // Comparar solo fechas sin hora
      const fechaUTC = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
      const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
      const diffTime = hoyUTC - fechaUTC;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  // Formatear fecha para mostrar mes (usando UTC para evitar problemas de timezone)
  const formatearMes = (fechaStr: string): string => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return meses[fecha.getUTCMonth()];
    } catch {
      return '';
    }
  };

  // Obtener año UTC
  const getYearUTC = (fechaStr: string): number => {
    if (!fechaStr) return new Date().getFullYear();
    try {
      return new Date(fechaStr).getUTCFullYear();
    } catch {
      return new Date().getFullYear();
    }
  };

  // Formatear fecha prometida (usando UTC)
  const formatearFechaPrometida = (fechaStr: string): string => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${meses[fecha.getUTCMonth()]} ${fecha.getUTCFullYear()}`;
    } catch {
      return '';
    }
  };

  // Obtener label del status
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'prometido': 'PROMETIDO',
      'en_desarrollo': 'EN DESARROLLO',
      'operando': 'OPERANDO',
      'incumplido': 'INCUMPLIDO',
      'abandonado': 'ABANDONADO'
    };
    return labels[status] || status.toUpperCase();
  };

  // Filtrar anuncios
  const anunciosFiltrados = useMemo(() => {
    if (filtroStatus === 'todos') return anuncios;
    return anuncios.filter(item => item.status === filtroStatus);
  }, [filtroStatus, anuncios]);

  // Calcular estadísticas
  const stats = useMemo(() => ({
    total: anuncios.length,
    operando: anuncios.filter(a => a.status === 'operando').length,
    enDesarrollo: anuncios.filter(a => a.status === 'en_desarrollo').length,
    incumplido: anuncios.filter(a => a.status === 'incumplido').length,
    prometido: anuncios.filter(a => a.status === 'prometido').length,
  }), [anuncios]);

  const getStatusColor = (status: string) => {
    const colors = {
      incumplido: 'bg-red-900/20 text-red-400 border-red-800/30',
      en_desarrollo: 'bg-blue-50 text-blue-400 border-blue-800/30',
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSectionGlass stats={stats} legStats={legStats} casosStats={casosStats} loading={loadingAnuncios} loadingLeg={loadingLegStats} loadingCasos={loadingCasos} />

      {/* Sección: Metodología — DAG Flow (light) */}
      <section id="metodologia" className="scroll-mt-24 bg-gray-50 border-y border-gray-200/50">
        <MetodologiaDAG anuncios={stats.total} iniciativas={legStats.total} casos={casosStats.total} />
      </section>

      {/* Sección: Legislación en IA — Enriched + Status (l04) */}
      <section className="bg-gray-50 border-t border-gray-200/50 py-12 sm:py-16 px-4">
        <LegislacionEnriched legStats={legStats} loading={loadingLegStats} iniciativas={iniciativasDestacadas} />
      </section>

      {/* Sección: Casos de IA */}
      <section className="bg-gray-50 border-t border-gray-200/50 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200/50 rounded-full mb-4">
                <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-xs font-sans-tech text-purple-600 font-medium">Precedentes Judiciales</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
                Casos de <span className="italic text-purple-500">IA</span>
              </h2>
              <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-xl">
                Juicios y resoluciones donde la IA es protagonista del litigio o herramienta del proceso judicial.
              </p>
            </div>
            
            {/* Stats badge */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-purple-100 rounded-xl">
                <div className="font-serif-display text-2xl text-purple-700">{casosStats.total}</div>
                <div className="text-[10px] font-sans-tech text-purple-600 uppercase tracking-wider">Casos</div>
              </div>
              <div className="text-center px-4 py-2 bg-purple-50 rounded-xl">
                <div className="font-serif-display text-2xl text-purple-600">{casosStats.conCriterio}</div>
                <div className="text-[10px] font-sans-tech text-purple-500 uppercase tracking-wider">Con Criterio</div>
              </div>
            </div>
          </div>

          {/* Casos reales */}
          {loadingCasos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {casosDestacados.map((caso) => {
                const tieneCriterio = caso.criterio?.tiene || (caso.criterios && caso.criterios.length > 0);
                return (
                  <Link
                    key={caso.id}
                    href={`/casos-ia/${caso.id}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-[10px] font-sans-tech font-medium rounded-full ${
                        tieneCriterio ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tieneCriterio ? '📜 Con Criterio' : '📋 En proceso'}
                      </span>
                    </div>
                    <h3 className="font-sans-tech font-medium text-gray-900 text-sm mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                      {caso.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans-tech line-clamp-2">
                      {caso.resumen}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-purple-500 font-sans-tech font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver caso completo
                      <ArrowRight size={12} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/casos-ia"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Ver todos los casos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Barra de estadísticas de anuncios */}
      <section className="bg-white border-b border-gray-200/50 py-3 sm:py-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Vista móvil: grid compacto */}
          <div className="grid grid-cols-5 gap-2 text-center sm:hidden">
            <div className="bg-gray-100 rounded-lg py-2 px-1 border border-gray-300/10">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-[10px] text-gray-900/40">Total</div>
            </div>
            <div className="bg-emerald-50 rounded-lg py-2 px-1 border border-emerald-200">
              <div className="text-lg font-bold text-emerald-500">{stats.operando}</div>
              <div className="text-[10px] text-gray-900/40">Operando</div>
            </div>
            <div className="bg-blue-50 rounded-lg py-2 px-1 border border-blue-200">
              <div className="text-lg font-bold text-blue-500">{stats.enDesarrollo}</div>
              <div className="text-[10px] text-gray-900/40">Desarrollo</div>
            </div>
            <div className="bg-red-50 rounded-lg py-2 px-1 border border-red-200">
              <div className="text-lg font-bold text-red-500">{stats.incumplido}</div>
              <div className="text-[10px] text-gray-900/40">Incumplido</div>
            </div>
            <div className="bg-gray-100 rounded-lg py-2 px-1 border border-gray-300/10">
              <div className="text-lg font-bold text-gray-900/60">{stats.prometido}</div>
              <div className="text-[10px] text-gray-900/40">Prometido</div>
            </div>
          </div>

          {/* Vista desktop: horizontal */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-4 text-sm font-sans-tech">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <span className="font-medium text-gray-900/50">Total:</span>{' '}
                <span className="text-gray-900 font-semibold">{stats.total}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-emerald-500">Operando:</span>{' '}
                <span className="font-bold text-emerald-500">{stats.operando}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-blue-500">En desarrollo:</span>{' '}
                <span className="text-blue-500">{stats.enDesarrollo}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-red-500">Incumplido:</span>{' '}
                <span className="text-red-500">{stats.incumplido}</span>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div>
                <span className="font-medium text-gray-900/50">Prometido:</span>{' '}
                <span className="text-gray-900/60">{stats.prometido}</span>
              </div>
            </div>
            <div className="text-xs text-gray-900/30 flex items-center gap-1.5 font-mono">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actualización mensual
            </div>
          </div>
          
          {/* Fecha de actualización móvil */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-[10px] text-gray-900/30 font-mono">Actualización mensual</span>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section id="tracker" className="py-8 sm:py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 flex items-center gap-3">
              Anuncios de <span className="italic text-blue-500">IA</span> en {new Date().getFullYear()}
            </h2>
            
            {/* Filtro por status */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium font-sans-tech text-gray-900/50 hidden sm:inline">Filtrar:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-900 font-sans-tech backdrop-blur-sm"
              >
                <option value="todos" className="bg-gray-50">Todos ({stats.total})</option>
                <option value="incumplido" className="bg-gray-50">🔴 Incumplido ({stats.incumplido})</option>
                <option value="en_desarrollo" className="bg-gray-50">🟡 En desarrollo ({stats.enDesarrollo})</option>
                <option value="prometido" className="bg-gray-50">⚪ Prometido ({stats.prometido})</option>
                <option value="operando" className="bg-gray-50">🟢 Operando ({stats.operando})</option>
              </select>
            </div>
          </div>

          {/* Brief + scorecard de rendición de cuentas */}
          {!loadingAnuncios && !errorAnuncios && stats.total > 0 && (
            <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 sm:p-6">
              <p className="font-serif-display text-lg sm:text-xl text-gray-800 leading-snug mb-4">
                El Estado mexicano hizo <strong className="text-gray-900">{stats.total} promesas</strong> públicas de IA:{' '}
                <span className="text-emerald-600 font-medium">{stats.operando} ya operan</span>,{' '}
                <span className="text-blue-600 font-medium">{stats.enDesarrollo} en desarrollo</span>,{' '}
                <span className="text-gray-500 font-medium">{stats.prometido} prometidas</span>
                {stats.incumplido > 0 && <> y <span className="text-red-600 font-semibold">{stats.incumplido} incumplidas</span></>}.
              </p>
              {/* Barra de distribución */}
              <div className="flex h-2.5 rounded-full overflow-hidden border border-gray-200 bg-white">
                <div className="bg-emerald-500 h-full" style={{ width: `${(stats.operando / stats.total) * 100}%` }} title={`Operando · ${stats.operando}`} />
                <div className="bg-blue-500 h-full" style={{ width: `${(stats.enDesarrollo / stats.total) * 100}%` }} title={`En desarrollo · ${stats.enDesarrollo}`} />
                <div className="bg-slate-400 h-full" style={{ width: `${(stats.prometido / stats.total) * 100}%` }} title={`Prometido · ${stats.prometido}`} />
                <div className="bg-red-500 h-full" style={{ width: `${(stats.incumplido / stats.total) * 100}%` }} title={`Incumplido · ${stats.incumplido}`} />
              </div>
              {/* Leyenda + métrica */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 font-mono text-[11px] text-gray-600">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500" />Operando <b className="text-gray-900">{stats.operando}</b></span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-500" />En desarrollo <b className="text-gray-900">{stats.enDesarrollo}</b></span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-slate-400" />Prometido <b className="text-gray-900">{stats.prometido}</b></span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-500" />Incumplido <b className="text-gray-900">{stats.incumplido}</b></span>
                <span className="ml-auto text-gray-500">
                  <b className="text-emerald-600 text-sm">{Math.round((stats.operando / stats.total) * 100)}%</b> en operación
                </span>
              </div>
            </div>
          )}

          {/* Grid de Cards Premium con Imagen */}
          {loadingAnuncios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorAnuncios ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">⚠️ {errorAnuncios}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-blue-500 hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : anunciosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {filtroStatus === 'todos' ? 'No hay promesas registradas aún' : `No hay promesas con estado "${filtroStatus}"`}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {anunciosFiltrados.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/anuncio/${item.id}`)}
                className="group relative bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-500"
              >
                {/* Imagen del evento — imagen real o fallback de marca (nunca gris) */}
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${
                  item.status === 'incumplido' ? 'from-red-600 to-rose-900' :
                  item.status === 'en_desarrollo' ? 'from-blue-600 to-indigo-900' :
                  item.status === 'operando' ? 'from-emerald-600 to-teal-900' :
                  'from-slate-500 to-slate-800'
                }`}>
                  {/* Watermark de la dependencia (se ve en el fallback) */}
                  <img
                    src={getLogo(item.responsable)}
                    alt=""
                    aria-hidden="true"
                    className="absolute right-3 bottom-3 w-20 h-20 object-contain opacity-20"
                  />
                  {/* Imagen real encima; si falla, se oculta y queda el fallback de marca */}
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.titulo}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : null}

                  {/* Overlay para contraste del texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

                  {/* Badge de estado */}
                  <div className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-full text-[10px] font-sans-tech font-bold uppercase tracking-wider backdrop-blur-sm ${
                    item.status === 'incumplido' ? 'bg-red-500 text-white' :
                    item.status === 'en_desarrollo' ? 'bg-blue-500 text-white' :
                    item.status === 'operando' ? 'bg-emerald-500 text-white' :
                    'bg-white/90 text-gray-800'
                  }`}>
                    {item.status === 'incumplido' && '⚠️ '}{getStatusLabel(item.status)}
                  </div>

                  {/* Fecha */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1.5 bg-black/45 backdrop-blur-sm rounded-full">
                    <span className="font-mono text-[10px] text-white uppercase tracking-wider">
                      {formatearMes(item.fechaAnuncio)} {getYearUTC(item.fechaAnuncio)}
                    </span>
                  </div>

                  {/* Título */}
                  <div className="absolute bottom-3.5 left-4 right-4">
                    <h3 className="font-sans-tech font-bold text-white text-lg leading-tight drop-shadow-lg line-clamp-2">
                      {item.titulo}
                    </h3>
                  </div>
                </div>
                
                {/* Contenido debajo de la imagen */}
                <div className="p-5">
                  {/* Responsable */}
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={getLogo(item.responsable)} 
                      alt="" 
                      className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-white p-1" 
                    />
                    <div>
                      <div className="font-sans-tech text-sm font-medium text-gray-900">
                        {item.responsable}
                      </div>
                      <div className="font-sans-tech text-xs text-gray-400">
                        {item.dependencia || 'Responsable'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalle */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 font-sans-tech mb-4">
                    {item.descripcion}
                  </p>
                  
                  {/* Footer del card */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {item.fechaPrometida && item.status === 'incumplido' ? (
                      <div className="flex items-center gap-2 text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-mono font-bold">
                          {calcularDiasVencidos(item.fechaPrometida)} días de retraso
                        </span>
                      </div>
                    ) : item.fechaPrometida ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-mono">
                          Meta: {formatearFechaPrometida(item.fechaPrometida)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-300 font-mono">
                        Sin fecha límite
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-blue-500 font-sans-tech font-medium group-hover:gap-2 transition-all">
                      Ver más
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}


        </div>
      </section>
    </div>
  );
}
