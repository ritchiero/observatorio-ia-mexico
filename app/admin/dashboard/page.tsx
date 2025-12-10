'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, LogOut, ExternalLink, FileText, Upload, Calendar, Megaphone, Scale, Info, X, CheckCircle, AlertCircle, Edit, Search, Save, RefreshCw } from 'lucide-react';

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

interface Iniciativa {
  id: string;
  titulo: string;
  estatus?: string;
  status?: string;
  proponente: string;
  categoria?: string;
  fecha: string;
  descripcion?: string;
  camara?: string;
  legislatura?: string;
  tipo?: string;
  entidadFederativa?: string;
  ambito?: string;
  urlGaceta?: string;
  urlPDF?: string;
  partido?: string;
  temas?: string[];
  resumen?: string;
  estadoVerificacion?: 'verificado' | 'revision' | 'pendiente';
  fechaVerificacion?: string;
}

const ESTATUS_OPTIONS = [
  'En comisiones',
  'Aprobada',
  'Aprobado',
  'aprobada',
  'Rechazada',
  'Pendiente',
  'En revisión',
  'Publicada',
  'Archivada',
];

const CAMARA_OPTIONS = [
  'Diputados',
  'Senado',
  'Local',
  'Congreso del Estado',
];

const AMBITO_OPTIONS = [
  'Federal',
  'Local',
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Modal states - Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [importError, setImportError] = useState('');

  // Modal states - Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [loadingIniciativas, setLoadingIniciativas] = useState(false);
  const [selectedIniciativa, setSelectedIniciativa] = useState<Iniciativa | null>(null);
  const [editForm, setEditForm] = useState<Partial<Iniciativa>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Bulk verification states
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [bulkLimit, setBulkLimit] = useState(10);
  const [excludeVerified, setExcludeVerified] = useState(true);

  // JSON edit mode
  const [jsonEditMode, setJsonEditMode] = useState(false);
  const [editJsonInput, setEditJsonInput] = useState('');
  const [editJsonError, setEditJsonError] = useState('');

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

  // Cargar iniciativas para editar
  const loadIniciativas = async () => {
    setLoadingIniciativas(true);
    try {
      const response = await fetch('/api/iniciativas');
      const data = await response.json();
      if (data.success) {
        setIniciativas(data.data);
      }
    } catch (err) {
      console.error('Error loading iniciativas:', err);
    } finally {
      setLoadingIniciativas(false);
    }
  };

  const openEditModal = () => {
    setShowEditModal(true);
    setSelectedIniciativa(null);
    setEditForm({});
    setSaveMessage(null);
    setSearchTerm('');
    loadIniciativas();
  };

  const selectIniciativa = (ini: Iniciativa) => {
    setSelectedIniciativa(ini);
    setEditForm({
      titulo: ini.titulo,
      estatus: ini.estatus || ini.status || '',
      proponente: ini.proponente,
      categoria: ini.categoria || '',
      descripcion: ini.descripcion || '',
      resumen: ini.resumen || '',
      legislatura: ini.legislatura || '',
      tipo: ini.tipo || '',
      camara: ini.camara || '',
      entidadFederativa: ini.entidadFederativa || '',
      ambito: ini.ambito || '',
      urlGaceta: ini.urlGaceta || '',
      urlPDF: ini.urlPDF || '',
      partido: ini.partido || '',
    });
    setSaveMessage(null);
    setVerificationResult(null);
    setJsonEditMode(false);
    setEditJsonError('');
    // Preparar JSON para edición
    const jsonData = { ...ini };
    delete (jsonData as any).id; // No editar el ID
    setEditJsonInput(JSON.stringify(jsonData, null, 2));
  };

  const handleSaveFromJson = async () => {
    if (!selectedIniciativa) return;
    
    // 🔍 DEBUG: Verificar estado de la iniciativa
    console.log('🔍 [PROTECCIÓN] Iniciativa seleccionada:', selectedIniciativa);
    console.log('🔍 [PROTECCIÓN] Estado de verificación:', selectedIniciativa.estadoVerificacion);
    console.log('🔍 [PROTECCIÓN] ¿Es verificado?:', selectedIniciativa.estadoVerificacion === 'verificado');
    
    // 🔒 PROTECCIÓN: Impedir modificación de iniciativas verificadas
    if (selectedIniciativa.estadoVerificacion === 'verificado') {
      console.log('⚠️ [PROTECCIÓN] Bloqueando edición de iniciativa verificada');
      const confirmar = confirm(
        '⚠️ ADVERTENCIA: Esta iniciativa está verificada por IA.\n\n' +
        'No se puede modificar manualmente una iniciativa verificada.\n' +
        'Si necesitas hacer cambios:\n' +
        '1. Haz clic en "Verificar" para reverificar\n' +
        '2. La IA actualizará los datos automáticamente\n\n' +
        '¿Quieres reverificar ahora?'
      );
      
      if (confirmar) {
        console.log('🔄 [PROTECCIÓN] Usuario confirmó reverificación');
        // Llamar a la función de verificación
        await handleVerifyInitiative();
      } else {
        console.log('❌ [PROTECCIÓN] Usuario canceló la acción');
      }
      return;
    }
    
    setEditJsonError('');
    setSaving(true);
    setSaveMessage(null);
    
    // Validar JSON
    let parsedJson;
    try {
      parsedJson = JSON.parse(editJsonInput);
    } catch (e) {
      setEditJsonError('JSON inválido. Verifica el formato.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/iniciativas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIniciativa.id,
          ...parsedJson,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: 'Respuesta inválida del servidor' };
      }

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Iniciativa actualizada desde JSON' });
        // Actualizar la lista local
        const updatedIniciativa = { ...selectedIniciativa, ...parsedJson };
        setIniciativas(prev => prev.map(ini => 
          ini.id === selectedIniciativa.id ? updatedIniciativa : ini
        ));
        setSelectedIniciativa(updatedIniciativa);
        setEditForm(parsedJson);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIniciativa = async () => {
    if (!selectedIniciativa) return;
    
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/admin/iniciativas', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': 'admin-key-placeholder' // El endpoint actual requiere esto
        },
        body: JSON.stringify({
          id: selectedIniciativa.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Iniciativa actualizada correctamente' });
        // Actualizar la lista local
        setIniciativas(prev => prev.map(ini => 
          ini.id === selectedIniciativa.id 
            ? { ...ini, ...editForm } 
            : ini
        ));
        setSelectedIniciativa({ ...selectedIniciativa, ...editForm } as Iniciativa);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Error al guardar' });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedIniciativa(null);
    setEditForm({});
    setSaveMessage(null);
    setSearchTerm('');
    setVerificationResult(null);
  };

  // Verificar iniciativa con Claude Haiku 4.5
  const handleVerifyInitiative = async () => {
    if (!selectedIniciativa) return;
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await fetch('/api/admin/verify-initiative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedIniciativa)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVerificationResult({
          ...data.verification,
          estadoVerificacion: data.estadoVerificacion,
          fechaVerificacion: data.fechaVerificacion
        });
        
        // Actualizar la iniciativa en la lista local
        if (selectedIniciativa) {
          const updatedIniciativa = {
            ...selectedIniciativa,
            estadoVerificacion: data.estadoVerificacion,
            fechaVerificacion: data.fechaVerificacion
          };
          setSelectedIniciativa(updatedIniciativa);
          setIniciativas(prev => prev.map(ini => 
            ini.id === selectedIniciativa.id ? updatedIniciativa : ini
          ));
        }
      } else {
        alert('Error al verificar: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al verificar iniciativa');
    } finally {
      setIsVerifying(false);
    }
  };

  // Verificar iniciativas (con opciones)
  const handleBulkVerify = async () => {
    setIsBulkVerifying(true);
    setBulkResults(null);
    setShowBulkModal(true);

    try {
      const response = await fetch('/api/admin/verify-initiatives-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          excludeVerified,
          limit: bulkLimit
        })
      });

      const data = await response.json();

      if (data.success) {
        setBulkResults(data);
        // Recargar iniciativas para mostrar estados actualizados
        loadIniciativas();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setIsBulkVerifying(false);
    }
  };

  const filteredIniciativas = iniciativas.filter(ini =>
    ini.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ini.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ini.proponente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          title: 'Editar Iniciativa',
          description: 'Modificar status u otros campos de una iniciativa',
          icon: Edit,
          href: '/api/admin/iniciativas',
          method: 'PUT',
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
                              } else if (action.title === 'Editar Iniciativa') {
                                openEditModal();
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

      {/* Modal: Editar Iniciativa */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Edit size={18} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="font-sans-tech font-semibold text-gray-900">
                    Editar Iniciativa
                  </h2>
                  <p className="font-sans-tech text-xs text-gray-500">
                    Selecciona una iniciativa para modificar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerifyInitiative}
                  disabled={isVerifying || !selectedIniciativa}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans-tech text-sm font-medium"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>Verificar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setBulkResults(null); setShowBulkModal(true); }}
                  disabled={iniciativas.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans-tech text-sm font-medium"
                >
                  <span>🔄</span>
                  <span>Verificar Lote</span>
                </button>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Lista de iniciativas */}
              <div className="w-1/2 border-r border-gray-200 flex flex-col">
                {/* Buscador */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por título, ID o proponente..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto">
                  {loadingIniciativas ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : filteredIniciativas.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 font-sans-tech text-sm">
                      No se encontraron iniciativas
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredIniciativas.map((ini) => (
                        <button
                          key={ini.id}
                          onClick={() => selectIniciativa(ini)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            selectedIniciativa?.id === ini.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-mono text-[10px] text-gray-400">{ini.id}</p>
                            {ini.estadoVerificacion && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                ini.estadoVerificacion === 'verificado' ? 'bg-green-100 text-green-700' :
                                ini.estadoVerificacion === 'revision' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {ini.estadoVerificacion === 'verificado' ? '✓ Verificado' : '⚠ Revisión'}
                              </span>
                            )}
                          </div>
                          <p className="font-sans-tech text-sm text-gray-900 line-clamp-2 mb-1">{ini.titulo}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              ini.estatus === 'Aprobada' ? 'bg-green-100 text-green-700' :
                              ini.estatus === 'Rechazada' ? 'bg-red-100 text-red-700' :
                              ini.estatus === 'En comisiones' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ini.estatus}
                            </span>
                            <span className="text-[10px] text-gray-400">{ini.categoria}</span>
                            {ini.fechaVerificacion && (
                              <span className="text-[9px] text-gray-400">
                                Verificado: {new Date(ini.fechaVerificacion).toLocaleDateString('es-MX')}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario de edición */}
              <div className="w-1/2 p-6 overflow-y-auto">
                {!selectedIniciativa ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Scale size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-sans-tech text-gray-500">
                        Selecciona una iniciativa para editar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Toggle Modo JSON / Formulario */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          ID
                        </label>
                        <p className="font-mono text-xs text-gray-600">
                          {selectedIniciativa.id}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setJsonEditMode(!jsonEditMode);
                          setSaving(false);
                          setSaveMessage(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-sans-tech text-xs transition-all ${
                          jsonEditMode 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {jsonEditMode ? '📝 Modo Formulario' : '{ } Modo JSON'}
                      </button>
                    </div>

                    {/* Modo JSON */}
                    {jsonEditMode ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                            Editar JSON
                          </label>
                          <textarea
                            value={editJsonInput}
                            onChange={(e) => {
                              setEditJsonInput(e.target.value);
                              setEditJsonError('');
                            }}
                            rows={20}
                            className="w-full px-3 py-2 bg-gray-900 text-green-400 border border-gray-700 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
                            spellCheck={false}
                          />
                          {editJsonError && (
                            <p className="mt-2 text-red-500 text-xs font-sans-tech">{editJsonError}</p>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveFromJson}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-sans-tech text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                          >
                            {saving ? (
                              <>
                                <RefreshCw size={16} className="animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Guardar JSON
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              // Reset JSON to current state
                              const jsonData = { ...selectedIniciativa };
                              delete (jsonData as any).id;
                              setEditJsonInput(JSON.stringify(jsonData, null, 2));
                              setEditJsonError('');
                              setSaving(false);
                              setSaveMessage(null);
                            }}
                            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-sans-tech text-sm hover:bg-gray-200 transition-all"
                          >
                            Resetear
                          </button>
                        </div>
                        {saveMessage && (
                          <div className={`p-3 rounded-lg text-sm font-sans-tech ${
                            saveMessage.type === 'success' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {saveMessage.type === 'success' ? '✅' : '❌'} {saveMessage.text}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Título */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Título
                      </label>
                      <textarea
                        value={editForm.titulo || ''}
                        onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Row: Estatus + Cámara */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Estatus
                        </label>
                        <select
                          value={editForm.estatus || ''}
                          onChange={(e) => setEditForm({ ...editForm, estatus: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Seleccionar...</option>
                          {ESTATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Ámbito
                        </label>
                        <select
                          value={editForm.ambito || ''}
                          onChange={(e) => setEditForm({ ...editForm, ambito: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Seleccionar...</option>
                          {AMBITO_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Proponente */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Proponente
                      </label>
                      <input
                        type="text"
                        value={editForm.proponente || ''}
                        onChange={(e) => setEditForm({ ...editForm, proponente: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Row: Cámara + Entidad */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Cámara
                        </label>
                        <input
                          type="text"
                          value={editForm.camara || ''}
                          onChange={(e) => setEditForm({ ...editForm, camara: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Entidad Federativa
                        </label>
                        <input
                          type="text"
                          value={editForm.entidadFederativa || ''}
                          onChange={(e) => setEditForm({ ...editForm, entidadFederativa: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Row: Legislatura + Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Legislatura
                        </label>
                        <input
                          type="text"
                          value={editForm.legislatura || ''}
                          onChange={(e) => setEditForm({ ...editForm, legislatura: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Tipo
                        </label>
                        <input
                          type="text"
                          value={editForm.tipo || ''}
                          onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Row: Categoría + Partido */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Categoría
                        </label>
                        <input
                          type="text"
                          value={editForm.categoria || ''}
                          onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                          Partido
                        </label>
                        <input
                          type="text"
                          value={editForm.partido || ''}
                          onChange={(e) => setEditForm({ ...editForm, partido: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={editForm.descripcion || ''}
                        onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Resumen */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Resumen
                      </label>
                      <textarea
                        value={editForm.resumen || ''}
                        onChange={(e) => setEditForm({ ...editForm, resumen: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* URL Gaceta */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        URL Gaceta
                      </label>
                      <input
                        type="url"
                        value={editForm.urlGaceta || ''}
                        onChange={(e) => setEditForm({ ...editForm, urlGaceta: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* URL PDF */}
                    <div>
                      <label className="block font-sans-tech text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        URL PDF
                      </label>
                      <input
                        type="url"
                        value={editForm.urlPDF || ''}
                        onChange={(e) => setEditForm({ ...editForm, urlPDF: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Resultados de Verificación con Haiku 4.5 */}
                    {verificationResult && (
                      <div className={`p-4 border-2 rounded-lg transition-all ${
                        verificationResult.verified 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-yellow-500 bg-yellow-50'
                      }`}>
                        {/* Estado de verificación */}
                        <div className={`mb-3 p-3 rounded-lg ${
                          verificationResult.estadoVerificacion === 'verificado' 
                            ? 'bg-green-100 border border-green-300' 
                            : 'bg-orange-100 border border-orange-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-sans-tech font-bold text-sm ${
                              verificationResult.estadoVerificacion === 'verificado' ? 'text-green-800' : 'text-orange-800'
                            }`}>
                              {verificationResult.estadoVerificacion === 'verificado' 
                                ? '✓ VERIFICADO' 
                                : '⚠ REQUIERE REVISIÓN'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                              verificationResult.confidence === 'high' ? 'bg-green-200 text-green-800' :
                              verificationResult.confidence === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {verificationResult.confidence === 'high' ? 'Alta confianza' :
                               verificationResult.confidence === 'medium' ? 'Confianza media' : 'Baja confianza'}
                            </span>
                          </div>
                          {verificationResult.fechaVerificacion && (
                            <p className="font-mono text-[10px] text-gray-500 mt-1">
                              Verificado: {new Date(verificationResult.fechaVerificacion).toLocaleString('es-MX')}
                            </p>
                          )}
                        </div>

                        <p className="font-sans-tech text-xs text-gray-700 mb-3 leading-relaxed">
                          {verificationResult.summary}
                        </p>

                        {verificationResult.currentStatus && verificationResult.currentStatus !== 'no encontrado' && (
                          <div className="mb-3 p-2 bg-white rounded border text-xs">
                            <span className="font-medium text-gray-700">Estatus Verificado: </span>
                            <span className={`font-semibold ${
                              verificationResult.statusMatch ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {verificationResult.currentStatus}
                              {!verificationResult.statusMatch && ' ⚠️'}
                            </span>
                          </div>
                        )}

                        {verificationResult.corrections && 
                         Object.values(verificationResult.corrections).some((v: any) => v !== null) && (
                          <div className="mb-3 p-2 bg-white rounded border">
                            <h4 className="font-sans-tech font-medium text-xs mb-2 flex items-center gap-1">
                              📝 Correcciones Sugeridas:
                            </h4>
                            <div className="space-y-1 text-[11px]">
                              {verificationResult.corrections.titulo && (
                                <div><span className="font-medium text-gray-600">Título:</span> <span className="text-blue-700">{verificationResult.corrections.titulo}</span></div>
                              )}
                              {verificationResult.corrections.estatus && (
                                <div><span className="font-medium text-gray-600">Estatus:</span> <span className="text-blue-700">{verificationResult.corrections.estatus}</span></div>
                              )}
                              {verificationResult.corrections.proponente && (
                                <div><span className="font-medium text-gray-600">Proponente:</span> <span className="text-blue-700">{verificationResult.corrections.proponente}</span></div>
                              )}
                              {verificationResult.corrections.urlPDF && (
                                <div><span className="font-medium text-gray-600">PDF:</span> <a href={verificationResult.corrections.urlPDF} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{verificationResult.corrections.urlPDF}</a></div>
                              )}
                            </div>
                          </div>
                        )}

                        {verificationResult.sources && verificationResult.sources.length > 0 && (
                          <div className="mb-3 p-2 bg-white rounded border">
                            <h4 className="font-sans-tech font-medium text-xs mb-2 flex items-center gap-1">
                              🔗 Fuentes Oficiales:
                            </h4>
                            <ul className="space-y-1 text-[11px]">
                              {verificationResult.sources.map((url: string, idx: number) => (
                                <li key={idx}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {verificationResult.flags && verificationResult.flags.length > 0 && (
                          <div className="p-2 bg-orange-50 rounded border border-orange-200">
                            <h4 className="font-sans-tech font-medium text-xs mb-1 text-orange-700 flex items-center gap-1">
                              ⚠️ Alertas:
                            </h4>
                            <ul className="space-y-1 text-[11px] text-orange-700">
                              {verificationResult.flags.map((flag: string, idx: number) => (
                                <li key={idx}>• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mensaje de guardado */}
                    {saveMessage && (
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                        saveMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        {saveMessage.type === 'success' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                        <span className={`font-sans-tech text-sm ${
                          saveMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {saveMessage.text}
                        </span>
                      </div>
                    )}

                    {/* Botón guardar */}
                    <button
                      onClick={handleSaveIniciativa}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Guardar cambios
                        </>
                      )}
                    </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resultados Verificación Bulk */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => !isBulkVerifying && setShowBulkModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <div>
                  <h2 className="font-sans-tech font-semibold text-gray-900">
                    Verificación Masiva
                  </h2>
                  <p className="font-sans-tech text-xs text-gray-500">
                    {isBulkVerifying ? 'Verificando iniciativas...' : 'Resultados de la verificación'}
                  </p>
                </div>
              </div>
              {!isBulkVerifying && (
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!isBulkVerifying && !bulkResults ? (
                /* Configuración antes de iniciar */
                <div className="space-y-4">
                  <div>
                    <label className="block font-sans-tech text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Cantidad a verificar
                    </label>
                    <select
                      value={bulkLimit}
                      onChange={(e) => setBulkLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg font-sans-tech text-sm"
                    >
                      <option value={5}>5 iniciativas</option>
                      <option value={10}>10 iniciativas</option>
                      <option value={20}>20 iniciativas</option>
                      <option value={50}>50 iniciativas</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="excludeVerified"
                      checked={excludeVerified}
                      onChange={(e) => setExcludeVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="excludeVerified" className="font-sans-tech text-sm text-gray-700">
                      Excluir las ya verificadas (solo pendientes)
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="font-sans-tech text-sm text-blue-800">
                      💡 La verificación se hace una por una con pausas para evitar errores. 
                      Cada verificación toma ~10-15 segundos.
                    </p>
                  </div>

                  <button
                    onClick={handleBulkVerify}
                    className="w-full py-3 bg-indigo-600 text-white font-sans-tech font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    🚀 Iniciar Verificación
                  </button>
                </div>
              ) : isBulkVerifying ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-sans-tech text-gray-600">
                    Verificando hasta {bulkLimit} iniciativas...
                  </p>
                  <p className="font-sans-tech text-sm text-gray-400 mt-2">
                    Esto puede tomar varios minutos. No cierres esta ventana.
                  </p>
                </div>
              ) : bulkResults ? (
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="font-sans-tech text-2xl font-bold text-gray-900">{bulkResults.total}</p>
                      <p className="font-sans-tech text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="font-sans-tech text-2xl font-bold text-green-600">{bulkResults.verificados}</p>
                      <p className="font-sans-tech text-xs text-green-600">Verificados</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="font-sans-tech text-2xl font-bold text-orange-600">{bulkResults.revision}</p>
                      <p className="font-sans-tech text-xs text-orange-600">Revisión</p>
                    </div>
                  </div>

                  {/* Lista de resultados */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bulkResults.results?.map((result: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          result.estadoVerificacion === 'verificado' ? 'bg-green-50' : 'bg-orange-50'
                        }`}
                      >
                        <span className="text-lg">
                          {result.estadoVerificacion === 'verificado' ? '✓' : '⚠'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px] text-gray-500">{result.id}</p>
                          <p className="font-sans-tech text-sm text-gray-900 truncate">{result.titulo}</p>
                          <p className="font-sans-tech text-xs text-gray-500 mt-1">{result.summary}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-medium ${
                          result.confidence === 'high' ? 'bg-green-200 text-green-800' :
                          result.confidence === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {result.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {!isBulkVerifying && (
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-6 py-2 bg-indigo-600 text-white font-sans-tech text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
