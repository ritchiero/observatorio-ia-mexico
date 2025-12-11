'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Eye, ArrowLeft, FileText, ExternalLink, Calendar, Building, Scale, AlertCircle, Gavel, ChevronRight, Users, BookOpen } from 'lucide-react';
import { CasoIA, TEMAS_IA, MATERIAS, TIPOS_CRITERIO, TemaIA } from '@/types/casos-ia';

export default function CasoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caso, setCaso] = useState<CasoIA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaso() {
      try {
        const response = await fetch(`/api/casos-ia/${id}`);
        if (!response.ok) {
          throw new Error('Caso no encontrado');
        }
        const data = await response.json();
        setCaso(data.caso);
      } catch (err) {
        console.error('Error fetching caso:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    fetchCaso();
  }, [id]);

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'resuelto' 
      ? { text: 'Resuelto', color: 'bg-green-100 text-green-700 border-green-200' }
      : { text: 'En proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  };

  const getTemaInfo = (tema: TemaIA) => {
    return TEMAS_IA[tema] || TEMAS_IA.otro;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-16 h-16 text-red-300" />
        <h2 className="text-xl font-sans-tech text-gray-900">{error || 'Caso no encontrado'}</h2>
        <Link 
          href="/casos-ia"
          className="text-purple-600 hover:text-purple-800 font-sans-tech flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver a casos
        </Link>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(caso.estado);
  const temaInfo = getTemaInfo(caso.temaIA);
  const tieneCriterio = caso.criterio?.tiene;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-indigo-50/50 rounded-full blur-[80px]"></div>
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-sans-tech text-gray-400 mb-6">
            <Link href="/casos-ia" className="hover:text-purple-500 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Casos IA
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-600 truncate max-w-[200px] md:max-w-none">{caso.nombre}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans-tech border ${estadoBadge.color}`}>
              {estadoBadge.text}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans-tech bg-${temaInfo.color}-100 text-${temaInfo.color}-700`}>
              {temaInfo.emoji} {temaInfo.label}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-sans-tech bg-gray-100 text-gray-600">
              {MATERIAS[caso.materia]}
            </span>
            {tieneCriterio && caso.criterio && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans-tech bg-purple-100 text-purple-700 border border-purple-200">
                {TIPOS_CRITERIO[caso.criterio.tipo].emoji} {TIPOS_CRITERIO[caso.criterio.tipo].label}
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-6 text-gray-900">
            {caso.nombre}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-sans-tech text-gray-500">
            <span className="flex items-center gap-2">
              <Building size={16} />
              {caso.tribunalActual}
            </span>
            <span className="flex items-center gap-2">
              <FileText size={16} />
              <span className="font-mono">{caso.expedienteActual}</span>
            </span>
            {caso.trayectoria && caso.trayectoria.length > 0 && caso.trayectoria[0].fechaIngreso && (
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                {formatFecha(caso.trayectoria[0].fechaIngreso)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ===== CRITERIO (Lo más importante) ===== */}
            {tieneCriterio && caso.criterio && (
              <section className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <h2 className="font-serif-display text-2xl font-light text-purple-900">
                    <Scale className="inline-block mr-2 text-purple-500" size={24} />
                    Criterio generado
                  </h2>
                  {caso.criterio.registro && (
                    <span className="text-xs font-mono px-2 py-1 bg-purple-100 text-purple-600 rounded-lg">
                      Registro: {caso.criterio.registro}
                    </span>
                  )}
                </div>

                {/* Tipo y época */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold font-sans-tech bg-purple-100 text-purple-700 border border-purple-200">
                    {TIPOS_CRITERIO[caso.criterio.tipo].emoji} {TIPOS_CRITERIO[caso.criterio.tipo].label}
                  </span>
                  {caso.criterio.epoca && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-sans-tech bg-white/50 text-purple-700">
                      {caso.criterio.epoca}
                    </span>
                  )}
                  {caso.criterio.materia && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-sans-tech bg-white/50 text-purple-700">
                      {caso.criterio.materia}
                    </span>
                  )}
                </div>

                {/* Rubro */}
                <h3 className="font-sans-tech font-bold text-purple-900 text-xl md:text-2xl mb-4 uppercase tracking-wide leading-snug">
                  {caso.criterio.rubro}
                </h3>

                {/* Texto */}
                <div className="bg-white/60 rounded-xl p-5 mb-6">
                  <p className="text-purple-900/90 font-serif-display text-lg leading-relaxed italic">
                    "{caso.criterio.texto}"
                  </p>
                </div>

                {/* Qué establece */}
                {caso.criterio.reglasPrincipales && caso.criterio.reglasPrincipales.length > 0 && (
                  <div className="bg-white rounded-xl p-5 mb-6 border border-purple-100">
                    <h4 className="text-sm font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen size={16} />
                      Qué establece
                    </h4>
                    <ul className="space-y-2">
                      {caso.criterio.reglasPrincipales.map((regla, idx) => (
                        <li key={idx} className="text-purple-900 font-sans-tech flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs text-purple-600 font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{regla}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alcance */}
                {caso.criterio.alcance && (
                  <div className="mb-6">
                    <h4 className="text-sm font-sans-tech font-medium text-purple-600 mb-2">Alcance</h4>
                    <p className="text-purple-800 font-sans-tech leading-relaxed">{caso.criterio.alcance}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Relevancia */}
                  {caso.criterio.relevancia && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <h4 className="text-xs font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-2">
                        ⚡ Relevancia
                      </h4>
                      <p className="text-purple-800 font-sans-tech text-sm leading-relaxed">
                        {caso.criterio.relevancia}
                      </p>
                    </div>
                  )}

                  {/* Casos aplicables */}
                  {caso.criterio.casosAplicables && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <h4 className="text-xs font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-2">
                        📋 Casos aplicables
                      </h4>
                      <p className="text-purple-800 font-sans-tech text-sm leading-relaxed">
                        {caso.criterio.casosAplicables}
                      </p>
                    </div>
                  )}
                </div>

                {/* Implicaciones */}
                {caso.criterio.implicaciones && (
                  <div className="mt-4 bg-purple-100/50 rounded-lg p-4 border border-purple-200/50">
                    <h4 className="text-xs font-sans-tech font-semibold text-purple-700 uppercase tracking-wider mb-2">
                      🔮 Implicaciones
                    </h4>
                    <p className="text-purple-800 font-sans-tech text-sm leading-relaxed">
                      {caso.criterio.implicaciones}
                    </p>
                  </div>
                )}

                {/* Instancia emisora */}
                <div className="mt-6 pt-4 border-t border-purple-200/50 text-sm text-purple-600 font-sans-tech flex items-center gap-2">
                  <Building size={14} />
                  {caso.criterio.instanciaEmisora}
                </div>
              </section>
            )}

            {/* ===== RESUMEN ===== */}
            <section>
              <h2 className="font-serif-display text-2xl font-light text-gray-900 mb-4">
                Resumen del caso
              </h2>
              <p className="text-gray-700 font-sans-tech text-lg leading-relaxed">
                {caso.resumen}
              </p>
            </section>

            {/* ===== ELEMENTO IA ===== */}
            <section className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6">
              <h2 className="font-sans-tech text-sm font-semibold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                🤖 Elemento de Inteligencia Artificial
              </h2>
              <p className="text-blue-900 font-sans-tech text-lg leading-relaxed">
                {caso.elementoIA}
              </p>
            </section>

            {/* ===== HECHOS ===== */}
            {caso.hechos && (
              <section>
                <h2 className="font-serif-display text-2xl font-light text-gray-900 mb-4">
                  Hechos
                </h2>
                <p className="text-gray-600 font-sans-tech leading-relaxed whitespace-pre-line">
                  {caso.hechos}
                </p>
              </section>
            )}

            {/* ===== TRAYECTORIA PROCESAL ===== */}
            {caso.trayectoria && caso.trayectoria.length > 0 && (
              <section>
                <h2 className="font-serif-display text-2xl font-light text-gray-900 mb-6">
                  Trayectoria procesal
                </h2>
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-400 to-blue-300"></div>
                  
                  <div className="space-y-6">
                    {caso.trayectoria.map((inst, idx) => (
                      <div key={idx} className="relative pl-12">
                        {/* Punto en la línea */}
                        <div className={`absolute left-[11px] top-4 w-6 h-6 rounded-full border-4 border-white shadow-md ${
                          inst.estado === 'resuelto' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {inst.generoCriterio && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>

                        <div className={`bg-white border rounded-xl p-5 ${
                          inst.generoCriterio ? 'border-purple-300 shadow-md shadow-purple-500/10' : 'border-gray-200'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                              <h3 className="font-sans-tech font-semibold text-gray-900 text-lg">{inst.tribunal}</h3>
                              <p className="text-xs text-gray-500">{inst.ubicacion}</p>
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                              inst.estado === 'resuelto' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {inst.estado === 'resuelto' ? inst.sentido : 'En proceso'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
                              <FileText size={12} />
                              {inst.expediente}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                              {inst.tipo}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatFecha(inst.fechaIngreso)}
                            </span>
                            {inst.fechaResolucion && (
                              <>
                                <span>→</span>
                                <span>{formatFecha(inst.fechaResolucion)}</span>
                              </>
                            )}
                          </div>

                          {inst.ministroPonente && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Ministro Ponente:</strong> {inst.ministroPonente}
                            </p>
                          )}

                          {inst.resumen && (
                            <p className="text-gray-600 font-sans-tech text-sm leading-relaxed mt-3">
                              {inst.resumen}
                            </p>
                          )}

                          {inst.votoParticular && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                              <p className="text-xs font-sans-tech font-semibold text-amber-700 uppercase tracking-wider mb-1">
                                Voto particular
                              </p>
                              <p className="text-amber-800 text-sm">{inst.votoParticular}</p>
                            </div>
                          )}

                          {inst.generoCriterio && (
                            <div className="mt-3 flex items-center gap-2 text-purple-600 font-medium text-sm bg-purple-50 rounded-lg px-3 py-2">
                              <Scale size={16} />
                              Esta instancia generó el criterio
                            </div>
                          )}

                          {/* Documentos de la instancia */}
                          {inst.documentos && inst.documentos.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {inst.documentos.map((doc, dIdx) => (
                                <a
                                  key={dIdx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                                >
                                  <FileText size={12} />
                                  {doc.titulo}
                                  <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ===== SIDEBAR (1/3) ===== */}
          <div className="space-y-6">
            {/* Partes */}
            <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-sans-tech text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={16} />
                Partes
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase">Actor</span>
                  <p className="font-sans-tech text-gray-900 font-medium">{caso.partes.actor}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase">Demandado</span>
                  <p className="font-sans-tech text-gray-900 font-medium">{caso.partes.demandado}</p>
                </div>
                {caso.partes.terceros && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase">Terceros interesados</span>
                    <p className="font-sans-tech text-gray-700 text-sm">{caso.partes.terceros}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info del caso */}
            <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-5">
              <h3 className="font-sans-tech text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Información
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <span className={`font-medium ${caso.estado === 'resuelto' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {caso.estado === 'resuelto' ? 'Resuelto' : 'En proceso'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Materia</span>
                  <span className="text-gray-900">{MATERIAS[caso.materia]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tema IA</span>
                  <span className="text-gray-900">{getTemaInfo(caso.temaIA).emoji} {getTemaInfo(caso.temaIA).label}</span>
                </div>
                {caso.subtema && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtema</span>
                    <span className="text-gray-900">{caso.subtema}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200/50">
                  <span className="text-gray-500">Expediente actual</span>
                  <p className="font-mono text-gray-900 mt-1">{caso.expedienteActual}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tribunal actual</span>
                  <p className="text-gray-900 mt-1">{caso.tribunalActual}</p>
                </div>
              </div>
            </div>

            {/* Documentos generales */}
            {caso.documentos && caso.documentos.length > 0 && (
              <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-5">
                <h3 className="font-sans-tech text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} />
                  Documentos
                </h3>
                <div className="space-y-2">
                  {caso.documentos.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400 group-hover:text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-900 group-hover:text-purple-700">{doc.titulo}</p>
                          <p className="text-xs text-gray-400 capitalize">{doc.tipo.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-purple-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Fuentes */}
            {caso.fuentes && caso.fuentes.length > 0 && (
              <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-5">
                <h3 className="font-sans-tech text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Fuentes
                </h3>
                <div className="space-y-3">
                  {caso.fuentes.map((fuente, idx) => (
                    <a
                      key={idx}
                      href={fuente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors group"
                    >
                      <p className="text-sm text-gray-900 group-hover:text-purple-700 line-clamp-2">{fuente.titulo}</p>
                      {fuente.medio && (
                        <p className="text-xs text-gray-400 mt-1">{fuente.medio}</p>
                      )}
                      {fuente.fecha && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatFecha(fuente.fecha)}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link 
              href="/casos-ia"
              className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors font-sans-tech"
            >
              <ArrowLeft size={16} />
              Volver a todos los casos
            </Link>
            <div className="text-xs font-sans-tech text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Información verificada con fuentes oficiales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
