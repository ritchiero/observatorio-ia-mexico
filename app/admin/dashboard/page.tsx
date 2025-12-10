'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, LogOut, ExternalLink, FileText, Upload, Calendar, Megaphone, Scale, Info } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border border-gray-300/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="font-sans-tech text-sm text-gray-900/50">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const sections = [
    {
      id: 'proyectos',
      title: 'Proyectos Federales',
      subtitle: 'Anuncios gubernamentales de IA',
      icon: Megaphone,
      actions: [
        {
          title: 'Ver Anuncios',
          description: 'Lista de todos los proyectos federales anunciados',
          icon: Eye,
          href: '/api/anuncios',
          method: 'GET',
        },
        {
          title: 'Actualizar Anuncio',
          description: 'Modificar información de un anuncio existente',
          icon: Megaphone,
          href: '/api/admin/update-anuncio',
          method: 'POST',
        },
        {
          title: 'Poblar Timeline',
          description: 'Generar timeline de eventos para un anuncio',
          icon: Calendar,
          href: '/api/admin/poblar-timeline',
          method: 'POST',
        },
      ]
    },
    {
      id: 'iniciativas',
      title: 'Iniciativas Legislativas',
      subtitle: 'Propuestas de ley y regulación',
      icon: Scale,
      actions: [
        {
          title: 'Ver Iniciativas',
          description: 'Lista de todas las iniciativas legislativas',
          icon: Scale,
          href: '/api/iniciativas',
          method: 'GET',
        },
        {
          title: 'Importar Iniciativas',
          description: 'Importar nuevas iniciativas desde JSON',
          icon: Upload,
          href: '/api/admin/import-iniciativas',
          method: 'POST',
        },
        {
          title: 'Actualizar PDFs',
          description: 'Actualizar URLs de documentos PDF',
          icon: FileText,
          href: '/api/admin/update-pdf-urls',
          method: 'POST',
        },
      ]
    },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Textura de ruido */}
      <div className="noise-bg"></div>
      
      {/* Background effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 radar-grid transform perspective-1000 rotate-x-12 scale-110 opacity-40"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="border-b border-gray-300/10 backdrop-blur-sm bg-white/80">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
            <div className={`flex justify-between items-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-blue-500/50 transition-colors">
                  <Eye size={16} className="text-gray-900/80 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
                  <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="hidden md:flex items-center gap-2 font-sans-tech text-sm text-gray-900/60 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink size={14} />
                  Ver sitio
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 font-sans-tech text-xs uppercase tracking-widest hover:bg-red-50 transition-all duration-300"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow px-6 md:px-12 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Welcome Section */}
            <div className={`mb-12 ${mounted ? 'animate-reveal' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-900/50">
                  Sesión activa
                </span>
              </div>
              
              <h1 className="font-serif-display text-4xl md:text-5xl font-light text-gray-900 mb-3">
                Bienvenido, <span className="italic text-blue-500">{session.user?.name}</span>
              </h1>
              <p className="font-sans-tech text-gray-900/50 max-w-xl">
                Gestiona el contenido del observatorio desde este panel de control
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              {sections.map((section, sectionIndex) => {
                const SectionIcon = section.icon;
                return (
                  <div 
                    key={section.id} 
                    className={`${mounted ? `animate-reveal delay-${(sectionIndex + 1) * 100}` : 'opacity-0'}`}
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <SectionIcon size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <h2 className="font-sans-tech font-semibold text-gray-900">
                          {section.title}
                        </h2>
                        <p className="font-sans-tech text-xs text-gray-900/50">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Section Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.actions.map((action, actionIndex) => {
                        const IconComponent = action.icon;
                        return (
                          <button
                            key={actionIndex}
                            onClick={() => {
                              alert(`Funcionalidad: ${action.title}\nRuta: ${action.href}`);
                            }}
                            className="group bg-gray-50 border border-gray-300/10 rounded-xl p-6 text-left hover:border-blue-500/30 hover:bg-white transition-all duration-300 backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                                <IconComponent size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                              </div>
                              <span className="font-mono text-[10px] text-gray-400 uppercase px-2 py-1 bg-gray-100 rounded">
                                {action.method}
                              </span>
                            </div>
                            
                            <h3 className="font-sans-tech font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="font-sans-tech text-sm text-gray-900/50">
                              {action.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Card */}
            <div className={`mt-12 ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Info size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-sans-tech font-semibold text-blue-900 mb-2">
                      Información del Sistema
                    </h3>
                    <ul className="font-sans-tech text-sm text-blue-800/70 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Sesión expira en 24 horas
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Todas las acciones quedan registradas
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Solo un administrador puede acceder a este panel
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-300/5 px-6 md:px-12 py-6">
          <div className={`max-w-6xl mx-auto flex justify-between items-center text-xs font-sans-tech text-gray-900/30 ${mounted ? 'animate-reveal delay-300' : 'opacity-0'}`}>
            <span>Panel de Administración v1.0</span>
            <span className="text-blue-500/40">Observatorio IA México</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
