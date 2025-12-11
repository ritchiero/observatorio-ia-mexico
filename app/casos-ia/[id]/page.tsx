'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, ArrowLeft, FileText, Calendar, Building, Scale, AlertCircle, ExternalLink } from 'lucide-react';

interface CasoIA {
  id: string;
  nombre: string;
  tribunal: string;
  materia: string;
  temaIA: string;
  partes: {
    actor?: string;
    demandado?: string;
  };
  resumen: string;
  fechaInicio: string;
  fechaResolucion?: string;
  estado: 'en_proceso' | 'resuelto' | 'apelacion';
  resolucion?: string;
  relevancia: string;
  antecedentes?: string;
  hechos?: string;
  argumentos?: string;
  impacto?: string;
  documentos?: Array<{
    titulo: string;
    url: string;
    tipo: string;
  }>;
  fuentes?: Array<{
    titulo: string;
    url: string;
    medio?: string;
  }>;
}

export default function CasoDetallePage() {
  const params = useParams();
  const [caso, setCaso] = useState<CasoIA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCaso() {
      try {
        const response = await fetch(`/api/casos-ia/${params.id}`);
        const data = await response.json();
        if (data.success && data.caso) {
          setCaso(data.caso);
        } else {
          setError('Caso no encontrado');
        }
      } catch (err) {
        console.error('Error fetching caso:', err);
        setError('Error al cargar el caso');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchCaso();
    }
  }, [params.id]);

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'en_proceso': { text: 'En proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'resuelto': { text: 'Resuelto', color: 'bg-green-100 text-green-700 border-green-200' },
      'apelacion': { text: 'En apelación', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    };
    return badges[estado] || { text: estado, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getTemaLabel = (tema: string) => {
    const labels: Record<string, string> = {
      'jurimetria': '📊 Jurimetría',
      'deepfakes': '🎭 Deepfakes',
      'algoritmos': '🤖 Algoritmos',
      'propiedad_intelectual': '©️ Propiedad Intelectual',
      'discriminacion': '⚖️ Discriminación Algorítmica',
      'privacidad': '🔒 Privacidad',
    };
    return labels[tema] || tema;
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-sans-tech">Cargando caso...</p>
        </div>
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif-display font-light text-gray-900 mb-2">
            {error || 'Caso no encontrado'}
          </h2>
          <Link 
            href="/casos-ia"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-sans-tech mt-4"
          >
            <ArrowLeft size={16} />
            Volver a casos
          </Link>
        </div>
      </div>
    );
  }

  const estadoBadge = getEstadoBadge(caso.estado);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-white border-b border-gray-200/50 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px]"></div>
        </div>
        
        {/* NAV */}
        <nav className="relative z-10 flex justify-between items-center px-4 md:px-12 lg:px-24 py-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 border border-gray-300/20 flex items-center justify-center rounded-sm overflow-hidden group-hover:border-purple-500/50 transition-colors">
              <Eye size={16} className="text-gray-900/80 group-hover:text-purple-500 transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans-tech text-xs tracking-[0.2em] text-gray-900/60 uppercase">Observatorio</span>
              <span className="font-serif-display text-lg leading-none text-gray-900 font-bold">IA México</span>
            </div>
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-8 md:py-12">
          {/* Breadcrumb */}
          <Link 
            href="/casos-ia"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-sans-tech text-sm mb-6"
          >
            <ArrowLeft size={16} />
            Volver a casos
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-sans-tech border ${estadoBadge.color}`}>
              {estadoBadge.text}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-sans-tech bg-purple-100 text-purple-700">
              {getTemaLabel(caso.temaIA)}
            </span>
          </div>

          {/* Título */}
          <h1 className="font-serif-display text-3xl md:text-5xl font-light leading-tight tracking-tight mb-4 text-gray-900">
            {caso.nombre}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-sans-tech">
            <span className="flex items-center gap-1.5">
              <Building size={14} />
              {caso.tribunal}
            </span>
            <span className="flex items-center gap-1.5">
              <Scale size={14} />
              {caso.materia}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatFecha(caso.fechaInicio)}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-8">
            {/* Resumen */}
            <section>
              <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Resumen</h2>
              <p className="text-gray-700 font-sans-tech leading-relaxed text-lg">
                {caso.resumen}
              </p>
            </section>

            {/* Antecedentes */}
            {caso.antecedentes && (
              <section>
                <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Antecedentes</h2>
                <p className="text-gray-600 font-sans-tech leading-relaxed">
                  {caso.antecedentes}
                </p>
              </section>
            )}

            {/* Hechos */}
            {caso.hechos && (
              <section>
                <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Hechos</h2>
                <p className="text-gray-600 font-sans-tech leading-relaxed">
                  {caso.hechos}
                </p>
              </section>
            )}

            {/* Argumentos */}
            {caso.argumentos && (
              <section>
                <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Argumentos jurídicos</h2>
                <p className="text-gray-600 font-sans-tech leading-relaxed">
                  {caso.argumentos}
                </p>
              </section>
            )}

            {/* Resolución */}
            {caso.resolucion && (
              <section>
                <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Resolución</h2>
                <div className="p-4 bg-green-50 border border-green-200/50 rounded-lg">
                  <p className="text-green-900 font-sans-tech leading-relaxed">
                    {caso.resolucion}
                  </p>
                </div>
              </section>
            )}

            {/* Relevancia */}
            <section>
              <h2 className="text-xs font-sans-tech font-medium text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle size={14} />
                Por qué es relevante
              </h2>
              <div className="p-4 bg-purple-50 border border-purple-200/50 rounded-lg">
                <p className="text-purple-900 font-sans-tech leading-relaxed">
                  {caso.relevancia}
                </p>
              </div>
            </section>

            {/* Impacto */}
            {caso.impacto && (
              <section>
                <h2 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Impacto y precedente</h2>
                <p className="text-gray-600 font-sans-tech leading-relaxed">
                  {caso.impacto}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partes */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Partes</h3>
              <div className="space-y-3">
                {caso.partes.actor && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Actor</p>
                    <p className="text-gray-900 font-sans-tech text-sm">{caso.partes.actor}</p>
                  </div>
                )}
                {caso.partes.demandado && (
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Demandado</p>
                    <p className="text-gray-900 font-sans-tech text-sm">{caso.partes.demandado}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Cronología</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Inicio</span>
                  <span className="text-gray-900 font-mono">{formatFecha(caso.fechaInicio)}</span>
                </div>
                {caso.fechaResolucion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolución</span>
                    <span className="text-gray-900 font-mono">{formatFecha(caso.fechaResolucion)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Documentos */}
            {caso.documentos && caso.documentos.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Documentos</h3>
                <div className="space-y-2">
                  {caso.documentos.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-colors"
                    >
                      <FileText size={14} />
                      <span className="flex-1 truncate">{doc.titulo}</span>
                      <ExternalLink size={12} className="text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Fuentes */}
            {caso.fuentes && caso.fuentes.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-xs font-sans-tech font-medium text-gray-400 uppercase tracking-wider mb-3">Fuentes</h3>
                <div className="space-y-2">
                  {caso.fuentes.map((fuente, idx) => (
                    <a
                      key={idx}
                      href={fuente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-purple-300 transition-colors"
                    >
                      <p className="text-gray-900 font-sans-tech truncate">{fuente.titulo}</p>
                      {fuente.medio && <p className="text-xs text-gray-400">{fuente.medio}</p>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-8 border-t border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-sans-tech text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Caso documentado con verificación de fuentes oficiales</span>
          </div>
          <span className="font-mono text-purple-500/50">Powered by Citizen Agents</span>
        </div>
      </div>
    </div>
  );
}
