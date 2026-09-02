'use client';

import { Fragment, useEffect, useState } from 'react';
import { IniciativaLegislativa, IniciativaStatus, CategoriaImpacto, CategoriaTema } from '@/types';
import { Scale, AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import FolioBadge from '@/components/FolioBadge';
import { fetchOverlayEn, aplicarOverlay, OverlayEn } from '@/lib/i18n/client';
import { ESTATUS_INICIATIVA_EN } from '@/lib/i18n/labels-en';
import { dict } from '@/lib/i18n/dictionary';

interface Props {
  iniciativas: IniciativaLegislativa[];
}

// Local EN mirror of CATEGORIAS_TEMA (types/index.ts) — there is no shared
// EN dictionary for this taxonomy yet, so we translate just the labels here
// and keep the same keys/emoji/color as the ES source of truth.
const CATEGORIAS_TEMA_EN: Record<CategoriaTema, { label: string; emoji: string; color: string }> = {
  'propiedad_intelectual': { label: 'Intellectual Property', emoji: '🎨', color: 'purple' },
  'responsabilidad': { label: 'Liability', emoji: '⚖️', color: 'blue' },
  'ciberseguridad': { label: 'Cybersecurity', emoji: '🔒', color: 'cyan' },
  'delitos': { label: 'Crimes', emoji: '🚨', color: 'red' },
  'laboral': { label: 'Labor', emoji: '💼', color: 'amber' },
  'privacidad_datos': { label: 'Privacy & Data', emoji: '🛡️', color: 'indigo' },
  'deepfakes': { label: 'Deepfakes', emoji: '🎭', color: 'pink' },
  'salud': { label: 'Health', emoji: '🏥', color: 'rose' },
  'educacion': { label: 'Education', emoji: '📚', color: 'green' },
  'sector_publico': { label: 'Public Sector', emoji: '🏛️', color: 'slate' },
  'etica_transparencia': { label: 'Ethics & Transparency', emoji: '🧠', color: 'violet' },
  'regulacion_general': { label: 'General Regulation', emoji: '📜', color: 'gray' },
  'violencia_genero': { label: 'Gender-Based Violence', emoji: '👩', color: 'fuchsia' },
  'transporte': { label: 'Transportation', emoji: '🚗', color: 'orange' },
  'servicios_financieros': { label: 'Financial Services', emoji: '💰', color: 'emerald' }
};

export default function LegislacionClientEn({ iniciativas }: Props) {
  // Overlay de traducción EN: se pide una vez y se mezcla por id sobre las
  // iniciativas (ES) recibidas por props. Si aún no cargó, aplicarOverlay
  // regresa los items sin cambios (fallback natural a ES).
  const [overlay, setOverlay] = useState<OverlayEn>({});
  useEffect(() => {
    fetchOverlayEn('iniciativas').then(setOverlay);
  }, []);
  const iniciativasEn = aplicarOverlay(iniciativas, overlay);

  const [filtroStatus, setFiltroStatus] = useState<IniciativaStatus | 'todos'>('todos');
  const [filtroLegislatura, setFiltroLegislatura] = useState<string>('todos');
  const [filtroCamara, setFiltroCamara] = useState<string>('todos');
  const [filtroTema, setFiltroTema] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const iniciativasFiltradas = iniciativasEn.filter(i => {
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

  // Function to normalize status for counting
  const normalizeStatus = (status: string | undefined): string => {
    const s = (status || '').toString().toLowerCase().trim();
    if (s.includes('aprobad') || s.includes('publicad') || s.includes('vigente')) return 'aprobada';
    if (s.includes('desechad') || s.includes('archivad')) return 'desechada';
    if (s.includes('rechazad')) return 'rechazada';
    if (s.includes('comision') || s.includes('turnad') || s.includes('pendiente') || s.includes('dictam')) return 'activa';
    return 'activa'; // Fallback: treat as active
  };

  const stats = {
    total: iniciativasEn.length,
    activas: iniciativasEn.filter(i => normalizeStatus(i.status) === 'activa').length,
    desechadas: iniciativasEn.filter(i => normalizeStatus(i.status) === 'desechada').length,
    aprobadas: iniciativasEn.filter(i => normalizeStatus(i.status) === 'aprobada').length
  };

  const getStatusBadge = (status: IniciativaStatus | string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'en_comisiones': { text: ESTATUS_INICIATIVA_EN.en_comisiones, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'en comisiones': { text: ESTATUS_INICIATIVA_EN.en_comisiones, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'desechada_termino': { text: ESTATUS_INICIATIVA_EN.desechada_termino, color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'desechada': { text: 'Discarded', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: ESTATUS_INICIATIVA_EN.archivada, color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'archivado': { text: 'Archived', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'aprobada': { text: ESTATUS_INICIATIVA_EN.aprobada, color: 'bg-green-100 text-green-700 border-green-200' },
      'aprobado': { text: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
      'aprobada en lo general': { text: 'Approved', color: 'bg-green-100 text-green-700 border-green-200' },
      'publicada': { text: ESTATUS_INICIATIVA_EN.publicada, color: 'bg-green-100 text-green-700 border-green-200' },
      'publicado': { text: 'Published', color: 'bg-green-100 text-green-700 border-green-200' },
      'vigente': { text: 'In force', color: 'bg-green-100 text-green-700 border-green-200' },
      'rechazada': { text: ESTATUS_INICIATIVA_EN.rechazada, color: 'bg-red-100 text-red-700 border-red-200' },
      'rechazado': { text: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
      'turnada': { text: ESTATUS_INICIATIVA_EN.turnada, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'turnado': { text: 'Referred', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'pendiente': { text: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Reported', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      'dictaminado': { text: 'Reported', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      'en dictamen': { text: 'Under committee review', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    };

    // Normalize status: lowercase and trim extra spaces
    const normalizedStatus = (status || '').toString().toLowerCase().trim();

    // Look for an exact match first
    if (badges[normalizedStatus]) {
      return badges[normalizedStatus];
    }

    // Look for a partial match for variants like "Aprobada por unanimidad"
    if (normalizedStatus.includes('aprobad')) {
      return { text: status?.toString() || 'Approved', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    if (normalizedStatus.includes('rechazad')) {
      return { text: status?.toString() || 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (normalizedStatus.includes('publicad') || normalizedStatus.includes('vigente')) {
      return { text: status?.toString() || 'Published', color: 'bg-green-100 text-green-700 border-green-200' };
    }
    if (normalizedStatus.includes('archivad') || normalizedStatus.includes('desechad')) {
      return { text: status?.toString() || 'Archived', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
    if (normalizedStatus.includes('dictam')) {
      return { text: status?.toString() || 'Reported', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    if (normalizedStatus.includes('turnad') || normalizedStatus.includes('pendiente')) {
      return { text: status?.toString() || 'Referred', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }

    // Fallback: blue for unknown states
    return { text: status?.toString() || 'In progress', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  const getCategoriaLabel = (categoria: CategoriaImpacto | string): string => {
    const labels: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'Intellectual Property',
      'responsabilidad': 'Liability',
      'etica': 'Ethics',
      'ciberseguridad': 'Cybersecurity',
      'seguridad_nacional': 'National Security',
      'justicia': 'Justice',
      'educacion': 'Education',
      'salud': 'Health',
      'privacidad': 'Privacy',
      'derechos_autor': 'Copyright',
      'violencia_genero': 'Gender-Based Violence',
      'transparencia': 'Transparency',
      'trabajo': 'Labor',
      'economia': 'Economy'
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDate = formatFecha; // Alias for consistency

  const getTipoLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      'ley_federal': 'Federal Law',
      'reforma_codigo_penal': 'Criminal Code Reform',
      'reforma_constitucional': 'Constitutional Reform',
      'reforma_educacion': 'Education Reform',
      'reforma_salud': 'Health Reform',
      'reforma_violencia_mujer': 'Reform on Violence Against Women',
      'reforma_telecomunicaciones': 'Telecommunications Reform',
      'reforma_otra': 'Other Reform'
    };
    return labels[tipo] || tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCamaraLabel = (camara: string): string => {
    const labels: Record<string, string> = {
      'diputados': 'Chamber of Deputies',
      'senadores': 'Senate',
      'congreso_cdmx': 'Mexico City Congress'
    };
    return labels[camara] || camara;
  };

  const getStatusLabel = (status: IniciativaStatus): string => {
    return getStatusBadge(status).text;
  };

  if (iniciativasEn.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif-display font-light text-gray-900 mb-2">
            Database being prepared
          </h2>
          <p className="text-gray-600 font-sans-tech">
            We are importing the documented legislative bills.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Observatorio style */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[80px]"></div>
        </div>

        {/* Nav: provided by the global Header (layout). Inline nav removed to avoid duplication. */}

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-16">
          {/* Badge */}
          <div className="w-fit mb-6">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-100 border border-gray-300/10 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </div>
              <span className="font-sans-tech text-xs uppercase tracking-widest text-gray-600/80">
                Legislative Monitoring · {stats.total} Bills
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-light leading-[0.95] tracking-tight mb-6">
            <span className="text-gray-900/90">Legislation</span>{' '}
            <span className="italic text-blue-500">on AI</span>
          </h1>

          <p className="font-sans-tech text-lg md:text-xl text-gray-900/60 max-w-2xl leading-relaxed border-l border-blue-500/30 pl-6">
            Automated tracking of bills, committee rulings and laws related to artificial intelligence in Mexico.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-gray-900 group-hover:text-blue-500 transition-colors">{stats.total}</div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Bills</div>
            </div>
            <div className="group bg-blue-50 border border-blue-200/30 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-blue-600 group-hover:text-blue-700 transition-colors">{stats.activas}</div>
              <div className="font-sans-tech text-xs text-blue-600/60 uppercase tracking-widest mt-1">Active</div>
            </div>
            <div className="group bg-gray-100 border border-gray-300/10 rounded-xl p-4 hover:border-gray-400/30 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-gray-600 group-hover:text-gray-700 transition-colors">{stats.desechadas}</div>
              <div className="font-sans-tech text-xs text-gray-900/40 uppercase tracking-widest mt-1">Discarded</div>
            </div>
            <div className="group bg-emerald-50 border border-emerald-200/30 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-default">
              <div className="font-serif-display text-3xl md:text-4xl text-emerald-600 group-hover:text-emerald-700 transition-colors">{stats.aprobadas}</div>
              <div className="font-sans-tech text-xs text-emerald-600/60 uppercase tracking-widest mt-1">Approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-gray-50 border-b border-gray-200/50 py-4 md:py-6">
        <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24">
          {/* Search first on mobile */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Search bills..."
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
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300/20 rounded-lg hover:bg-white hover:border-blue-500/30 transition-all font-sans-tech whitespace-nowrap"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters in a responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            <div>
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Chamber</label>
              <select
                value={filtroCamara}
                onChange={(e) => setFiltroCamara(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                <option value="Diputados">Chamber of Deputies</option>
                <option value="Senado">Senate</option>
                <option value="Local">State Legislature</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as IniciativaStatus | 'todos')}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                <option value="en_comisiones">{ESTATUS_INICIATIVA_EN.en_comisiones}</option>
                <option value="turnada">{ESTATUS_INICIATIVA_EN.turnada}</option>
                <option value="archivada">{ESTATUS_INICIATIVA_EN.archivada}</option>
                <option value="desechada_termino">{ESTATUS_INICIATIVA_EN.desechada_termino}</option>
                <option value="aprobada">{ESTATUS_INICIATIVA_EN.aprobada}</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Legislature</label>
              <select
                value={filtroLegislatura}
                onChange={(e) => setFiltroLegislatura(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                <option value="LXVI">LXVI (current)</option>
                <option value="LXV">LXV</option>
                <option value="LXIV">LXIV</option>
                <option value="III_CDMX">CDMX III</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Topic</label>
              <select
                value={filtroTema}
                onChange={(e) => setFiltroTema(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                <option value="Regulación General">Regulation</option>
                <option value="Seguridad y Delitos">Security</option>
                <option value="Privacidad y Datos">Privacy</option>
                <option value="Deepfakes y Contenido">Deepfakes</option>
                <option value="Propiedad Intelectual">IP</option>
                <option value="Salud">Health</option>
                <option value="Laboral">Labor</option>
                <option value="Educación">Education</option>
                <option value="Sector Público">Public Sector</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">State</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                <option value="Federal">Federal</option>
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
              <label className="block text-[11px] font-sans-tech font-medium text-gray-900/50 mb-1 uppercase tracking-wider">Category</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300/20 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-sans-tech"
              >
                <option value="todos">All</option>
                {Object.entries(CATEGORIAS_TEMA_EN).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* List of bills */}
      <section className="py-6 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="font-serif-display text-xl md:text-3xl font-light text-gray-900">
              Documented <span className="italic text-blue-500">bills</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {iniciativasFiltradas.length} of {iniciativasEn.length}
            </span>
          </div>

          {/* Mobile view: Cards */}
          <div className="md:hidden space-y-3">
            {iniciativasFiltradas.map((iniciativa) => {
              const badge = getStatusBadge(iniciativa.status);
              const isExpanded = expandedId === iniciativa.id;

              return (
                <div
                  key={iniciativa.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Card header - always visible */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : iniciativa.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <FolioBadge folio={iniciativa.folio} size="sm" locale="en" />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-sans-tech border ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {iniciativa.estadoVerificacion === 'verificado' && (
                          <ShieldCheck size={14} className="text-emerald-500" />
                        )}
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>

                    <h3 className="text-sm font-sans-tech font-medium text-gray-900 leading-snug mb-2">
                      {iniciativa.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="font-mono">{formatFecha(iniciativa.fecha)}</span>
                      <span>·</span>
                      <span>{iniciativa.camara}</span>
                      <span>·</span>
                      <span>{iniciativa.legislatura}</span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[11px] font-sans-tech font-medium text-gray-400 uppercase">Sponsor</span>
                          <p className="text-sm text-gray-900">{iniciativa.proponente}</p>
                          {iniciativa.partido && <p className="text-xs text-gray-500">{iniciativa.partido}</p>}
                        </div>

                        {iniciativa.descripcion && (
                          <div>
                            <span className="text-[11px] font-sans-tech font-medium text-gray-400 uppercase">Description</span>
                            <p className="text-sm text-gray-600 leading-relaxed">{iniciativa.descripcion}</p>
                          </div>
                        )}

                        {iniciativa.estadoVerificacion === 'verificado' && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200/50 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span className="font-sans-tech text-xs text-emerald-700">Automated verification (AI)</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link
                            href={`/en/legislacion/${iniciativa.id}`}
                            className="flex-1 text-center px-3 py-2 bg-blue-600 text-white font-sans-tech text-xs uppercase tracking-wider rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View details
                          </Link>
                          {iniciativa.urlPDF && (
                            <a
                              href={iniciativa.urlPDF}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 border border-gray-300 text-gray-700 font-sans-tech text-xs uppercase tracking-wider rounded-lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop view: Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200/50">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200/50">
                <tr>
                  <th className="w-8 px-2 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Bill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Sponsor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-sans-tech font-medium text-gray-900/50 uppercase tracking-wider">
                    Legislature
                  </th>
                </tr>
              </thead>
              <tbody>
                {iniciativasFiltradas.map((iniciativa, index) => {
                  const badge = getStatusBadge(iniciativa.status);
                  const isExpanded = expandedId === iniciativa.id;

                  return (
                    <Fragment key={iniciativa.id}>
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
                          <FolioBadge folio={iniciativa.folio} size="sm" className="mb-1" locale="en" />
                          <div className="flex items-start gap-2">
                            <div className="text-gray-900 font-sans-tech font-medium flex-1 text-sm">
                              {iniciativa.titulo}
                            </div>
                            {iniciativa.estadoVerificacion === 'verificado' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                <ShieldCheck size={12} />
                                Verified
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
                              {/* Side color bar */}
                              <div className="w-1 bg-blue-500"></div>

                              <div className="p-6 w-full pl-14">
                                {/* Topic category */}
                                {(iniciativa as any).categoriaTema && CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema] && (
                                  <div className="mb-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-sans-tech font-medium bg-${CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema].color}-100 text-${CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema].color}-700 border border-${CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema].color}-200`}>
                                      {CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema].emoji} {CATEGORIAS_TEMA_EN[(iniciativa as any).categoriaTema as CategoriaTema].label}
                                    </span>
                                  </div>
                                )}

                                {/* Key metadata */}
                                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Type</span>
                                    <span className="text-gray-900 font-sans-tech">{getTipoLabel(iniciativa.tipo)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Chamber</span>
                                    <span className="text-gray-900 font-sans-tech">{getCamaraLabel(iniciativa.camara)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Date</span>
                                    <span className="text-gray-900 font-mono">{formatDate(iniciativa.fecha)}</span>
                                  </div>
                                  <div>
                                    <span className="block text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-1">Status</span>
                                    <span className="text-gray-900 font-sans-tech">{getStatusLabel(iniciativa.status)}</span>
                                  </div>
                                </div>

                                {/* Description */}
                                {iniciativa.descripcion && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-gray-600 font-sans-tech leading-relaxed max-w-4xl">
                                      {iniciativa.descripcion}
                                    </p>
                                  </div>
                                )}

                                {/* Summary */}
                                {iniciativa.resumen && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Summary of the proposal</h4>
                                    <p className="text-gray-600 font-sans-tech leading-relaxed max-w-4xl">
                                      {iniciativa.resumen}
                                    </p>
                                  </div>
                                )}

                                {/* Impact categories */}
                                {iniciativa.categoriasImpacto && iniciativa.categoriasImpacto.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-2">Impact categories</h4>
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

                                {/* AI verification */}
                                {iniciativa.estadoVerificacion === 'verificado' && (
                                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                      <span className="font-sans-tech font-medium text-emerald-800 text-sm">{dict('en').common.verificacionAutomatizada}</span>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-mono">
                                      Model: Claude Sonnet 4 (Anthropic)
                                      {iniciativa.fechaVerificacion && (
                                        <span className="ml-2">
                                          • {new Date(iniciativa.fechaVerificacion).toLocaleDateString('en-US', {
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

                                {/* Links */}
                                <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200/50">
                                  <Link
                                    href={`/en/legislacion/${iniciativa.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-sans-tech text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View details
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
                                      Official PDF
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
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer info */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-6 pt-4 border-t border-gray-200/50 text-xs font-sans-tech text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Data updated automatically</span>
            </div>
            <span className="font-mono text-blue-500/50">Powered by Citizen Agents</span>
          </div>
        </div>
      </section>
    </div>
  );
}
