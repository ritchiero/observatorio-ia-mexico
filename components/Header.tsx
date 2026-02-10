'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

  return (
        <header className="border-b border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-14 sm:h-16">
                                <Link href="/" className="hover:opacity-80 transition-opacity group">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-gray-900 text-lg sm:text-xl">
                                                                          🇲🇽
                                                          </div>div>
                                                          <div>
                                                                          <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
                                                                                            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Observatorio</span>span>
                                                                                            <span className="text-gray-700">IA</span>span>
                                                                                            <span className="hidden xs:inline text-cyan-600">·</span>span>
                                                                                            <span className="hidden xs:inline text-gray-600">México</span>span>
                                                                          </h1>h1>
                                                                          <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">
                                                                                            <span className="text-cyan-600">🤖</span>span> Monitoreo con agentes de IA
                                                                          </p>p>
                                                          </div>div>
                                            </div>div>
                                </Link>Link>
                      
                        {/* Menú desktop */}
                                <nav className="hidden sm:flex items-center gap-1">
                                            <Link
                                                            href="/"
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                          >
                                                          <span className="flex items-center gap-1.5">
                                                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                          </svg>svg>
                                                                          Tracker
                                                          </span>span>
                                            </Link>Link>
                                            <Link
                                                            href="/legislacion"
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                          >
                                                          <span className="flex items-center gap-1.5">
                                                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                                          </svg>svg>
                                                                          Legislación
                                                          </span>span>
                                            </Link>Link>
                                            <Link
                                                            href="/casos-ia"
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                          >
                                                          <span className="flex items-center gap-1.5">
                                                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                          </svg>svg>
                                                                          Casos
                                                          </span>span>
                                            </Link>Link>
                                            <Link
                                                            href="/recap"
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                          >
                                                          <span className="flex items-center gap-1.5">
                                                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                                          </svg>svg>
                                                                          Recap
                                                          </span>span>
                                            </Link>Link>
                                            <Link
                                                            href="/actividad"
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                          >
                                                          <span className="flex items-center gap-1.5">
                                                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                          </svg>svg>
                                                                          Actividad
                                                          </span>span>
                                            </Link>Link>
                                </nav>nav>
                      
                        {/* Botón hamburguesa móvil */}
                                <button
                                              onClick={() => setMenuOpen(!menuOpen)}
                                              className="sm:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                                              aria-label="Abrir menú"
                                            >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              {menuOpen ? (
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            ) : (
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                            )}
                                            </svg>svg>
                                </button>button>
                      </div>div>
              
                {/* Menú móvil desplegable */}
                {menuOpen && (
                    <nav className="sm:hidden border-t border-gray-200 py-3 space-y-1">
                                <Link
                                                href="/"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                                              >
                                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                              </svg>svg>
                                              Tracker
                                </Link>Link>
                                <Link
                                                href="/legislacion"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                                              >
                                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                              </svg>svg>
                                              Legislación
                                </Link>Link>
                                <Link
                                                href="/casos-ia"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                                              >
                                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                              </svg>svg>
                                              Casos IA
                                </Link>Link>
                                <Link
                                                href="/recap"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                                              >
                                              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                              </svg>svg>
                                              Recap Mensual
                                </Link>Link>
                                <Link
                                                href="/actividad"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                                              >
                                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                              </svg>svg>
                                              Actividad
                                </Link>Link>
                    </nav>nav>
                      )}
              </div>div>
        </header>header>
      );
}</header>
