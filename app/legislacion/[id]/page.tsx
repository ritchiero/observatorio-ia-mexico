'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IniciativaLegislativa, IniciativaStatus } from '@/types';
import { ArrowLeft, Scale, Calendar, User, Building, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FuentesList } from '@/components/FuentesList';

export default function IniciativaDetallePage() {
  const params = useParams();
  const [iniciativa, setIniciativa] = useState<IniciativaLegislativa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIniciativa = async () => {
      if (!params.id) return;
      
      try {
        const docRef = doc(db, 'iniciativas', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setIniciativa({
            id: docSnap.id,
            ...docSnap.data()
          } as IniciativaLegislativa);
        }
      } catch (error) {
        console.error('Error fetching iniciativa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIniciativa();
  }, [params.id]);

  const getStatusBadge = (status: IniciativaStatus) => {
    const badges = {
      'en_comisiones': { text: 'En comisiones', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'desechada_termino': { text: 'Desechada por término de legislatura', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: 'Archivada', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'aprobada': { text: 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' },
      'rechazada': { text: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
      'turnada': { text: 'Turnada a comisión', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Dictaminada', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    };
    return badges[status] || badges['en_comisiones'];
  };

  const formatFecha = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ley_federal': 'Ley Federal de IA',
      'reforma_constitucional': 'Reforma Constitucional',
      'reforma_codigo_penal': 'Reforma al Código Penal Federal',
      'reforma_educacion': 'Reforma a Ley de Educación',
      'reforma_salud': 'Reforma a Ley de Salud',
      'reforma_derechos_autor': 'Reforma a Ley de Derechos de Autor',
      'reforma_violencia_mujer': 'Reforma a Ley de Violencia contra la Mujer',
      'reforma_trabajo': 'Reforma a Ley Federal del Trabajo',
      'reforma_telecomunicaciones': 'Reforma a Ley de Telecomunicaciones',
      'reforma_otra': 'Reforma a otra ley'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando iniciativa...</div>
      </div>
    );
  }

  if (!iniciativa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Iniciativa no encontrada</p>
          <Link href="/legislacion" className="text-blue-500 hover:underline mt-2 inline-block">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(iniciativa.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Back button */}
          <Link
            href="/legislacion"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Volver al listado
          </Link>

          {/* Badge de número */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-sm mb-4">
            <Scale className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-sm text-gray-600">Iniciativa #{iniciativa.numero}</span>
          </div>

          {/* Título */}
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
            {iniciativa.titulo}
          </h1>

          {/* Status badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-4 py-2 rounded-sm text-sm font-sans border ${badge.color}`}>
              {badge.text}
            </span>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Proponente
                </div>
                <div className="text-sm text-gray-900">{iniciativa.proponente}</div>
                <div className="text-xs text-gray-600">{iniciativa.partido}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Fecha de presentación
                </div>
                <div className="text-sm text-gray-900">{formatFecha(iniciativa.fecha)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Legislatura
                </div>
                <div className="text-sm text-gray-900">{iniciativa.legislatura}</div>
                <div className="text-xs text-gray-600 capitalize">{iniciativa.camara.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Tipo
                </div>
                <div className="text-sm text-gray-900">{getTipoLabel(iniciativa.tipo)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Descripción */}
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">Descripción</h2>
          <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-line">
            {iniciativa.descripcion}
          </p>
        </div>

        {/* Temáticas */}
        {iniciativa.tematicas && iniciativa.tematicas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Temáticas</h2>
            <div className="flex flex-wrap gap-2">
              {iniciativa.tematicas.map((tematica, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-sm font-sans"
                >
                  {tematica}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resumen del agente */}
        {iniciativa.resumenAgente && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">🤖</span>
              <h2 className="font-serif text-xl text-gray-900">Resumen del Agente</h2>
            </div>
            <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-line">
              {iniciativa.resumenAgente}
            </p>
          </div>
        )}

        {/* Timeline de eventos */}
        {iniciativa.eventos && iniciativa.eventos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="font-serif text-2xl text-gray-900 mb-6">Timeline Legislativo</h2>
            <div className="space-y-4">
              {iniciativa.eventos.map((evento, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0 w-24 font-mono text-sm text-gray-500">
                    {formatFecha(evento.fecha)}
                  </div>
                  <div className="flex-1">
                    <div className="font-sans text-sm font-semibold text-gray-900 mb-1 capitalize">
                      {evento.tipo.replace('_', ' ')}
                    </div>
                    <p className="font-sans text-sm text-gray-700">{evento.descripcion}</p>
                    {evento.resultado && (
                      <p className="font-sans text-sm text-gray-600 mt-1 italic">{evento.resultado}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fuentes */}
        {iniciativa.fuentes && iniciativa.fuentes.length > 0 && (
          <FuentesList fuentes={iniciativa.fuentes} />
        )}

        {/* Enlaces oficiales */}
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">Enlaces Oficiales</h2>
          <div className="space-y-3">
            <a
              href={iniciativa.urlGaceta}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ExternalLink size={16} />
              <span className="font-sans text-sm">Ver en Gaceta Parlamentaria</span>
            </a>
            {iniciativa.urlPDF && (
              <a
                href={iniciativa.urlPDF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={16} />
                <span className="font-sans text-sm">Descargar PDF</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
