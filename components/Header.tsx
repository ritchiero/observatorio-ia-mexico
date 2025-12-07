'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Observatorio IA México
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">
                Seguimiento de anuncios gubernamentales
              </p>
            </div>
          </Link>
          
          {/* Menú desktop */}
          <nav className="hidden sm:flex gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Tracker
            </Link>
            <Link 
              href="/actividad" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Actividad
            </Link>
          </nav>

          {/* Botón hamburguesa móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
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
          <nav className="sm:hidden border-t border-gray-100 py-3 space-y-1">
            <Link 
              href="/" 
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Tracker
            </Link>
            <Link 
              href="/actividad" 
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Actividad
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
