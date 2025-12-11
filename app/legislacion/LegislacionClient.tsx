'use client';

import { useState } from 'react';
import { IniciativaLegislativa, IniciativaStatus, CategoriaImpacto, CATEGORIAS_TEMA, CategoriaTema } from '@/types';
import { Scale, AlertCircle, ChevronDown, ChevronUp, ShieldCheck, Eye } from 'lucide-react';
import Link from 'next/link';

interface Props {
  iniciativas: IniciativaLegislativa[];
}

export default function LegislacionClient({ iniciativas }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<IniciativaStatus | 'todos'>('todos');
  const [filtroLegislatura, setFiltroLegislatura] = useState<string>('todos');
  const [filtroCamara, setFiltroCamara] = useState<string>('todos');
  const [filtroTema, setFiltroTema] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const iniciativasFiltradas = iniciativas.filter(i => {
    if (filtroStatus !== 'todos' && i.status !== filtroStatus) return false;
    if (filtroLegislatura !== 'todos' && i.legislatura !== filtroLegislatura) return false;
    if (filtroCamara !== 'todos' && i.camara !== filtroCamara) return false;
    if (filtroTema !== 'todos' && !(i.temas || []).includes(filtroTema)) return false;
    if (filtroCategoria !== 'todos' && (i as any).categoriaTema !== filtroCategoria) return false;
    if (filtroEstado !== 'todos') {
      const camara = i.camara as string;
      const estado = i.entidadFederativa || 
        (camara === 'Local' && i.legislatura?.includes('CDMX') ? 'Ciudad de México' : 
        (camara === 'Local' && i.legislatura?.includes('SLP') ? 'San Luis Potosí' : 
        (camara === 'Diputados' || camara === 'Senado' ? 'Federal' : null)));
      if (estado !== filtroEstado) return false;
    }
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const matchTitulo = i.titulo?.toLowerCase().includes(searchLower);
      const matchProponente = i.proponente?.toLowerCase().includes(searchLower);
      const matchDescripcion = i.descripcion?.toLowerCase().includes(searchLower);
      if (!matchTitulo && !matchProponente && !matchDescripcion) return false;
    }
    return true;
  });

  const stats = {
    total: iniciativas.length,
    activas: iniciativas.filter(i => i.status === 'en_comisiones').length,
    desechadas: iniciativas.filter(i => i.status === 'desechada_termino' || i.status === 'archivada').length,
    aprobadas: iniciativas.filter(i => i.status === 'aprobada').length
  };

  const getStatusBadge = (status: IniciativaStatus | string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'en_comisiones': { text: 'En comisiones', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'en comisiones': { text: 'En comisiones', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'desechada_termino': { text: 'Desechada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'desechada': { text: 'Desechada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: 'Archivada', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'archivado': { text: 'Archivado', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'aprobada': { text: 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' },
      'aprobado': { text: 'Aprobado', color: 'bg-green-100 text-green-700 border-green-200' },
      'aprobada en lo general': { text: 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' },
      'publicada': { text: 'Publicada', color: 'bg-green-100 text-green-700 border-green-200' },
      'publicado': { text: 'Publicado', color: 'bg-green-100 text-green-700 border-green-200' },
      'vigente': { text: 'Vigente', color: 'bg-green-100 text-green-700 border-green-200' },
      'rechazada': { text: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
      'rechazado': { text: 'Rechazado', color: 'bg-red-100 text-red-700 border-red-200' },
      'turnada': { text: 'Turnada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'turnado': { text: 'Turnado', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'pendiente': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Dictaminada', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      'dictaminado': { text: 'Dictaminado', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      'en dictamen': { text: 'En dictamen', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    };
    
    // Normalizar el estatus: minúsculas y sin espacios extra
    const normalizedStatus = (status || '').toString().toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    if (badges[normalizedStatus]) {
      return badges[normalizedStatus];
    }
    
    // Buscar coincidencia parcial para variantes como "Aprobada por unanimidad"
    if (normalizedStatus.includes('aprobad')) {
      return { text: status?.toString() || 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    if (normalizedStatus.includes('rechazad')) {
      return { text: status?.toString() || 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (normalizedStatus.includes('publicad') || normalizedStatus.includes('vigente')) {
      return { text: status?.toString() || 'Publicada', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    if (normalizedStatus.includes('archivad') || normalizedStatus.includes('desechad')) {
      return { text: status?.toString() || 'Archivada', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
    if (normalizedStatus.includes('dictam')) {
      return { text: status?.toString() || 'Dictaminada', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    if (normalizedStatus.includes('turnad') || normalizedStatus.includes('pendiente')) {
      return { text: status?.toString() || 'Turnada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    
    // Fallback: azul para estados desconocidos
    return { text: status?.toString() || 'En proceso', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  const getCategoriaLabel = (categoria: CategoriaImpacto | string): string => {
    const labels: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'Propiedad Intelectual',
      'responsabilidad': 'Responsabilidad',
      'etica': 'Ética',
      'ciberseguridad': 'Ciberseguridad',
      'seguridad_nacional': 'Seguridad Nacional',
      'justicia': 'Justicia',
      'educacion': 'Educación',
      'salud': 'Salud',
      'privacidad': 'Privacidad',
      'derechos_autor': 'Derechos de Autor',
      'violencia_genero': 'Violencia de Género',
      'transparencia': 'Transparencia',
      'trabajo': 'Trabajo',
      'economia': 'Economía'
    };
    return labels[categoria as CategoriaImpacto] || categoria;
  };

  const getCategoriaColor = (categoria: CategoriaImpacto | string): string => {
    const colors: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'bg-purple-100 text-purple-700 border-purple-200',
      'responsabilidad': 'bg-red-100 text-red-700 border-red-200',
      'etica': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'ciberseguridad': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'seguridad_nacional': 'bg-orange-100 text-orange-700 border-orange-200',
      'justicia': 'bg-blue-100 text-blue-700 border-blue-200',
      'educacion': 'bg-green-100 text-green-700 border-green-200',
      'salud': 'bg-pink-100 text-pink-700 border-pink-200',
      'privacidad': 'bg-violet-100 text-violet-700 border-violet-200',
      'derechos_autor': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'violencia_genero': 'bg-rose-100 text-rose-700 border-rose-200',
      'transparencia': 'bg-teal-100 text-teal-700 border-teal-200',
      'trabajo': 'bg-amber-100 text-amber-700 border-amber-200',
      'economia': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return colors[categoria as CategoriaImpacto] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatFecha = (fecha: any) => {
    if (!fecha) return 'N/A';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDate = formatFecha; // Alias para consistencia

  const getTipoLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      'ley_federal': 'Ley Federal',
      'reforma_codigo_penal': 'Reforma Código Penal',
      'reforma_constitucional': 'Reforma Constitucional',
      'reforma_educacion': 'Reforma Educación',
      'reforma_salud': 'Reforma Salud',
      'reforma_violencia_mujer': 'Reforma Violencia contra la Mujer',
      'reforma_telecomunicaciones': 'Reforma Telecomunicaciones',
      'reforma_otra': 'Otra Reforma'
    };
    return labels[tipo] || tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCamaraLabel = (camara: string): string => {
    const labels: Record<string, string> = {
      'diputados': 'Cámara de Diputados',
      'senadores': 'Senado',
      'congreso_cdmx': 'Congreso CDMX'
    };
    return labels[camara] || camara;
  };

  const getStatusLabel = (status: IniciativaStatus): string => {
    return getStatusBadge(status).text;
  };

  if (iniciativas.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif-display font-light text-gray-900 mb-2">
            Base de datos en preparación
          </h2>
          <p className="text-gray-600 font-sans-tech">
            Estamos importando las iniciativas legislativas documentadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Estilo Observatorio */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[80px]"></div>
        </div>
        
        {/* NAV */}
        <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 lg:px-24 py-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-blue-500/50 transition-colors">
              <Eye size={16} className="text-gray-900/80 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-sans-tech text-sm tracking-wide text-gray-900/70">
            <Link href="/#tracker" className="hover:text-blue-500 transition-colors">Tracker</Link>
            <Link href="/legislacion" className="text-blue-500 font-medium">Legislación</Link>
            <Link href="/#metodologia" className="hover:text-blue-500 transition-colors">Metodología</Link>
            <Link href="/actividad" className="hover:text-blue-500 transition-colors">Actividad</Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-16">
          {/* Badge */}
          <div className="w-fit mb-6">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-100 border border-gray-300/10 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
              <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-600/80">
                Monitoreo Legislativo · {stats.total} Iniciativas
              </span>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight mb-6">
            <span className="text-gray-900/90">Legislación</span>{' '}
            <span className="italic text-blue-500">en IA</span>
          </h1>
          
          <p className="font-sans-tech text-lg md:text-xl text-gray-900/60 max-w-2xl leading-relaxed border-l border-blue-500/30 pl-6">
            Seguimiento automatizado de iniciativas, dictámenes y leyes relacionadas con inteligencia artificial en México.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-gray-900 group-hover:text-blue-500 transition-colors">{stats.total}</div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Iniciativas</div>
            </div>
            <div className="group bg-blue-50 border border-blue-200/30 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-blue-600 group-hover:text-blue-700 transition-colors">{stats.activas}</div>
              <div className="font-sans-tech text-xs text-blue-600/60 uppercase tracking-widest mt-1">Activas</div>
            </div>
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-gray-400/30 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-gray-600 group-hover:text-gray-700 transition-colors">{stats.desechadas}</div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Desechadas</div>
            </div>
            <div className="group bg-emerald-50 border border-emerald-200/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-emerald-600 group-hover:text-emerald-700 transition-colors">{stats.aprobadas}</div>
              <div className="font-sans-tech text-xs text-emerald-600/60 uppercase tracking-widest mt-1">Aprobadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-gray-50 border-b border-gray-200/50 py-6">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Cámara</label>
              <select
                value={filtroCamara}
                onChange={(e) => setFiltroCamara(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todas</option>
                <option value="Diputados">🏛️ Diputados</option>
                <option value="Senado">🏢 Senado</option>
                <option value="Local">🏙️ Local</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Estado</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as IniciativaStatus | 'todos')}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="en_comisiones">✅ En comisiones</option>
                <option value="turnada">📋 Turnadas</option>
                <option value="archivada">🗂️ Archivadas</option>
                <option value="desechada_termino">❌ Desechadas</option>
                <option value="aprobada">✅ Aprobadas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Legislatura</label>
              <select
                value={filtroLegislatura}
                onChange={(e) => setFiltroLegislatura(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todas</option>
                <option value="LXVI">LXVI (2024-2027) ⭐</option>
                <option value="LXV">LXV (2021-2024)</option>
                <option value="LXIV">LXIV (2018-2021)</option>
                <option value="III_CDMX">CDMX III</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Tema</label>
              <select
                value={filtroTema}
                onChange={(e) => setFiltroTema(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todos</option>
                <option value="Regulación General">📜 Regulación General</option>
                <option value="Seguridad y Delitos">🔒 Seguridad y Delitos</option>
                <option value="Privacidad y Datos">🛡️ Privacidad</option>
                <option value="Deepfakes y Contenido">🎭 Deepfakes</option>
                <option value="Propiedad Intelectual">©️ Prop. Intelectual</option>
                <option value="Salud">🏥 Salud</option>
                <option value="Laboral">💼 Laboral</option>
                <option value="Educación">📚 Educación</option>
                <option value="Sector Público">🏛️ Sector Público</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Entidad</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todas</option>
                <option value="Federal">🇲🇽 Federal</option>
                <option value="Ciudad de México">CDMX</option>
                <option value="Campeche">Campeche</option>
                <option value="Chihuahua">Chihuahua</option>
                <option value="Guanajuato">Guanajuato</option>
                <option value="Michoacán">Michoacán</option>
                <option value="Oaxaca">Oaxaca</option>
                <option value="Querétaro">Querétaro</option>
                <option value="Quintana Roo">Quintana Roo</option>
                <option value="Yucatán">Yucatán</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-tech font-medium text-gray-900/50 mb-1.5 uppercase tracking-wider">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">Todas</option>
                {Object.entries(CATEGORIAS_TEMA).map(([key, { label, emoji }]) => (
                  <option key={key} value={key}>{emoji} {label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por título, proponente o descripción..."
                className="w-full px-4 py-2.5 border border-gray-300/20 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech placeholder:text-gray-400"
              />
            </div>
            {(filtroStatus !== 'todos' || filtroLegislatura !== 'todos' || filtroCamara !== 'todos' || filtroTema !== 'todos' || filtroEstado !== 'todos' || filtroCategoria !== 'todos' || busqueda) && (
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setFiltroLegislatura('todos');
                  setFiltroCamara('todos');
                  setFiltroTema('todos');
                  setFiltroEstado('todos');
                  setFiltroCategoria('todos');
                  setBusqueda('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300/20 rounded-lg hover:bg-white hover:border-blue-500/30 transition-all font-sans-tech"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-display text-2xl md:text-3xl font-light text-gray-900">
              Iniciativas <span className="italic text-blue-500">documentadas</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {iniciativasFiltradas.length} de {iniciativas.length}
            </span>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200/50">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200/50">
                <tr>
                  <th className="w-8 px-2 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Iniciativa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Proponente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Legislatura
                  </th>
                </tr>
              </thead>
              <tbody>
                {iniciativasFiltradas.map((iniciativa, index) => {
                  const badge = getStatusBadge(iniciativa.status);
                  const isExpanded = expandedId === iniciativa.id;
                  
                  return (
                    <>
                      <tr 
                        key={iniciativa.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50/70 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/30'
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : iniciativa.id)}
                      >
                        <td className="px-2 py-4 text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2">
                            <div className="text-gray-900 font-sans-tech font-medium flex-1 text-sm">
                              {iniciativa.titulo}
                            </div>
                            {iniciativa.estadoVerificacion === 'verificado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                <ShieldCheck size={12} />
                                Verificado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-sans-tech">
                            {iniciativa.tipo} · {iniciativa.camara}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-sans-tech">
                          {iniciativa.proponente}
                          <div className="text-xs text-gray-400">{iniciativa.partido}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                          {formatFecha(iniciativa.fecha)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans-tech border ${badge.color}`}>
                            {badge.text}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                          {iniciativa.legislatura}
                        </td>
                      </tr>
                    
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr key={`${iniciativa.id}-expanded`}>
                          <td colSpan={6} className="p-0 bg-gray-50/70 border-t border-gray-200/50">
                            <div className="flex">
                              {/* Barra de color lateral */}
                              <div className="w-1 bg-blue-500"></div>
                              
                              <div className="p-6 w-full pl-14">
                                {/* Categoría Temática */}
                                {(iniciativa as any).categoriaTema && CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema] && (
                                  <div className="mb-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-sans-tech font-medium bg-${CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema].color}-100 text-${CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema].color}-700 border border-${CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema].color}-200`}>
                                      {CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema].emoji} {CATEGORIAS_TEMA[(iniciativa as any).categoriaTema as CategoriaTema].label}
                                    </span>
                                  </div>
                                )}

                                {/* Metadatos Clave */}
                                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Tipo</span>
                                    <span className="text-gray-900 font-sans-tech">{getTipoLabel(iniciativa.tipo)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Cámara</span>
                                    <span className="text-gray-900 font-sans-tech">{getCamaraLabel(iniciativa.camara)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Fecha</span>
                                    <span className="text-gray-900 font-mono">{formatDate(iniciativa.fecha)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Estado</span>
                                    <span className="text-gray-900 font-sans-tech">{getStatusLabel(iniciativa.status)}</span>
                                  </div>
                                </div>
                              
                                {/* Descripción */}
                                {iniciativa.descripcion && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Descripción</h4>
                                    <p className="text-gray-600 font-sans-tech leading-relaxed max-w-4xl">
                                      {iniciativa.descripcion}
                                    </p>
                                  </div>
                                )}
                              
                                {/* Resumen */}
                                {iniciativa.resumen && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Resumen de la propuesta</h4>
                                    <p className="text-gray-600 font-sans-tech leading-relaxed max-w-4xl">
                                      {iniciativa.resumen}
                                    </p>
                                  </div>
                                )}
                              
                                {/* Categorías de Impacto */}
                                {iniciativa.categoriasImpacto && iniciativa.categoriasImpacto.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Categorías de impacto</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {iniciativa.categoriasImpacto.map((categoria) => (
                                        <span 
                                          key={categoria}
                                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sans-tech font-medium border ${getCategoriaColor(categoria)}`}
                                        >
                                          {getCategoriaLabel(categoria)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              
                                {/* Verificación con IA */}
                                {iniciativa.estadoVerificacion === 'verificado' && (
                                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                      <span className="font-sans-tech font-medium text-emerald-800 text-sm">Verificado por AI Agent</span>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-mono">
                                      Modelo: Claude Sonnet 4 (Anthropic)
                                      {iniciativa.fechaVerificacion && (
                                        <span className="ml-2">
                                          • {new Date(iniciativa.fechaVerificacion).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}

                                {/* Enlaces */}
                                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200/50">
                                  <Link 
                                    href={`/legislacion/${iniciativa.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-sans-tech text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Ver detalles
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                  </Link>
                                  {iniciativa.urlPDF && (
                                    <a 
                                      href={iniciativa.urlPDF}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300/30 text-gray-700 font-sans-tech text-sm uppercase tracking-wider hover:bg-gray-100 hover:border-blue-500/30 transition-all rounded-lg"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      PDF oficial
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer info */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200/50 text-xs font-sans-tech text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Datos actualizados automáticamente</span>
            </div>
            <span className="font-mono text-blue-500/50">Powered by Citizen Agents</span>
          </div>
        </div>
      </section>
    </div>
  );
}
