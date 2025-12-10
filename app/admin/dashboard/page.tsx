'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, LogOut, ExternalLink, FileText, Upload, Calendar, Megaphone, Scale, Info, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportResult {
  id: string;
  titulo: string;
  status: 'success' | 'error';
  error?: string;
}

interface ImportResponse {
  success: boolean;
  total: number;
  imported: number;
  errors: number;
  results: ImportResult[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleImportIniciativas = async () => {
    setImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      // Parsear el JSON
      let iniciativas;
      try {
        const parsed = JSON.parse(jsonInput);
        iniciativas = Array.isArray(parsed) ? parsed : parsed.iniciativas;
      } catch {
        setImportError('JSON inválido. Verifica el formato.');
        setImporting(false);
        return;
      }

      if (!Array.isArray(iniciativas) || iniciativas.length === 0) {
        setImportError('El JSON debe contener un array de iniciativas.');
        setImporting(false);
        return;
      }

      // Llamar al API
      const response = await fetch('/api/admin/import-iniciativas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iniciativas }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImportError(data.error || 'Error al importar');
      } else {
        setImportResult(data);
      }
    } catch (err: any) {
      setImportError(err.message || 'Error de conexión');
    } finally {
      setImporting(false);
    }
  };

  const closeModal = () => {
    setShowImportModal(false);
    setJsonInput('');
    setImportResult(null);
    setImportError('');
  };

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
                              if (action.title === 'Importar Iniciativas') {
                                setShowImportModal(true);
                              } else {
                                alert(`Funcionalidad: ${action.title}\nRuta: ${action.href}`);
                              }
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

      {/* Modal: Importar Iniciativas */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Upload size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="font-sans-tech font-semibold text-gray-900">
                    Importar Iniciativas
                  </h2>
                  <p className="font-sans-tech text-xs text-gray-500">
                    Pega el JSON con las iniciativas a importar
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!importResult ? (
                <>
                  {/* Formato esperado */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-sans-tech text-xs text-gray-600 mb-2">
                      <strong>Formato esperado:</strong>
                    </p>
                    <pre className="font-mono text-xs text-gray-500 overflow-x-auto">
{`[
  {
    "id": "iniciativa-70",  // opcional
    "Propuesta": "Título de la iniciativa",
    "Proponente": "Nombre del proponente",
    "Fecha": "15/01/2025",  // DD/MM/YYYY
    "Estado": "En comisiones",
    "Legislatura": "LXVI",
    "Tipo": "ley_federal",
    "Descripción": "Descripción...",
    "Fuente": "https://..."
  }
]`}
                    </pre>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Pega aquí el JSON..."
                    className="w-full h-64 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none"
                  />

                  {/* Error */}
                  {importError && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle size={16} className="text-red-500 shrink-0" />
                      <span className="font-sans-tech text-sm text-red-600">{importError}</span>
                    </div>
                  )}
                </>
              ) : (
                /* Resultados */
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className={`p-4 rounded-lg border ${importResult.errors > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} className={importResult.errors > 0 ? 'text-yellow-600' : 'text-green-600'} />
                      <span className={`font-sans-tech font-semibold ${importResult.errors > 0 ? 'text-yellow-800' : 'text-green-800'}`}>
                        Importación completada
                      </span>
                    </div>
                    <div className="font-sans-tech text-sm space-y-1">
                      <p className="text-gray-600">Total procesadas: <strong>{importResult.total}</strong></p>
                      <p className="text-green-600">Importadas exitosamente: <strong>{importResult.imported}</strong></p>
                      {importResult.errors > 0 && (
                        <p className="text-red-600">Con errores: <strong>{importResult.errors}</strong></p>
                      )}
                    </div>
                  </div>

                  {/* Lista de resultados */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {importResult.results.map((result, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}
                      >
                        {result.status === 'success' ? (
                          <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-gray-500">{result.id}</p>
                          <p className="font-sans-tech text-sm text-gray-900 truncate">{result.titulo}</p>
                          {result.error && (
                            <p className="font-sans-tech text-xs text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              {!importResult ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 font-sans-tech text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImportIniciativas}
                    disabled={importing || !jsonInput.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Importar
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
