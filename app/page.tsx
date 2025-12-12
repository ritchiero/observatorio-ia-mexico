'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import Link from 'next/link';
import { Scale, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <HeroSection stats={stats} legStats={legStats} casosStats={casosStats} loading={loadingAnuncios} loadingLeg={loadingLegStats} loadingCasos={loadingCasos} />

      {/* Sección: Cómo funciona - Observatorio Automatizado */}
      <section id="metodologia" className="bg-gray-50 border-y border-gray-300/5 py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
              Auditoría <span className="italic text-blue-500">automatizada</span>
            </h2>
            <p className="text-gray-900/60 font-sans-tech text-sm sm:text-base max-w-2xl mx-auto">
              Este observatorio utiliza <span className="text-blue-400 font-medium">agentes de inteligencia artificial</span> que trabajan 24/7 para rastrear, verificar y actualizar el estado de cada promesa gubernamental.
            </p>
          </div>

          {/* Flujo de los agentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Agente 1: Detección */}
            <div className="bg-gray-100 border border-gray-300/10 rounded-xl p-5 sm:p-6 hover:border-blue-500/30 hover:bg-gray-50/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-gray-900 text-sm sm:text-base">Agente de Detección</h3>
                  <p className="text-xs text-gray-900/40">Busca nuevos anuncios</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-900/60 leading-relaxed">
                Escanea diariamente noticias, comunicados oficiales y redes sociales para detectar <span className="text-blue-400">nuevas promesas</span> del gobierno relacionadas con IA.
              </p>
            </div>

            {/* Agente 2: Monitoreo */}
            <div className="bg-gray-100 border border-gray-300/10 rounded-xl p-5 sm:p-6 hover:border-blue-500/30 hover:bg-gray-50/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
                  <span className="text-lg">📡</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-gray-900 text-sm sm:text-base">Agente de Monitoreo</h3>
                  <p className="text-xs text-gray-900/40">Verifica el progreso</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-900/60 leading-relaxed">
                Rastrea cada anuncio existente buscando <span className="text-blue-400">evidencia de avance</span>: ¿hay presupuesto? ¿hay licitaciones? ¿hay código público? ¿hay producto funcionando?
              </p>
            </div>

            {/* Resultado: Timeline */}
            <div className="bg-gray-100 border border-gray-300/10 rounded-xl p-5 sm:p-6 hover:border-blue-500/30 hover:bg-gray-50/[0.07] transition-all backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="font-sans-tech font-semibold text-gray-900 text-sm sm:text-base">Timeline Verificable</h3>
                  <p className="text-xs text-gray-900/40">Con fuentes citadas</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-900/60 leading-relaxed">
                Cada cambio de estado incluye <span className="text-blue-400">fuentes verificables</span>: enlaces a notas de prensa, documentos oficiales y citas textuales.
              </p>
            </div>
          </div>

          {/* Nota técnica */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300/10 text-xs text-gray-900/60 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              Ejecutándose automáticamente cada 24 horas
            </div>
            <span className="text-gray-900/20 hidden sm:inline">•</span>
            <span className="text-xs text-gray-900/40 font-mono">
              Construido con Claude AI + web search
            </span>
          </div>
        </div>
      </section>

      {/* Sección: Legislación en IA */}
      <section className="bg-gray-50 border-t border-gray-200/50 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/50 rounded-full mb-4">
                <Scale size={14} className="text-blue-500" />
                <span className="text-xs font-sans-tech text-blue-600 font-medium">Monitoreo Legislativo</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
                Legislación en <span className="italic text-blue-500">IA</span>
              </h2>
              <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-xl">
                Seguimiento de todas las iniciativas de ley relacionadas con inteligencia artificial 
                en el Congreso Federal y congresos estatales.
              </p>
            </div>
            
            {/* Stats rápidas */}
            <div className="flex gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center min-w-[80px]">
                <div className={`font-serif-display text-2xl sm:text-3xl text-gray-900 ${loadingLegStats ? 'animate-pulse' : ''}`}>
                  {loadingLegStats ? '—' : legStats.total}
                </div>
                <div className="text-[10px] font-sans-tech text-gray-500 uppercase tracking-wider">Iniciativas</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center min-w-[80px]">
                <div className={`font-serif-display text-2xl sm:text-3xl text-blue-600 ${loadingLegStats ? 'animate-pulse' : ''}`}>
                  {loadingLegStats ? '—' : legStats.activas}
                </div>
                <div className="text-[10px] font-sans-tech text-blue-600 uppercase tracking-wider">Activas</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center min-w-[80px]">
                <div className={`font-serif-display text-2xl sm:text-3xl text-emerald-600 ${loadingLegStats ? 'animate-pulse' : ''}`}>
                  {loadingLegStats ? '—' : legStats.aprobadas}
                </div>
                <div className="text-[10px] font-sans-tech text-emerald-600 uppercase tracking-wider">Aprobadas</div>
              </div>
            </div>
          </div>

          {/* Iniciativas destacadas */}
          {iniciativasDestacadas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {iniciativasDestacadas.map((ini, index) => (
                <Link 
                  key={ini.id || index}
                  href={`/legislacion/${ini.id}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-sans-tech font-medium rounded-full ${
                      (ini.status || '').toLowerCase().includes('aprob') 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ini.status || 'En comisiones'}
                    </span>
                    {ini.estadoVerificacion === 'verificado' && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck size={14} />
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans-tech font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {ini.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 font-sans-tech line-clamp-1">
                    {ini.proponente}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {ini.fecha ? new Date(ini.fecha).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span className="text-xs text-blue-500 font-sans-tech group-hover:underline flex items-center gap-1">
                      Ver más <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/legislacion"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Scale size={16} />
              Ver todas las iniciativas
              <ArrowRight size={16} />
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-sans-tech">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{loadingLegStats ? 'Cargando...' : `${legStats.verificadas} iniciativas verificadas con IA`}</span>
            </div>
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
              Actualización automática
            </div>
          </div>
          
          {/* Fecha de actualización móvil */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-[10px] text-gray-900/30 font-mono">Datos en tiempo real</span>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section id="tracker" className="py-8 sm:py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 flex items-center gap-3">
              Anuncios de <span className="italic text-blue-500">IA</span> en 2025
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
                {/* Imagen del evento */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {item.imagen ? (
                    <img 
                      src={item.imagen} 
                      alt={item.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Badge de estado sobre la imagen */}
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-sans-tech font-bold uppercase tracking-wider backdrop-blur-sm ${
                    item.status === 'incumplido' ? 'bg-red-500/90 text-white' :
                    item.status === 'en_desarrollo' ? 'bg-blue-500/90 text-white' :
                    item.status === 'operando' ? 'bg-emerald-500/90 text-white' :
                    'bg-white/90 text-gray-700'
                  }`}>
                    {getStatusLabel(item.status)}
                  </div>
                  
                  {/* Fecha sobre la imagen */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                    <span className="font-mono text-[10px] text-white uppercase tracking-wider">
                      {formatearMes(item.fechaAnuncio)} {getYearUTC(item.fechaAnuncio)}
                    </span>
                  </div>
                  
                  {/* Título sobre la imagen */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-sans-tech font-bold text-white text-xl leading-tight drop-shadow-lg">
                      {item.titulo}
                    </h3>
                  </div>
                  
                  {/* Indicador de incumplimiento */}
                  {item.status === 'incumplido' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full animate-pulse">
                      <span className="text-[10px] text-white font-bold">⚠️ INCUMPLIDO</span>
                    </div>
                  )}
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
    </div>
  );
}
