'use client';

import Link from 'next/link';

export default function ProblematicasPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <Link href="/ia-pi" className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a IA y PI
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🚨</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Problemáticas Identificadas
            </h1>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            Casos documentados de problemas causados por IA en México
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Agente activo</span>
            </div>
            <div className="text-gray-400">|</div>
            <span className="text-gray-600">Actualización mensual</span>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Agente en Configuración
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              El agente de problemáticas rastreará automáticamente casos documentados de problemas 
              causados por IA en México, organizados por categoría.
            </p>
            
            <div className="bg-white border border-cyan-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <h3 className="font-bold text-gray-900 mb-3">Categorías de problemáticas:</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">🎤 Voz</div>
                  <p className="text-sm text-gray-600">Clonación no autorizada de voz de artistas, locutores y personalidades</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">👤 Deepfakes</div>
                  <p className="text-sm text-gray-600">Suplantación de identidad en videos, campañas políticas y desinformación</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">🎨 Originalidad</div>
                  <p className="text-sm text-gray-600">Plagio asistido por IA, réplica de estilos artísticos sin autorización</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">🔒 Privacidad</div>
                  <p className="text-sm text-gray-600">Uso no autorizado de datos personales en entrenamiento de modelos</p>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 mb-1">📰 Desinformación</div>
                  <p className="text-sm text-gray-600">Contenido generado por IA usado para desinformar o manipular</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Primera ejecución programada para enero 2026
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
