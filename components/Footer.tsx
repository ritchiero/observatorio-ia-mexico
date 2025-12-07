export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-2">
              <span className="text-lg">🇲🇽</span>
              <span>© 2025 Observatorio IA México · Iniciativa ciudadana</span>
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1.5">
              <span className="text-cyan-500">🤖</span>
              <span>Monitoreo automatizado con agentes de IA</span>
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              Una iniciativa de{' '}
              <a 
                href="https://lawgic.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
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
                className="text-gray-400 hover:text-white transition-colors"
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
