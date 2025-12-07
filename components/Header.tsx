'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [iaPiDropdownOpen, setIaPiDropdownOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="hover:opacity-80 transition-opacity group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-gray-900 text-lg sm:text-xl">
                🇲🇽
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Observatorio</span>
                  <span className="text-gray-700">IA</span>
                  <span className="hidden xs:inline text-cyan-600">·</span>
                  <span className="hidden xs:inline text-gray-600">México</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">
                  <span className="text-cyan-600">🤖</span> Monitoreo con agentes de IA
                </p>
              </div>
            </div>
          </Link>
          
          {/* Menú desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Tracker
              </span>
            </Link>

            {/* Dropdown IA y PI */}
            <div 
              className="relative"
              onMouseEnter={() => setIaPiDropdownOpen(true)}
              onMouseLeave={() => setIaPiDropdownOpen(false)}
            >
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                IA y PI
                <svg className={`w-3 h-3 transition-transform ${iaPiDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {iaPiDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    href="/ia-pi/casos"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-cyan-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚖️</span>
                      <span>Casos Judiciales</span>
                    </div>
                  </Link>
                  <Link 
                    href="/ia-pi/criterios"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-cyan-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>📜</span>
                      <span>Criterios y Precedentes</span>
                    </div>
                  </Link>
                  <Link 
                    href="/ia-pi/propuestas"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-cyan-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span>Propuestas Legislativas</span>
                    </div>
                  </Link>
                  <Link 
                    href="/ia-pi/problematicas"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-cyan-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>🚨</span>
                      <span>Problemáticas</span>
                    </div>
                  </Link>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link 
                      href="/ia-pi"
                      className="block px-4 py-2 text-sm text-cyan-600 hover:bg-gray-100 font-medium transition-colors"
                    >
                      Ver todas →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/actividad" 
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Actividad
              </span>
            </Link>
          </nav>

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
            </svg>
          </button>
        </div>

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
              </svg>
              Tracker
            </Link>

            {/* IA y PI en móvil */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 mb-2">IA y Propiedad Intelectual</div>
              <div className="space-y-1 pl-2">
                <Link 
                  href="/ia-pi/casos"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-cyan-600 rounded-lg transition-colors"
                >
                  <span>⚖️</span>
                  <span>Casos Judiciales</span>
                </Link>
                <Link 
                  href="/ia-pi/criterios"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-cyan-600 rounded-lg transition-colors"
                >
                  <span>📜</span>
                  <span>Criterios</span>
                </Link>
                <Link 
                  href="/ia-pi/propuestas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-cyan-600 rounded-lg transition-colors"
                >
                  <span>🏛️</span>
                  <span>Propuestas</span>
                </Link>
                <Link 
                  href="/ia-pi/problematicas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-cyan-600 rounded-lg transition-colors"
                >
                  <span>🚨</span>
                  <span>Problemáticas</span>
                </Link>
              </div>
            </div>

            <Link 
              href="/actividad" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Actividad
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
