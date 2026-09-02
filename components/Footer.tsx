import type { Locale } from '@/lib/i18n/dictionary';

// Pie de página global, localizado. Antes era sólo en español y se servía
// también bajo /en (auditoría externa, 1-sep-2026). Lleva el enlace al aviso
// de privacidad: el sitio recaba nombre, correo y teléfono y debe decir qué
// hace con ellos desde cualquier página.
const T = {
  es: {
    iniciativa: 'Iniciativa ciudadana',
    monitoreo: 'Monitoreo automatizado con agentes de IA',
    historial: 'Historial',
    privacidad: 'Aviso de privacidad',
    metodologia: 'Metodología',
    de: 'Una iniciativa de',
    dirigida: 'Dirigida por',
    rutaPrivacidad: '/privacidad',
    rutaHistorial: '/historial',
    rutaMetodologia: '/metodologia',
  },
  en: {
    iniciativa: 'Citizen initiative',
    monitoreo: 'Automated monitoring with AI agents',
    historial: 'History',
    privacidad: 'Privacy notice',
    metodologia: 'Methodology',
    de: 'An initiative by',
    dirigida: 'Led by',
    rutaPrivacidad: '/en/privacidad',
    rutaHistorial: '/en/historial',
    rutaMetodologia: '/en/metodologia',
  },
} as const;

export default function Footer({ locale = 'es' }: { locale?: Locale }) {
  const t = T[locale] ?? T.es;
  const link = 'text-cyan-600 hover:text-cyan-700 font-medium transition-colors';
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start gap-2">
              <svg viewBox="0 0 100 100" className="w-5 h-5 inline-block shrink-0" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="footerIris" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <path d="M6 50 Q50 24 94 50 Q50 76 6 50 Z" stroke="#94a3b8" strokeWidth="4" />
                <circle cx="50" cy="50" r="21" stroke="url(#footerIris)" strokeWidth="6" strokeDasharray="11 8" />
                <circle cx="50" cy="50" r="9" fill="url(#footerIris)" />
              </svg>
              <span>© {new Date().getFullYear()} Observatorio IA México · {t.iniciativa}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
              <span className="text-cyan-600">🤖</span>
              <span>{t.monitoreo}</span>
              <span className="text-gray-300 mx-1">·</span>
              <a href={t.rutaHistorial} className={link}>{t.historial}</a>
              <span className="text-gray-300 mx-1">·</span>
              <a href={t.rutaMetodologia} className={link}>{t.metodologia}</a>
              <span className="text-gray-300 mx-1">·</span>
              <a href={t.rutaPrivacidad} className={link}>{t.privacidad}</a>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              {t.de}{' '}
              <a href="https://lawgic-pi.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                Lawgic
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t.dirigida}{' '}
              <a href="https://www.linkedin.com/in/aldoricardorodriguez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                Aldo Ricardo Rodríguez Cortés
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
