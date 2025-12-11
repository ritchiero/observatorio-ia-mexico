'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Scale, Gavel, ChevronDown, ChevronUp, FileText, AlertCircle, Building, Calendar, ArrowRight } from 'lucide-react';
import { CasoIA, TEMAS_IA, MATERIAS, TIPOS_CRITERIO, TemaIA } from '@/types/casos-ia';

export default function CasosIAPage() {
  const [casos, setCasos] = useState<CasoIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroTema, setFiltroTema] = useState<string>('todos');
  const [filtroTipoCriterio, setFiltroTipoCriterio] = useState<string>('todos');
  const [filtroCriterio, setFiltroCriterio] = useState<string>('todos'); // todos, con_criterio, sin_criterio

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
    if (filtroCriterio === 'con_criterio' && !caso.criterio?.tiene) return false;
    if (filtroCriterio === 'sin_criterio' && caso.criterio?.tiene) return false;
    if (filtroTipoCriterio !== 'todos' && caso.criterio?.tipo !== filtroTipoCriterio) return false;
    return true;
  });

  // Ordenar: primero los que tienen criterio
  const casosOrdenados = [...casosFiltrados].sort((a, b) => {
    if (a.criterio?.tiene && !b.criterio?.tiene) return -1;
    if (!a.criterio?.tiene && b.criterio?.tiene) return 1;
    return 0;
  });

  const stats = {
    total: casos.length,
    conCriterio: casos.filter(c => c.criterio?.tiene).length,
    jurisprudencias: casos.filter(c => c.criterio?.tipo === 'jurisprudencia').length,
    tesisAisladas: casos.filter(c => c.criterio?.tipo === 'tesis_aislada').length,
    enProceso: casos.filter(c => c.estado === 'en_proceso').length,
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'resuelto' 
      ? { text: 'Resuelto', color: 'bg-green-100 text-green-700 border-green-200' }
      : { text: 'En proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  };

  const getTemaInfo = (tema: TemaIA) => {
    return TEMAS_IA[tema] || TEMAS_IA.otro;
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
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
                Criterios Judiciales · {stats.conCriterio} Precedentes
              </span>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight mb-6">
            <span className="text-gray-900/90">Criterios de</span>{' '}
            <span className="italic text-purple-500">IA</span>
          </h1>
          
          <p className="font-sans-tech text-lg md:text-xl text-gray-900/60 max-w-2xl leading-relaxed border-l border-purple-500/30 pl-6">
            Jurisprudencias y tesis aisladas que establecen precedentes sobre inteligencia artificial en el sistema judicial mexicano.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-gray-900 group-hover:text-purple-500 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.total}
              </div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Casos</div>
            </div>
            <div className="group bg-purple-50 border border-purple-200/30 rounded-xl p-4 hover:border-purple-500/50 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-purple-600 group-hover:text-purple-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.conCriterio}
              </div>
              <div className="font-sans-tech text-xs text-purple-600/60 uppercase tracking-widest mt-1">Con Criterio</div>
            </div>
            <div className="group bg-indigo-50 border border-indigo-200/30 rounded-xl p-4 hover:border-indigo-500/50 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-indigo-600 group-hover:text-indigo-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.jurisprudencias}
              </div>
              <div className="font-sans-tech text-xs text-indigo-600/60 uppercase tracking-widest mt-1">Jurisprudencias</div>
            </div>
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-gray-400/30 transition-all cursor-default">
              <div className={`font-serif-display text-3xl md:text-4xl text-gray-600 group-hover:text-gray-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                {loading ? '—' : stats.tesisAisladas}
              </div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Tesis Aisladas</div>
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
                {Object.entries(TEMAS_IA).map(([key, { label, emoji }]) => (
                  <option key={key} value={key}>{emoji} {label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Criterio</label>
              <select
                value={filtroCriterio}
                onChange={(e) => setFiltroCriterio(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="con_criterio">⚖️ Con criterio</option>
                <option value="sin_criterio">📋 Sin criterio aún</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Tipo</label>
              <select
                value={filtroTipoCriterio}
                onChange={(e) => setFiltroTipoCriterio(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="jurisprudencia">⚖️ Jurisprudencia</option>
                <option value="tesis_aislada">📜 Tesis Aislada</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Casos/Criterios */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-2xl md:text-3xl font-light text-gray-900">
              Criterios y <span className="italic text-purple-500">precedentes</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {casosOrdenados.length} de {casos.length}
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
          ) : casosOrdenados.length === 0 ? (
            <div className="text-center py-16">
              <Gavel className="w-16 h-16 text-purple-200 mx-auto mb-4" />
              <h3 className="font-serif-display text-xl text-gray-900 mb-2">
                {casos.length === 0 ? 'Próximamente' : 'Sin resultados'}
              </h3>
              <p className="text-gray-500 font-sans-tech max-w-md mx-auto">
                {casos.length === 0 
                  ? 'Estamos documentando los primeros criterios de IA en el sistema judicial mexicano.'
                  : 'No hay casos que coincidan con los filtros seleccionados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {casosOrdenados.map((caso) => {
                const estadoBadge = getEstadoBadge(caso.estado);
                const temaInfo = getTemaInfo(caso.temaIA);
                const isExpanded = expandedId === caso.id;
                const tieneCriterio = caso.criterio?.tiene;

                return (
                  <div 
                    key={caso.id}
                    className={`bg-white border rounded-xl overflow-hidden transition-all ${
                      tieneCriterio 
                        ? 'border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Si tiene criterio, mostrarlo primero */}
                    {tieneCriterio && caso.criterio && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold font-sans-tech bg-purple-100 text-purple-700 border border-purple-200">
                            {TIPOS_CRITERIO[caso.criterio.tipo].emoji} {TIPOS_CRITERIO[caso.criterio.tipo].label}
                          </span>
                          {caso.criterio.registro && (
                            <span className="text-xs font-mono text-purple-600">
                              Registro: {caso.criterio.registro}
                            </span>
                          )}
                          {caso.criterio.epoca && (
                            <span className="text-xs text-purple-500">
                              · {caso.criterio.epoca}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-sans-tech font-bold text-purple-900 text-lg md:text-xl mb-3 uppercase tracking-wide">
                          {caso.criterio.rubro}
                        </h3>
                        
                        <p className="text-purple-800/80 font-sans-tech text-sm leading-relaxed mb-4 line-clamp-3">
                          "{caso.criterio.texto}"
                        </p>

                        {/* Qué establece */}
                        {caso.criterio.reglasPrincipales && caso.criterio.reglasPrincipales.length > 0 && (
                          <div className="bg-white/60 rounded-lg p-4 mb-3">
                            <h4 className="text-xs font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-2">
                              💡 Qué establece
                            </h4>
                            <ul className="space-y-1">
                              {caso.criterio.reglasPrincipales.slice(0, 3).map((regla, idx) => (
                                <li key={idx} className="text-sm text-purple-900 font-sans-tech flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  {regla}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-xs text-purple-600 font-sans-tech">
                          <Building size={12} className="inline mr-1" />
                          {caso.criterio.instanciaEmisora}
                        </div>
                      </div>
                    )}

                    {/* Info del caso */}
                    <div 
                      className="p-5 md:p-6 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : caso.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans-tech border ${estadoBadge.color}`}>
                            {estadoBadge.text}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans-tech bg-${temaInfo.color}-100 text-${temaInfo.color}-700`}>
                            {temaInfo.emoji} {temaInfo.label}
                          </span>
                          {!tieneCriterio && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans-tech bg-gray-100 text-gray-500">
                              Sin criterio aún
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span className="text-xs font-mono">{caso.tribunalActual}</span>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      <h3 className="font-sans-tech font-semibold text-gray-900 text-lg mb-2">
                        {caso.nombre}
                      </h3>

                      <p className="text-gray-600 font-sans-tech text-sm leading-relaxed line-clamp-2 mb-3">
                        {caso.resumen}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-sans-tech">
                        <span className="flex items-center gap-1">
                          <FileText size={12} />
                          {caso.expedienteActual}
                        </span>
                        <span>·</span>
                        <span>{MATERIAS[caso.materia] || caso.materia}</span>
                        {caso.trayectoria && caso.trayectoria.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{caso.trayectoria.length} instancia{caso.trayectoria.length > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5 md:p-6">
                        {/* Elemento IA */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <h4 className="text-xs font-sans-tech font-semibold text-blue-700 uppercase tracking-wider mb-2">
                            🤖 Elemento de IA en el caso
                          </h4>
                          <p className="text-blue-900 font-sans-tech text-sm leading-relaxed">
                            {caso.elementoIA}
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          {/* Partes */}
                          <div>
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Partes</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Actor:</span> <span className="text-gray-900">{caso.partes.actor}</span></p>
                              <p><span className="text-gray-500">Demandado:</span> <span className="text-gray-900">{caso.partes.demandado}</span></p>
                              {caso.partes.terceros && (
                                <p><span className="text-gray-500">Terceros:</span> <span className="text-gray-900">{caso.partes.terceros}</span></p>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div>
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Información</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Expediente:</span> <span className="text-gray-900 font-mono">{caso.expedienteActual}</span></p>
                              <p><span className="text-gray-500">Tribunal actual:</span> <span className="text-gray-900">{caso.tribunalActual}</span></p>
                              <p><span className="text-gray-500">Materia:</span> <span className="text-gray-900">{MATERIAS[caso.materia]}</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Hechos */}
                        {caso.hechos && (
                          <div className="mb-6">
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Hechos</h4>
                            <p className="text-gray-600 font-sans-tech text-sm leading-relaxed">
                              {caso.hechos}
                            </p>
                          </div>
                        )}

                        {/* Trayectoria procesal */}
                        {caso.trayectoria && caso.trayectoria.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">
                              Trayectoria procesal
                            </h4>
                            <div className="space-y-3">
                              {caso.trayectoria.map((inst, idx) => (
                                <div 
                                  key={idx} 
                                  className={`relative pl-6 pb-3 ${idx < caso.trayectoria.length - 1 ? 'border-l-2 border-gray-200' : ''}`}
                                >
                                  <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full ${
                                    inst.estado === 'resuelto' ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-sans-tech font-medium text-gray-900 text-sm">{inst.tribunal}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        inst.estado === 'resuelto' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {inst.estado === 'resuelto' ? inst.sentido : 'En proceso'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono mb-1">
                                      {inst.tipo} · {inst.expediente}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {formatFecha(inst.fechaIngreso)} 
                                      {inst.fechaResolucion && ` → ${formatFecha(inst.fechaResolucion)}`}
                                    </div>
                                    {inst.resumen && (
                                      <p className="text-xs text-gray-600 mt-2">{inst.resumen}</p>
                                    )}
                                    {inst.generoCriterio && (
                                      <div className="mt-2 text-xs text-purple-600 font-medium">
                                        📜 Esta instancia generó criterio
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Relevancia (si tiene criterio) */}
                        {tieneCriterio && caso.criterio?.relevancia && (
                          <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg">
                            <h4 className="text-xs font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-2">
                              ⚡ Por qué es importante
                            </h4>
                            <p className="text-purple-900 font-sans-tech text-sm leading-relaxed">
                              {caso.criterio.relevancia}
                            </p>
                          </div>
                        )}

                        {/* Documentos */}
                        {caso.documentos && caso.documentos.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Documentos</h4>
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
                        <div className="pt-4 border-t border-gray-200/50">
                          <Link
                            href={`/casos-ia/${caso.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-sans-tech text-sm uppercase tracking-wider hover:bg-purple-700 transition-colors rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver caso completo
                            <ArrowRight size={16} />
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
              <span>Criterios documentados con verificación de fuentes oficiales</span>
            </div>
            <span className="font-mono text-purple-500/50">Powered by Citizen Agents</span>
          </div>
        </div>
      </section>
    </div>
  );
}
