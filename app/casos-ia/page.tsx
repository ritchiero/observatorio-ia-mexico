'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Scale, Gavel, ChevronDown, ChevronUp, FileText, AlertCircle } from 'lucide-react';

interface CasoIA {
  id: string;
  nombre: string;
  tribunal: string;
  materia: string;
  temaIA: string;
  partes: {
    actor?: string;
    demandado?: string;
  };
  resumen: string;
  fechaInicio: string;
  fechaResolucion?: string;
  estado: 'en_proceso' | 'resuelto' | 'apelacion';
  resolucion?: string;
  relevancia: string;
  documentos?: Array<{
    titulo: string;
    url: string;
    tipo: string;
  }>;
}

export default function CasosIAPage() {
  const [casos, setCasos] = useState<CasoIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroTema, setFiltroTema] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    async function fetchCasos() {
      try {
        const response = await fetch('/api/casos-ia');
        const data = await response.json();
        if (data.casos) {
          setCasos(data.casos);
        }
      } catch (error) {
        console.error('Error fetching casos:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCasos();
  }, []);

  const casosFiltrados = casos.filter(caso => {
    if (filtroTema !== 'todos' && caso.temaIA !== filtroTema) return false;
    if (filtroEstado !== 'todos' && caso.estado !== filtroEstado) return false;
    return true;
  });

  const stats = {
    total: casos.length,
    resueltos: casos.filter(c => c.estado === 'resuelto').length,
    enProceso: casos.filter(c => c.estado === 'en_proceso').length,
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'en_proceso': { text: 'En proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'resuelto': { text: 'Resuelto', color: 'bg-green-100 text-green-700 border-green-200' },
      'apelacion': { text: 'En apelación', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    };
    return badges[estado] || { text: estado, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getTemaColor = (tema: string) => {
    const colors: Record<string, string> = {
      'jurimetria': 'bg-purple-100 text-purple-700',
      'deepfakes': 'bg-red-100 text-red-700',
      'algoritmos': 'bg-blue-100 text-blue-700',
      'propiedad_intelectual': 'bg-indigo-100 text-indigo-700',
      'discriminacion': 'bg-orange-100 text-orange-700',
      'privacidad': 'bg-cyan-100 text-cyan-700',
    };
    return colors[tema] || 'bg-gray-100 text-gray-700';
  };

  const getTemaLabel = (tema: string) => {
    const labels: Record<string, string> = {
      'jurimetria': '📊 Jurimetría',
      'deepfakes': '🎭 Deepfakes',
      'algoritmos': '🤖 Algoritmos',
      'propiedad_intelectual': '©️ Propiedad Intelectual',
      'discriminacion': '⚖️ Discriminación Algorítmica',
      'privacidad': '🔒 Privacidad',
    };
    return labels[tema] || tema;
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Estilo Observatorio */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[80px]"></div>
        </div>
        
        {/* NAV */}
        <nav className="relative z-10 flex justify-between items-center px-4 md:px-12 lg:px-24 py-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-purple-500/50 transition-colors">
              <Eye size={16} className="text-gray-900/80 group-hover:text-purple-500 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-sans-tech text-sm tracking-wide text-gray-900/70">
            <Link href="/#tracker" className="hover:text-purple-500 transition-colors">Tracker</Link>
            <Link href="/legislacion" className="hover:text-purple-500 transition-colors">Legislación</Link>
            <Link href="/casos-ia" className="text-purple-500 font-medium">Casos</Link>
            <Link href="/actividad" className="hover:text-purple-500 transition-colors">Actividad</Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-12 md:py-16">
          {/* Badge */}
          <div className="w-fit mb-6">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-100 border border-gray-300/10 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </div>
              <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-600/80">
                Casos Emblemáticos · {stats.total} Documentados
              </span>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight mb-6">
            <span className="text-gray-900/90">Casos de</span>{' '}
            <span className="italic text-purple-500">IA</span>
          </h1>
          
          <p className="font-sans-tech text-lg md:text-xl text-gray-900/60 max-w-2xl leading-relaxed border-l border-purple-500/30 pl-6">
            Juicios y resoluciones emblemáticas donde la inteligencia artificial es protagonista del litigio o herramienta del proceso judicial en México.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-gray-900 group-hover:text-purple-500 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.total}
              </div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Casos</div>
            </div>
            <div className="group bg-green-50 border border-green-200/30 rounded-xl p-4 hover:border-green-500/50 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-green-600 group-hover:text-green-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.resueltos}
              </div>
              <div className="font-sans-tech text-xs text-green-600/60 uppercase tracking-widest mt-1">Resueltos</div>
            </div>
            <div className="group bg-yellow-50 border border-yellow-200/30 rounded-xl p-4 hover:border-yellow-500/50 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-yellow-600 group-hover:text-yellow-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.enProceso}
              </div>
              <div className="font-sans-tech text-xs text-yellow-600/60 uppercase tracking-widest mt-1">En proceso</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <section className="bg-gray-50 border-b border-gray-200/50 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-[10px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Tema IA</label>
              <select
                value={filtroTema}
                onChange={(e) => setFiltroTema(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="jurimetria">📊 Jurimetría</option>
                <option value="deepfakes">🎭 Deepfakes</option>
                <option value="algoritmos">🤖 Algoritmos</option>
                <option value="propiedad_intelectual">©️ Propiedad Intelectual</option>
                <option value="discriminacion">⚖️ Discriminación</option>
                <option value="privacidad">🔒 Privacidad</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="resuelto">✅ Resueltos</option>
                <option value="en_proceso">⏳ En proceso</option>
                <option value="apelacion">📤 En apelación</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Casos */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-2xl md:text-3xl font-light text-gray-900">
              Casos <span className="italic text-purple-500">emblemáticos</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {casosFiltrados.length} de {casos.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : casosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <Gavel className="w-16 h-16 text-purple-200 mx-auto mb-4" />
              <h3 className="font-serif-display text-xl text-gray-900 mb-2">
                {casos.length === 0 ? 'Próximamente' : 'Sin resultados'}
              </h3>
              <p className="text-gray-500 font-sans-tech max-w-md mx-auto">
                {casos.length === 0 
                  ? 'Estamos documentando los primeros casos emblemáticos de IA en el sistema judicial mexicano.'
                  : 'No hay casos que coincidan con los filtros seleccionados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {casosFiltrados.map((caso) => {
                const estadoBadge = getEstadoBadge(caso.estado);
                const isExpanded = expandedId === caso.id;

                return (
                  <div 
                    key={caso.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    {/* Header del caso */}
                    <div 
                      className="p-5 md:p-6 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : caso.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans-tech border ${estadoBadge.color}`}>
                            {estadoBadge.text}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans-tech ${getTemaColor(caso.temaIA)}`}>
                            {getTemaLabel(caso.temaIA)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="text-xs font-mono">{caso.tribunal}</span>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      <h3 className="font-sans-tech font-semibold text-gray-900 text-lg md:text-xl mb-2">
                        {caso.nombre}
                      </h3>

                      <p className="text-gray-600 font-sans-tech text-sm leading-relaxed line-clamp-2">
                        {caso.resumen}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 font-sans-tech">
                        <span>📅 {formatFecha(caso.fechaInicio)}</span>
                        <span>·</span>
                        <span>📋 {caso.materia}</span>
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5 md:p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Partes */}
                          <div>
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Partes</h4>
                            <div className="space-y-1 text-sm">
                              {caso.partes.actor && (
                                <p><span className="text-gray-500">Actor:</span> <span className="text-gray-900">{caso.partes.actor}</span></p>
                              )}
                              {caso.partes.demandado && (
                                <p><span className="text-gray-500">Demandado:</span> <span className="text-gray-900">{caso.partes.demandado}</span></p>
                              )}
                            </div>
                          </div>

                          {/* Fechas */}
                          <div>
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Fechas</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Inicio:</span> <span className="text-gray-900 font-mono">{formatFecha(caso.fechaInicio)}</span></p>
                              {caso.fechaResolucion && (
                                <p><span className="text-gray-500">Resolución:</span> <span className="text-gray-900 font-mono">{formatFecha(caso.fechaResolucion)}</span></p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resumen completo */}
                        <div className="mt-6">
                          <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Resumen del caso</h4>
                          <p className="text-gray-600 font-sans-tech text-sm leading-relaxed">
                            {caso.resumen}
                          </p>
                        </div>

                        {/* Resolución */}
                        {caso.resolucion && (
                          <div className="mt-6">
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Resolución</h4>
                            <p className="text-gray-600 font-sans-tech text-sm leading-relaxed">
                              {caso.resolucion}
                            </p>
                          </div>
                        )}

                        {/* Relevancia */}
                        <div className="mt-6 p-4 bg-purple-50 border border-purple-200/50 rounded-lg">
                          <h4 className="text-xs font-sans-tech font-medium text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle size={14} />
                            Por qué es relevante
                          </h4>
                          <p className="text-purple-900 font-sans-tech text-sm leading-relaxed">
                            {caso.relevancia}
                          </p>
                        </div>

                        {/* Documentos */}
                        {caso.documentos && caso.documentos.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-gray-200/50">
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Documentos</h4>
                            <div className="flex flex-wrap gap-2">
                              {caso.documentos.map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FileText size={14} />
                                  {doc.titulo}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <div className="mt-6 pt-4 border-t border-gray-200/50 flex gap-3">
                          <Link
                            href={`/casos-ia/${caso.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-sans-tech text-sm uppercase tracking-wider hover:bg-purple-700 transition-colors rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver análisis completo
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-8 pt-6 border-t border-gray-200/50 text-xs font-sans-tech text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Casos documentados manualmente con verificación de fuentes</span>
            </div>
            <span className="font-mono text-purple-500/50">Powered by Citizen Agents</span>
          </div>
        </div>
      </section>
    </div>
  );
}
