'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const adminActions = [
    {
      title: 'Importar Iniciativas',
      description: 'Importar nuevas iniciativas legislativas desde JSON',
      icon: '📥',
      href: '/api/admin/import-iniciativas',
      method: 'POST',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Actualizar PDFs',
      description: 'Actualizar URLs de documentos PDF',
      icon: '📄',
      href: '/api/admin/update-pdf-urls',
      method: 'POST',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Poblar Timeline',
      description: 'Generar timeline de eventos',
      icon: '📅',
      href: '/api/admin/poblar-timeline',
      method: 'POST',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Actualizar Anuncio',
      description: 'Modificar anuncios existentes',
      icon: '📢',
      href: '/api/admin/update-anuncio',
      method: 'POST',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Gestionar Iniciativas',
      description: 'Ver y editar iniciativas',
      icon: '⚖️',
      href: '/api/admin/iniciativas',
      method: 'GET',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xl">
                🇲🇽
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600">
                  Observatorio IA México
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ver sitio público
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-2xl">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenido, {session.user?.name}
              </h2>
              <p className="text-gray-600">
                Gestiona el contenido del observatorio desde este panel
              </p>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminActions.map((action, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{action.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {action.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {action.method}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {action.description}
                </p>
                <button
                  onClick={() => {
                    // Aquí se implementará la lógica para llamar a las APIs
                    alert(`Funcionalidad: ${action.title}\nRuta: ${action.href}`);
                  }}
                  className={`w-full py-2 px-4 bg-gradient-to-r ${action.color} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
                >
                  Ejecutar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                Información del Sistema
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sesión expira en 24 horas</li>
                <li>• Todas las acciones quedan registradas</li>
                <li>• Solo un administrador puede acceder a este panel</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
