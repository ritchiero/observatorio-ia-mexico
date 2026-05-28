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
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" aria-label="Observatorio IA México" role="img">
                  <defs>
                    <linearGradient id="headerIris" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <path d="M6 50 Q50 22 94 50 Q50 78 6 50 Z" stroke="#cbd5e1" strokeWidth="3" />
                  <circle cx="50" cy="50" r="23" stroke="url(#headerIris)" strokeWidth="4" strokeDasharray="9 7" />
                  <circle cx="50" cy="50" r="14" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 6" />
                  <circle cx="73" cy="50" r="3.5" fill="url(#headerIris)" />
                  <circle cx="27" cy="50" r="3.5" fill="url(#headerIris)" />
                  <circle cx="50" cy="27" r="3.5" fill="url(#headerIris)" />
                  <circle cx="50" cy="50" r="8" fill="url(#headerIris)" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-sans-tech text-[10px] sm:text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
                <span className="font-serif-display text-base sm:text-lg leading-none text-gray-900 font-bold">IA México</span>
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
