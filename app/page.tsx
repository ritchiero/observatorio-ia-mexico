'use client';

import Link from 'next/link';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Observatorio IA México
          </h1>
          <p className="text-base text-gray-600 mb-2 max-w-2xl mx-auto">
            Seguimiento ciudadano automatizado de anuncios gubernamentales sobre inteligencia artificial en México
          </p>
          <p className="text-sm text-gray-500 mb-6 max-w-2xl mx-auto">
            Porque prometer no empobrece, pero cumplir sí se mide
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Ver Dashboard
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Current Situation - NEW */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  La realidad en 2025
                </h2>
                <p className="text-sm text-gray-700 mb-3">
                  El gobierno mexicano ha sido pródigo en promesas sobre inteligencia artificial: laboratorios nacionales, modelos de lenguaje soberanos, supercomputadoras con nombres aztecas, escuelas públicas de IA. Lo que escasea son los productos terminados.
                </p>
                <p className="text-sm text-gray-700">
                  A diciembre de 2025, el inventario de lo que realmente funciona cabe en una servilleta.
                </p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">10+</p>
                <p className="text-xs text-gray-600 mt-1">Anuncios en 2025</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">113</p>
                <p className="text-xs text-gray-600 mt-1">Apps de IA reportadas</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-900">223</p>
                <p className="text-xs text-gray-600 mt-1">No calificaban como IA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Anuncios destacados de 2025
          </h2>
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Laboratorio Nacional de IA
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Prometido para octubre por la presidenta Sheinbaum. Octubre llegó y el laboratorio no.
                  </p>
                  <p className="text-xs text-gray-500">Abril 2025 · Sheinbaum</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded-full whitespace-nowrap">
                  Prometido
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    KAL - Modelo de lenguaje mexicano
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Presentado sin documentación técnica, sin código público, sin benchmarks.
                  </p>
                  <p className="text-xs text-gray-500">Noviembre 2025 · Saptiva + Secretaría de Economía</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded-full whitespace-nowrap">
                  En desarrollo
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Coatlicue - Supercomputadora
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Será "la más poderosa de América Latina" cuando se construya en 2026, si todo sale bien.
                  </p>
                  <p className="text-xs text-gray-500">Noviembre 2025 · Sheinbaum</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded-full whitespace-nowrap">
                  Prometido
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Centro Público de Formación en IA
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Convocatoria cerrada. Las clases inician en enero de 2026.
                  </p>
                  <p className="text-xs text-gray-500">Noviembre 2025 · ATDT + Infotec + TecNM</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 rounded-full whitespace-nowrap">
                  En desarrollo
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/dashboard"
              className="text-sm text-gray-900 font-medium hover:underline"
            >
              Ver todos los anuncios →
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              ¿Por qué existe este proyecto?
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Dar seguimiento manual a los anuncios gubernamentales, verificar su cumplimiento y monitorear su progreso requiere tiempo y esfuerzo constante. La opacidad es generalizada y muchas dependencias ni siquiera responden a solicitudes de información.
            </p>
            <p className="text-sm text-gray-700">
              Este observatorio automatiza ese proceso utilizando agentes de IA que buscan, detectan y monitorean anuncios gubernamentales de forma autónoma, proporcionando transparencia ciudadana sin intervención humana constante.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <CpuChipIcon className="w-6 h-6 text-gray-900" />
                <h3 className="text-base font-semibold text-gray-900">
                  Agente de Detección
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Se ejecuta automáticamente el día 1 de cada mes para buscar nuevos anuncios gubernamentales sobre IA.
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Busca en fuentes oficiales y medios</li>
                <li>• Extrae información estructurada</li>
                <li>• Registra automáticamente nuevos anuncios</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-6 h-6 text-gray-900" />
                <h3 className="text-base font-semibold text-gray-900">
                  Agente de Monitoreo
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Se ejecuta automáticamente el día 15 de cada mes para actualizar el status de anuncios existentes.
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Verifica progreso de proyectos</li>
                <li>• Actualiza status automáticamente</li>
                <li>• Registra cambios y evidencias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Características principales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <ChartBarIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Dashboard en Tiempo Real
              </h3>
              <p className="text-xs text-gray-600">
                Visualiza estadísticas y el estado actual de todos los anuncios gubernamentales
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <CpuChipIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Automatización Total
              </h3>
              <p className="text-xs text-gray-600">
                Los agentes trabajan 24/7 sin necesidad de intervención humana constante
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-3">
                <ShieldCheckIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Transparencia Ciudadana
              </h3>
              <p className="text-xs text-gray-600">
                Información pública y accesible para cualquier ciudadano interesado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Tecnología
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Next.js 14</p>
                  <p className="text-xs text-gray-600">Framework</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Claude API</p>
                  <p className="text-xs text-gray-600">Agentes IA</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Firebase</p>
                  <p className="text-xs text-gray-600">Base de datos</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Vercel</p>
                  <p className="text-xs text-gray-600">Hosting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sobre el proyecto
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Este es un proyecto ciudadano de código abierto desarrollado para promover la transparencia gubernamental en el ámbito de la inteligencia artificial en México.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              El sistema se mantiene automáticamente mediante agentes de IA que realizan búsquedas y actualizaciones periódicas, minimizando la necesidad de intervención humana y garantizando información actualizada.
            </p>
            <p className="text-sm text-gray-700 mb-6">
              Una iniciativa de{' '}
              <a 
                href="https://lawgic.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline"
              >
                Lawgic
              </a>
              {' '}dirigida por{' '}
              <a 
                href="https://www.linkedin.com/in/aldoricardorodriguez" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline"
              >
                Aldo Ricardo Rodríguez Cortés
              </a>
              .
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Explorar Dashboard
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
