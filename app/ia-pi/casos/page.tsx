'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CasoJudicial } from '@/types';

// Tipo serializado para casos que vienen de la API (Timestamps convertidos a strings)
type CasoJudicialSerializado = Omit<CasoJudicial, 'fecha' | 'createdAt' | 'updatedAt'> & {
  fecha: string;
  createdAt: string;
  updatedAt: string;
};

export default function CasosJudicialesPage() {
  const [casos, setCasos] = useState<CasoJudicialSerializado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCasos() {
      try {
        const response = await fetch('/api/ia-pi/casos');
        if (response.ok) {
          const data = await response.json();
          setCasos(data);
        }
      } catch (error) {
        console.error('Error al cargar casos:', error);
      } finally {
        setLoading(false);
      }
    }
    cargarCasos();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <Link href="/ia-pi" className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a IA y PI
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚖️</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Casos Judiciales
            </h1>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            Demandas, sentencias y amparos relacionados con IA y propiedad intelectual en México
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Agente activo</span>
            </div>
            <div className="text-gray-400">|</div>
            <span className="text-gray-600">Actualización mensual</span>
            <div className="text-gray-400">|</div>
            <span className="text-gray-600">{casos.length} casos encontrados</span>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Cargando casos...</p>
            </div>
          ) : casos.length === 0 ? (
            /* Estado: Sin casos */
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Agente en Configuración
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                El agente de casos judiciales está siendo configurado para rastrear automáticamente 
                demandas, sentencias y amparos relacionados con IA y propiedad intelectual en tribunales mexicanos.
              </p>
              
              <div className="bg-white border border-cyan-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3">¿Qué rastreará este agente?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>Casos de artistas vs plataformas de clonación de voz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>Demandas de fotógrafos contra generadores de imágenes IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>Litigios sobre derechos de autor en obras generadas por IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>Amparos relacionados con deepfakes y suplantación de identidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>Sentencias sobre protección de datos de entrenamiento</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                Primera ejecución programada para enero 2026
              </div>
            </div>
          ) : (
            /* Lista de casos */
            <div className="space-y-6">
              {casos.map((caso) => (
                <article key={caso.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold text-gray-900 flex-1">
                      {caso.titulo}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      caso.estado === 'en_proceso' ? 'bg-green-100 text-green-800' :
                      caso.estado === 'resuelto' ? 'bg-blue-100 text-blue-800' :
                      caso.estado === 'apelacion' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {caso.estado.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {caso.descripcion}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Tribunal:</span>
                      <span className="text-gray-600 ml-2">{caso.tribunal}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <span className="text-gray-600 ml-2">{new Date(caso.fecha).toLocaleDateString('es-MX')}</span>
                    </div>
                    {caso.expediente && (
                      <div>
                        <span className="font-medium text-gray-700">Expediente:</span>
                        <span className="text-gray-600 ml-2">{caso.expediente}</span>
                      </div>
                    )}
                    {caso.partes && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Partes:</span>
                        <span className="text-gray-600 ml-2">{caso.partes.demandante} vs {caso.partes.demandado}</span>
                      </div>
                    )}
                  </div>

                  {caso.fuentes && caso.fuentes.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <span className="font-medium text-gray-700 text-sm">Fuentes:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {caso.fuentes.map((fuente, idx) => (
                          <a
                            key={idx}
                            href={fuente.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 hover:underline"
                            title={fuente.titulo}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {fuente.titulo || `Fuente ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
