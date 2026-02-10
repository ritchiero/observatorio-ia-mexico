'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Quote, ExternalLink, Loader2 } from 'lucide-react';

interface RecapData {
      id: string;
      mes: number;
      anio: number;
      mesLabel: string;
      titulo: string;
      subtitulo: string;
          contenido: string;
      datosClave: string[];
      veredicto: string;
      statsSnapshot: {
        totalAnuncios: number;
        operando: number;
        enDesarrollo: number;
        prometido: number;
        incumplido: number;
        abandonado: number;
        totalIniciativas?: number;
        iniciativasActivas?: number;
        totalCasos?: number;
      };
      fuentesConsultadas: { url: string; titulo: string }[];
      createdAt: string;
}

export default function RecapPage() {
      const [recaps, setRecaps] = useState<RecapData[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [selectedRecap, setSelectedRecap] = useState<RecapData | null>(null);

  useEffect(() => {
          async function fetchRecaps() {
                    try {
                                const response = await fetch('/api/recap');
                                if (!response.ok) throw new Error(`Error ${response.status}`);
                                const data = await response.json();
                                if (data.recaps) {
                                              setRecaps(data.recaps);
                                              if (data.recaps.length > 0) {
                                                              setSelectedRecap(data.recaps[0]);
                                              }
                                }
                    } catch (err) {
                                console.error('Error fetching recaps:', err);
                                setError('No se pudieron cargar los recaps mensuales.');
                    } finally {
                                setLoading(false);
                    }
          }
          fetchRecaps();
  }, []);

  const calcularCumplimiento = (stats: RecapData['statsSnapshot']) => {
          if (!stats || stats.totalAnuncios === 0) return 0;
          return Math.round((stats.operando / stats.totalAnuncios) * 100);
  };

  return (
          <div className="min-h-screen bg-white">
                <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                                  <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                                              <ArrowLeft size={18} />
                                              <span className="font-sans-tech text-sm">Volver al inicio</span>
                                  </Link>Link>
                                  <nav className="flex items-center gap-6">
                                              <Link href="/dashboard" className="text-sm font-sans-tech text-gray-600 hover:text-gray-900">Tracker</Link>Link>
                                              <Link href="/legislacion" className="text-sm font-sans-tech text-gray-600 hover:text-gray-900">Legislación</Link>Link>
                                              <Link href="/casos-ia" className="text-sm font-sans-tech text-gray-600 hover:text-gray-900">Casos</Link>Link>
                                  </nav>nav>
                        </div>div>
                </header>header>
          
                <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
                        <div className="mb-10">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/50 rounded-full mb-4">
                                              <Calendar size={14} className="text-amber-600" />
                                              <span className="text-xs font-sans-tech text-amber-700 font-medium">Recap Mensual</span>span>
                                  </div>div>
                                  <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-3">
                                              Resumen <span className="italic text-blue-500">Mensual</span>span>
                                  </h1>h1>
                                  <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-2xl">
                                              Cada mes, un resumen ejecutivo generado por IA sobre el estado de la inteligencia artificial en el gobierno mexicano. Datos duros, sin adornos.
                                  </p>p>
                        </div>div>
                
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                                    <p className="text-gray-500 font-sans-tech text-sm">Cargando recaps mensuales...</p>p>
                        </div>div>
                      ) : error ? (
                        <div className="text-center py-20">
                                    <p className="text-red-500 font-sans-tech mb-2">{error}</p>p>
                                    <button onClick={() => window.location.reload()} className="text-sm text-blue-500 hover:underline font-sans-tech">
                                                  Reintentar
                                    </button>button>
                        </div>div>
                      ) : recaps.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="font-sans-tech text-lg text-gray-700 mb-2">Aún no hay recaps disponibles</h3>h3>
                                    <p className="text-gray-500 font-sans-tech text-sm max-w-md mx-auto">
                                                  El primer recap mensual se generará automáticamente el día 1 del próximo mes. Los agentes de IA recopilan y analizan toda la actividad del observatorio.
                                    </p>p>
                        </div>div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-1">
                                                  <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ediciones</h3>h3>
                                                  <div className="space-y-2">
                                                      {recaps.map((recap) => (
                                              <button
                                                                      key={recap.id}
                                                                      onClick={() => setSelectedRecap(recap)}
                                                                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-sans-tech ${
                                                                                                selectedRecap?.id === recap.id
                                                                                                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                                                                                                  : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                                      }`}
                                                                    >
                                                                  <div className="font-medium text-sm capitalize">{recap.mesLabel} {recap.anio}</div>div>
                                                                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{recap.titulo}</div>div>
                                              </button>button>
                                            ))}
                                                  </div>div>
                                    </div>div>
                        
                            {selectedRecap && (
                                          <div className="lg:col-span-3">
                                                          <div className="mb-8">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-sans-tech font-medium capitalize">
                                                                                                    {selectedRecap.mesLabel} {selectedRecap.anio}
                                                                                                    </span>span>
                                                                                {selectedRecap.createdAt && (
                                                                    <span className="text-xs text-gray-400 font-mono">
                                                                        {new Date(selectedRecap.createdAt).toLocaleDateString('es-MX')}
                                                                    </span>span>
                                                                                                )}
                                                                            </div>div>
                                                                            <h2 className="font-serif-display text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                        {selectedRecap.titulo}
                                                                            </h2>h2>
                                                                            <p className="text-gray-600 font-sans-tech text-base">{selectedRecap.subtitulo}</p>p>
                                                          </div>div>
                                          
                                              {selectedRecap.statsSnapshot && (
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                                                                                                          <div className="font-serif-display text-2xl text-gray-900">{selectedRecap.statsSnapshot.totalAnuncios}</div>div>
                                                                                                          <div className="text-[10px] font-sans-tech text-gray-500 uppercase tracking-wider">Anuncios</div>div>
                                                                                        </div>div>
                                                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                                                                                          <div className="font-serif-display text-2xl text-emerald-600">{selectedRecap.statsSnapshot.operando}</div>div>
                                                                                                          <div className="text-[10px] font-sans-tech text-emerald-600 uppercase tracking-wider">Operando</div>div>
                                                                                    </div>div>
                                                                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                                                                                          <div className="font-serif-display text-2xl text-blue-600">{calcularCumplimiento(selectedRecap.statsSnapshot)}%</div>div>
                                                                                                          <div className="text-[10px] font-sans-tech text-blue-600 uppercase tracking-wider">Cumplimiento</div>div>
                                                                                        </div>div>
                                                                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                                                                                          <div className="font-serif-display text-2xl text-amber-600">{selectedRecap.statsSnapshot.totalIniciativas || '\u2014'}</div>div>
                                                                                                          <div className="text-[10px] font-sans-tech text-amber-600 uppercase tracking-wider">Iniciativas</div>div>
                                                                                        </div>div>
                                                                </div>div>
                                                          )}
                                          
                                              {selectedRecap.datosClave && selectedRecap.datosClave.length > 0 && (
                                                                <div className="bg-gray-900 rounded-2xl p-6 mb-8">
                                                                                    <div className="flex items-center gap-2 mb-4">
                                                                                                          <TrendingUp size={16} className="text-blue-400" />
                                                                                                          <h3 className="font-sans-tech text-sm font-semibold text-white">Datos Clave</h3>h3>
                                                                                        </div>div>
                                                                                    <div className="space-y-3">
                                                                                        {selectedRecap.datosClave.map((dato, i) => (
                                                                                            <div key={i} className="flex items-start gap-3">
                                                                                                                      <span className="text-blue-400 font-mono text-sm mt-0.5">{'\u2192'}</span>span>
                                                                                                                      <span className="text-gray-300 font-sans-tech text-sm">{dato}</span>span>
                                                                                                </div>div>
                                                                                          ))}
                                                                                        </div>div>
                                                                </div>div>
                                                          )}
                                          
                                                          <article className="prose prose-gray max-w-none mb-8">
                                                                            <div className="font-sans-tech text-gray-700 text-base leading-relaxed whitespace-pre-line">
                                                                                {selectedRecap.contenido}
                                                                            </div>div>
                                                          </article>article>
                                          
                                              {selectedRecap.veredicto && (
                                                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                                                                                    <div className="flex items-start gap-3">
                                                                                                          <Quote size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                                                                                                          <div>
                                                                                                                                  <h3 className="font-sans-tech text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Veredicto del Mes</h3>h3>
                                                                                                                                  <p className="font-serif-display text-lg sm:text-xl text-blue-900 italic">
                                                                                                                                                            &ldquo;{selectedRecap.veredicto}&rdquo;
                                                                                                                                      </p>p>
                                                                                                              </div>div>
                                                                                        </div>div>
                                                                </div>div>
                                                          )}
                                          
                                              {selectedRecap.fuentesConsultadas && selectedRecap.fuentesConsultadas.length > 0 && (
                                                                <div className="border-t border-gray-200 pt-6">
                                                                                    <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fuentes Consultadas</h3>h3>
                                                                                    <div className="space-y-2">
                                                                                        {selectedRecap.fuentesConsultadas.map((fuente, i) => (
                                                                                            <a
                                                                                                                          key={i}
                                                                                                                          href={fuente.url}
                                                                                                                          target="_blank"
                                                                                                                          rel="noopener noreferrer"
                                                                                                                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors font-sans-tech"
                                                                                                                        >
                                                                                                                      <ExternalLink size={12} className="flex-shrink-0" />
                                                                                                                      <span className="line-clamp-1">{fuente.titulo || fuente.url}</span>span>
                                                                                                </a>a>
                                                                                          ))}
                                                                                        </div>div>
                                                                </div>div>
                                                          )}
                                          </div>div>
                                    )}
                        </div>div>
                        )}
                </main>main>
          
                <footer className="border-t border-gray-200 py-8 mt-12">
                        <div className="max-w-6xl mx-auto px-4 text-center">
                                  <p className="text-xs text-gray-400 font-sans-tech">
                                              Generado automáticamente por agentes de IA · Powered by Claude AI
                                  </p>p>
                        </div>div>
                </footer>footer>
          </div>div>
        );
}</div>
