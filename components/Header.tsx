import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Observatorio IA México
              </h1>
              <p className="text-xs text-gray-500">
                Seguimiento de anuncios gubernamentales
              </p>
            </div>
          </Link>
          
          <nav className="flex gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Tracker
            </Link>
            <Link 
              href="/actividad" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Actividad
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
