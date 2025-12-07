'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="hover:opacity-80 transition-opacity group">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-lg sm:text-xl">
                🇲🇽
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Observatorio</span>
                  <span className="text-gray-200">IA</span>
                  <span className="hidden xs:inline text-cyan-400">·</span>
                  <span className="hidden xs:inline text-gray-300">México</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">
                  <span className="text-cyan-500/70">🤖</span> Monitoreo con agentes de IA
                </p>
              </div>
            </div>
          </Link>
          
          {/* Menú desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link 
              href="/" 
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Tracker
              </span>
            </Link>
            <Link 
              href="/actividad" 
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
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
            className="sm:hidden p-2 -mr-2 text-gray-400 hover:text-white focus:outline-none"
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
          <nav className="sm:hidden border-t border-gray-800 py-3 space-y-1">
            <Link 
              href="/" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Tracker
            </Link>
            <Link 
              href="/actividad" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
