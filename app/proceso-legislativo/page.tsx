import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Play, Tv, Radio, Clock, Users, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Proceso Legislativo — Ley General de IA | Observatorio IA México',
  description: 'Sigue en tiempo real el proceso legislativo de la Ley General de Inteligencia Artificial en el Senado de México. Sesiones programadas, videos y enlaces de transmisión.',
};

export default function ProcesoLegislativoPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-8 font-sans-tech">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full mb-4">
            <Calendar size={14} className="text-emerald-600" />
            <span className="text-xs font-sans-tech text-emerald-700 font-medium">Proceso Legislativo en Vivo</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3">
            Ley General de <span className="italic text-emerald-600">Inteligencia Artificial</span>
          </h1>
          <p className="text-gray-600 font-sans-tech text-sm sm:text-base max-w-3xl">
            Actividades programadas y recursos para seguir el proceso legislativo de la Ley General de IA en el Senado de la República. Semana del 23 al 28 de febrero de 2026.
          </p>
        </div>

        {/* Executive Summary Alert */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans-tech text-sm font-semibold text-emerald-800 mb-2">Resumen Ejecutivo</h3>
              <p className="text-emerald-900 font-sans-tech text-sm leading-relaxed">
                La sesión clave es la del <strong>martes 25 de febrero</strong>, donde se espera la votación de la Ley General de IA. Al día siguiente, el <strong>jueves 26 de febrero a las 10:00 a.m.</strong>, el Secretario Técnico de la Comisión de IA del Senado impartirá un webinar gratuito para la industria explicando los alcances de la nueva ley. Ambos eventos serán transmitidos o disponibles en línea.
              </p>
            </div>
          </div>
        </div>

        {/* Sesiones Plenarias */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Play size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Sesiones Plenarias del Senado</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Con transmisión en vivo</p>
            </div>
          </div>
          <p className="text-gray-600 font-sans-tech text-sm mb-4">
            Ambas sesiones serán transmitidas en vivo por el Canal del Congreso México en YouTube y por televisión abierta (canales 45.1, 45.2 y 45.3). La Ley General de IA está prevista para votarse en la sesión del 25 de febrero.
          </p>

          <div className="space-y-3">
            {/* Sesion 25 feb */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    CLAVE
                  </span>
                  <span className="text-sm font-sans-tech font-medium text-gray-900">Martes 25 de febrero</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno del Senado — <strong>Votación prevista de la Ley General de IA</strong></p>
                </div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-red-700 transition-colors whitespace-nowrap">
                  <Play size={12} />
                  Canal del Congreso
                </a>
              </div>
            </div>

            {/* Sesion 26 feb */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <Clock size={12} />
                    SESIÓN
                  </span>
                  <span className="text-sm font-sans-tech font-medium text-gray-900">Miércoles 26 de febrero</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-sans-tech">Sesión Ordinaria del Pleno del Senado</p>
                </div>
                <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-sans-tech font-medium hover:bg-gray-800 transition-colors whitespace-nowrap">
                  <Play size={12} />
                  Canal del Congreso
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 font-sans-tech mt-3 italic">
            Nota: El Canal del Congreso no publica los links de transmisión con anticipación; los videos quedan disponibles en su canal de YouTube inmediatamente después de concluir cada sesión.
          </p>
        </section>

        {/* Webinar */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Webinar Especial — Post-Legislativo</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Exclusivo para socios CANACINTRA</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-sans-tech font-semibold">
                    <Calendar size={12} />
                    Jueves 26 de febrero, 10:00 a.m.
                  </span>
                </div>
                <h3 className="font-sans-tech text-sm font-semibold text-blue-900 mb-2">
                  Del Senado a la Industria: Panorama Legislativo IA 2026
                </h3>
                <p className="text-sm text-blue-800 font-sans-tech leading-relaxed mb-3">
                  Implementa Inteligencia Artificial sin poner en riesgo a tu empresa. Impartido por <strong>Mtro. Alonso Bernardo Tamez Vélez</strong>, Secretario Técnico de la Comisión de IA del Senado. Organizado por el Comité de IA de CANACINTRA Coahuila Sureste.
                </p>
                <a href="https://gqr.sh/7mDQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-sans-tech font-medium hover:bg-blue-700 transition-colors">
                  <ExternalLink size={14} />
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Videos Disponibles */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tv size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Videos Disponibles</h2>
              <p className="text-xs text-gray-500 font-sans-tech">Canal Oficial del Senado de México y Canal del Congreso</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { fecha: '18 feb. 2026', titulo: 'Sesión Ordinaria del Senado 18/02/2026 (sesión más reciente)', url: 'https://www.youtube.com/watch?v=4CblZopqEg4' },
              { fecha: '17 feb. 2026', titulo: 'Sesión Ordinaria del Senado 17/02/2026', url: 'https://www.youtube.com/watch?v=yGHlnWu5Zjw' },
              { fecha: '11 feb. 2025', titulo: 'Inauguración del Ciclo de Talleres de IA del Senado (presidido por Sen. Rolando Zapata Bello)', url: 'https://www.youtube.com/watch?v=K-lNHJkDYQk' },
              { fecha: '16 oct. 2025', titulo: 'Reunión Ordinaria de la Comisión de Análisis, Seguimiento y Evaluación sobre la IA en México', url: 'https://www.youtube.com/watch?v=H9qL7df8_as' },
            ].map((video, i) => (
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-700 transition-colors">
                  <Play size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans-tech text-gray-900 group-hover:text-purple-900 transition-colors">{video.titulo}</p>
                  <p className="text-xs text-gray-500 font-sans-tech mt-0.5">{video.fecha}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" />
              </a>
            ))}
          </div>

          {/* Intervenciones de Senadores */}
          <h3 className="font-sans-tech text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Intervenciones de Senadores</h3>
          <div className="space-y-2">
            {[
              { titulo: '“Esta iniciativa busca establecer las facultades para legislar en materia de IA”: Sen. Ruiz (GPMorena)', url: 'https://www.youtube.com/watch?v=F-oPzipptD4' },
              { titulo: '“El fraude con IA aumentó 2000%”: Sen. Martín (GPPAN)', url: 'https://www.youtube.com/watch?v=1yTOMvW3W3c' },
              { titulo: '“Regular la IA implica impulsar beneficios y combatir prejuicios”: Sen. Sanmiguel (GPPAN)', url: 'https://www.youtube.com/watch?v=ryBajW8C0Lw' },
              { titulo: '“Regular IA para que coexista con humanidad”: Sen. Martha Márquez (PT)', url: 'https://www.youtube.com/watch?v=ysF__tvVrOw' },
              { titulo: 'Conversatorio “IA: retos, riesgos y oportunidades” — Sen. Alejandra Lagunes', url: 'https://www.youtube.com/watch?v=vUvvOHRXnYc' },
              { titulo: 'Foro internacional “El futuro de la IA: plataformas y redes sociales”', url: 'https://www.youtube.com/watch?v=4p5iBGfgocg' },
              { titulo: '“Impacto de la IA en la ética, los derechos humanos y la política pública”', url: 'https://www.youtube.com/watch?v=a5eAK6A4am0' },
            ].map((video, i) => (
              <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50/30 transition-colors group">
                <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                  <Play size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans-tech text-gray-700 group-hover:text-purple-900 transition-colors">{video.titulo}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0 group-hover:text-purple-500" />
              </a>
            ))}
          </div>
        </section>

        {/* Dónde seguir en vivo */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Radio size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">Dónde Seguir las Sesiones en Vivo</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="https://www.youtube.com/@CanalCongresoMx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso México</p>
                <p className="text-xs text-gray-500 font-sans-tech">YouTube</p>
              </div>
            </a>

            <a href="https://www.youtube.com/c/senadomexico" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Senado de México (oficial)</p>
                <p className="text-xs text-gray-500 font-sans-tech">YouTube</p>
              </div>
            </a>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tv size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p>
                <p className="text-xs text-gray-500 font-sans-tech">TV Abierta — Canales 45.1, 45.2 y 45.3</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tv size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-sans-tech font-medium text-gray-900">Canal del Congreso</p>
                <p className="text-xs text-gray-500 font-sans-tech">Dish / Sky — Canal 145</p>
              </div>
            </div>
          </div>
        </section>

        {/* Link al anuncio original */}
        <div className="border-t border-gray-200 pt-8">
          <Link href="/anuncio/5ZS5BxrNE7nTBBNVdaEG" className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-sans-tech font-medium transition-colors">
            <ExternalLink size={14} />
            Ver ficha completa: Ley General de Inteligencia Artificial en el Senado
          </Link>
        </div>
      </main>
    </div>
  );
}
