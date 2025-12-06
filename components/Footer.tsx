export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © 2025 Observatorio IA México · Iniciativa ciudadana de transparencia
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Datos actualizados automáticamente mediante agentes de IA
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              Una iniciativa de{' '}
              <a 
                href="https://lawgic.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:underline"
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
                className="text-gray-700 hover:underline"
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
