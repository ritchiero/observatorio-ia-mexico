'use client';

import Link from 'next/link';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Observatorio IA México
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Seguimiento ciudadano automatizado de anuncios gubernamentales sobre inteligencia artificial en México
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Ver Dashboard
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              ¿Por qué existe este proyecto?
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              El gobierno mexicano ha realizado múltiples anuncios sobre proyectos de inteligencia artificial. Sin embargo, dar seguimiento manual a estos anuncios, verificar su cumplimiento y monitorear su progreso requiere tiempo y esfuerzo constante.
            </p>
            <p className="text-lg text-gray-700">
              Este observatorio automatiza ese proceso utilizando agentes de IA que buscan, detectan y monitorean anuncios gubernamentales de forma autónoma, proporcionando transparencia ciudadana sin intervención humana constante.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CpuChipIcon className="w-8 h-8 text-gray-900" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Agente de Detección
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Se ejecuta automáticamente el día 1 de cada mes para buscar nuevos anuncios gubernamentales sobre IA.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Busca en fuentes oficiales y medios</li>
                <li>• Extrae información estructurada</li>
                <li>• Registra automáticamente nuevos anuncios</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-8 h-8 text-gray-900" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Agente de Monitoreo
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Se ejecuta automáticamente el día 15 de cada mes para actualizar el status de anuncios existentes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Verifica progreso de proyectos</li>
                <li>• Actualiza status automáticamente</li>
                <li>• Registra cambios y evidencias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Características principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ChartBarIcon className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboard en Tiempo Real
              </h3>
              <p className="text-gray-600">
                Visualiza estadísticas y el estado actual de todos los anuncios gubernamentales
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CpuChipIcon className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatización Total
              </h3>
              <p className="text-gray-600">
                Los agentes trabajan 24/7 sin necesidad de intervención humana constante
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ShieldCheckIcon className="w-12 h-12 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparencia Ciudadana
              </h3>
              <p className="text-gray-600">
                Información pública y accesible para cualquier ciudadano interesado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Tecnología
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="font-semibold text-gray-900">Next.js 14</p>
                  <p className="text-sm text-gray-600">Framework</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Claude API</p>
                  <p className="text-sm text-gray-600">Agentes IA</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Firebase</p>
                  <p className="text-sm text-gray-600">Base de datos</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vercel</p>
                  <p className="text-sm text-gray-600">Hosting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Sobre el proyecto
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Este es un proyecto ciudadano de código abierto desarrollado para promover la transparencia gubernamental en el ámbito de la inteligencia artificial en México.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              El sistema se mantiene automáticamente mediante agentes de IA que realizan búsquedas y actualizaciones periódicas, minimizando la necesidad de intervención humana y garantizando información actualizada.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Explorar Dashboard
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
