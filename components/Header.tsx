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
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Observatorio</span>
                  <span className="text-gray-700">IA</span>
                </h1>
              </div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Tracker</Link>
            <Link href="/legislacion" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Legislación</Link>
            <Link href="/casos-ia" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Casos</Link>
            <Link href="/recap" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Recap</Link>
            <Link href="/actividad" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Actividad</Link>
          </nav>

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

        {menuOpen && (
          <nav className="sm:hidden border-t border-gray-200 py-3 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">Tracker</Link>
            <Link href="/legislacion" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">Legislación</Link>
            <Link href="/casos-ia" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">Casos IA</Link>
            <Link href="/recap" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">Recap Mensual</Link>
            <Link href="/actividad" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">Actividad</Link>
          </nav>
        )}
      </div>
    </header>
  );
              }
