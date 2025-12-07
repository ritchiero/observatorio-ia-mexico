'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function IAPIPage() {
  const [stats, setStats] = useState({
    casos: 0,
    criterios: 0,
    propuestas: 0,
    problematicas: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from Firestore
    setStats({
      casos: 0,
      criterios: 0,
      propuestas: 0,
      problematicas: 0,
    });
  }, []);

  const categorias = [
    {
      id: 'casos',
      titulo: 'Casos Judiciales',
      descripcion: 'Demandas, sentencias y amparos relacionados con IA y propiedad intelectual en México',
      icono: '⚖️',
      count: stats.casos,
      href: '/ia-pi/casos',
      ejemplos: [
        'Artistas de voz vs plataformas de clonación',
        'Fotógrafos vs generadores de imágenes IA',
        'Escritores vs modelos de lenguaje',
      ],
    },
    {
      id: 'criterios',
      titulo: 'Criterios y Precedentes',
      descripcion: 'Jurisprudencia, tesis y criterios de tribunales sobre IA y derechos de autor',
      icono: '📜',
      count: stats.criterios,
      href: '/ia-pi/criterios',
      ejemplos: [
        'Criterio sobre originalidad en obras generadas por IA',
        'Tesis sobre responsabilidad en deepfakes',
        'Precedente sobre protección de datos de entrenamiento',
      ],
    },
    {
      id: 'propuestas',
      titulo: 'Propuestas Legislativas',
      descripcion: 'Iniciativas, reformas y dictámenes sobre regulación de IA en el Congreso',
      icono: '🏛️',
      count: stats.propuestas,
      href: '/ia-pi/propuestas',
      ejemplos: [
        'Iniciativa de regulación de IA generativa',
        'Reforma a Ley Federal de Derechos de Autor',
        'Ley de Protección contra Deepfakes',
      ],
    },
    {
      id: 'problematicas',
      titulo: 'Problemáticas Identificadas',
      descripcion: 'Casos documentados de problemas causados por IA en México',
      icono: '🚨',
      count: stats.problematicas,
      href: '/ia-pi/problematicas',
      ejemplos: [
        'Clonación no autorizada de voz',
        'Deepfakes en campañas políticas',
        'Plagio asistido por IA',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm shadow-sm mb-4">
              <span className="text-2xl">⚖️</span>
              <span className="text-gray-600">IA y Propiedad Intelectual</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Monitoreo de IA y Derechos en México
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seguimiento automatizado de casos judiciales, criterios jurídicos, propuestas legislativas 
              y problemáticas relacionadas con inteligencia artificial y propiedad intelectual.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.casos}</div>
              <div className="text-sm text-gray-600">Casos</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.criterios}</div>
              <div className="text-sm text-gray-600">Criterios</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.propuestas}</div>
              <div className="text-sm text-gray-600">Propuestas</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.problematicas}</div>
              <div className="text-sm text-gray-600">Problemáticas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                href={categoria.href}
                className="group border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-cyan-300 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{categoria.icono}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors mb-2">
                      {categoria.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {categoria.descripcion}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-2xl text-gray-900">{categoria.count}</span>
                      <span className="text-gray-500">registros</span>
                    </div>
                  </div>
                </div>

                {/* Ejemplos */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="text-xs text-gray-500 mb-2">Ejemplos:</div>
                  <ul className="space-y-1">
                    {categoria.ejemplos.map((ejemplo, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-cyan-500 mt-0.5">•</span>
                        <span>{ejemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-2 text-cyan-600 text-sm font-medium group-hover:gap-3 transition-all">
                  <span>Explorar</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-50 border-y border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            🤖 Monitoreo Automatizado
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">Agentes Especializados</h3>
              <p className="text-sm text-gray-600">
                Cuatro agentes de IA especializados rastrean automáticamente nuevos casos, 
                criterios, propuestas y problemáticas cada mes.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Fuentes Verificables</h3>
              <p className="text-sm text-gray-600">
                Cada registro incluye enlaces a fuentes primarias: sentencias, gacetas oficiales, 
                noticias y documentos verificables.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-bold text-gray-900 mb-2">Timeline Completo</h3>
              <p className="text-sm text-gray-600">
                Seguimiento cronológico de cada caso, propuesta o problemática con 
                actualizaciones automáticas mensuales.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="font-bold text-gray-900 mb-2">Actualización Mensual</h3>
              <p className="text-sm text-gray-600">
                Los agentes se ejecutan automáticamente cada mes para mantener 
                la información actualizada sin intervención manual.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
