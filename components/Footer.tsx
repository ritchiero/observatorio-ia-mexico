export default function Footer() {
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
              <span>© {new Date().getFullYear()} Observatorio IA México · Iniciativa ciudadana</span>
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1.5">
              <span className="text-cyan-600">🤖</span>
              <span>Monitoreo automatizado con agentes de IA</span>
              <span className="text-gray-300 mx-1">·</span>
              <a
                href="/historial"
                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                Historial
              </a>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              Una iniciativa de{' '}
              <a 
                href="https://lawgic-pi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                Lawgic
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dirigida por{' '}
              <a 
                href="https://www.linkedin.com/in/aldoricardorodriguez" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Aldo Ricardo Rodríguez Cortés
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
