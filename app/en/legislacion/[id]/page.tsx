'use client';

// Twin en inglés de app/legislacion/[id]/page.tsx — misma estructura JSX, mismos
// hooks/clases Tailwind; solo cambia el texto visible y las fuentes de traducción
// (overlay 'iniciativas' + 'eventos-iniciativa' vía /api/i18n, ESTATUS_INICIATIVA_EN,
// TEMATICA_EN, dict('en')). Los campos de datos sin overlay (fuente.tipo, analisis,
// evento.resultado) se quedan en español como fallback — igual que el original.

import { useEffect, useState } from 'react';
import { IniciativaStatus } from '@/types';
import NivelConfianzaBadgeEn from '@/components/NivelConfianzaBadgeEn';
import FolioBadge from '@/components/FolioBadge';
import { ESTATUS_INICIATIVA_EN, tematicaEn } from '@/lib/i18n/labels-en';
import { fetchOverlayEn, aplicarOverlayDoc, type OverlayEn } from '@/lib/i18n/client';
import { dict } from '@/lib/i18n/dictionary';
import { ArrowLeft, Scale, Calendar, User, Building, FileText, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';


// Type for the API response (date as ISO string)
interface IniciativaAPI {
  id: string;
  folio?: string; // Case file number (LEG-YYYY-NNN)
  numero: number;
  titulo: string;
  proponente: string;
  partido: string;
  fecha: string; // ISO string, not a Timestamp
  legislatura: string;
  camara: string;
  descripcion: string;
  status: IniciativaStatus;
  tipo: string;
  tematicas?: string[];
  urlGaceta: string;
  urlPDF?: string;
  articuloSlug?: string;
  resumenAgente?: string;
  eventos?: Array<{
    fecha: string; // ISO string
    tipo: string;
    descripcion: string;
    resultado?: string;
  }>;
  fuentes?: Array<{
    titulo: string;
    url: string;
    tipo: string;
  }>;
  // AI verification
  estadoVerificacion?: 'verificado' | 'revision' | 'pendiente';
  fechaVerificacion?: string;
  // Editorial analysis from the Observatory (optional)
  analisis?: {
    titulo?: string;
    cuerpo: string;
    fuente?: { autor?: string; titulo?: string; publicacion?: string; url: string };
  };
}

// Shape of the 'eventos-iniciativa' overlay entry: a positional list of
// translated event descriptions (same order/length as iniciativa.eventos),
// keyed by iniciativa id — not by a per-event id, since events don't have one.
interface EventosIniciativaOverlayEntry {
  eventos?: string[];
}

function traducirEventos(
  eventos: IniciativaAPI['eventos'],
  overlay: OverlayEn,
  iniciativaId: string
): IniciativaAPI['eventos'] {
  if (!eventos || eventos.length === 0) return eventos;
  const traducciones = (overlay[iniciativaId] as EventosIniciativaOverlayEntry | undefined)?.eventos;
  if (!traducciones) return eventos;
  return eventos.map((evento, idx) => ({
    ...evento,
    descripcion: traducciones[idx] ?? evento.descripcion,
  }));
}

// English labels for the small, known set of legislative event types seen in
// production data. Unknown types fall back to the raw code (underscores
// replaced by spaces), same graceful degradation as the Spanish original.
const EVENTO_TIPO_EN: Record<string, string> = {
  presentacion: 'Introduction',
  turno: 'Referral',
  dictamen: 'Committee report',
  aprobacion: 'Approval',
  inicio_proceso: 'Process initiated',
  impugnacion: 'Legal challenge',
  validacion_scjn: 'SCJN validation',
};

export default function IniciativaDetallePageEn() {
  const params = useParams();
  const [iniciativa, setIniciativa] = useState<IniciativaAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIniciativa = async () => {
      if (!params.id) return;
      const id = params.id as string;

      try {
        const [response, overlayIniciativas, overlayEventos] = await Promise.all([
          fetch(`/api/iniciativas/${id}`),
          fetchOverlayEn('iniciativas'),
          fetchOverlayEn('eventos-iniciativa'),
        ]);

        if (!response.ok) {
          throw new Error('Bill not found');
        }

        const data = await response.json();
        const base: IniciativaAPI = data.iniciativa;
        const traducida = aplicarOverlayDoc<IniciativaAPI>(base, overlayIniciativas, id);

        setIniciativa({
          ...traducida,
          eventos: traducirEventos(base.eventos, overlayEventos, id),
        });
      } catch (error) {
        console.error('Error fetching iniciativa:', error);
        setError(error instanceof Error ? error.message : 'Error loading the bill');
      } finally {
        setLoading(false);
      }
    };

    fetchIniciativa();
  }, [params.id]);

  const getStatusBadge = (status: IniciativaStatus | string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'en_comisiones': { text: ESTATUS_INICIATIVA_EN.en_comisiones, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'en_comision': { text: ESTATUS_INICIATIVA_EN.en_comisiones, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'turnada': { text: ESTATUS_INICIATIVA_EN.turnada, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Reported out of committee', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      'presentada': { text: ESTATUS_INICIATIVA_EN.presentada, color: 'bg-sky-100 text-sky-700 border-sky-200' },
      'presentado': { text: ESTATUS_INICIATIVA_EN.presentado, color: 'bg-sky-100 text-sky-700 border-sky-200' },
      'recibida': { text: ESTATUS_INICIATIVA_EN.recibida, color: 'bg-sky-100 text-sky-700 border-sky-200' },
      'en_elaboracion': { text: ESTATUS_INICIATIVA_EN.en_elaboracion, color: 'bg-slate-100 text-slate-700 border-slate-200' },
      'en_preparacion': { text: 'In preparation', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      'en_proceso': { text: ESTATUS_INICIATIVA_EN.en_proceso, color: 'bg-slate-100 text-slate-700 border-slate-200' },
      'en_discusion': { text: ESTATUS_INICIATIVA_EN.en_discusion, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'aprobada': { text: ESTATUS_INICIATIVA_EN.aprobada, color: 'bg-green-100 text-green-700 border-green-200' },
      'aprobada_camara': { text: 'Approved by chamber', color: 'bg-green-100 text-green-700 border-green-200' },
      'publicada': { text: `${ESTATUS_INICIATIVA_EN.publicada} · in force`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'vigente': { text: 'In force', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'rechazada': { text: ESTATUS_INICIATIVA_EN.rechazada, color: 'bg-red-100 text-red-700 border-red-200' },
      'desechada_termino': { text: ESTATUS_INICIATIVA_EN.desechada_termino, color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'desechada': { text: 'Discarded', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: ESTATUS_INICIATIVA_EN.archivada, color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'retirada': { text: 'Withdrawn', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    };
    const norm = (status || '').toString().toLowerCase().trim();
    // Neutral fallback: shows the raw status in gray instead of mislabeling it
    // as "In committee" (which made published laws look like they were still
    // in process).
    return badges[norm] || { text: norm ? norm.replace(/_/g, ' ') : 'In progress', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const formatFecha = (fechaISO: string) => {
    const date = new Date(fechaISO);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'ley_federal': 'Federal AI Law',
      'reforma_constitucional': 'Constitutional Reform',
      'reforma_codigo_penal': 'Reform to the Código Penal Federal (Federal Criminal Code)',
      'reforma_educacion': 'Reform to the Ley de Educación (Education Law)',
      'reforma_salud': 'Reform to the Ley de Salud (Health Law)',
      'reforma_derechos_autor': 'Reform to the Ley de Derechos de Autor (Copyright Law)',
      'reforma_violencia_mujer': 'Reform to the Ley de Violencia contra la Mujer (Law on Violence Against Women)',
      'reforma_trabajo': 'Reform to the Ley Federal del Trabajo (Federal Labor Law)',
      'reforma_telecomunicaciones': 'Reform to the Ley de Telecomunicaciones (Telecommunications Law)',
      'reforma_otra': 'Reform to another law'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading bill...</div>
      </div>
    );
  }

  if (error || !iniciativa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Bill not found'}</p>
          <Link href="/en/legislacion" className="text-blue-500 hover:underline mt-2 inline-block">
            Back to the list
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
            href="/en/legislacion"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to the list
          </Link>

          {/* Number badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-sm mb-4">
            <Scale className="w-4 h-4 text-gray-600" />
            <span className="font-mono text-sm text-gray-600">Bill #{iniciativa.numero}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
            {iniciativa.titulo}
          </h1>

          {/* Status badge */}
          <div className="mb-6 flex flex-wrap gap-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-sm text-sm font-sans border ${badge.color}`}>
              {badge.text}
            </span>
            <NivelConfianzaBadgeEn item={iniciativa} size="md" />
            <FolioBadge folio={iniciativa.folio} locale="en" />
            {iniciativa.estadoVerificacion === 'verificado' && (
              // OIA-007: verification was automated; no human audit is announced
              // until an identifiable reviewer exists in the record.
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-sans border bg-sky-50 text-sky-700 border-sky-200">
                <ShieldCheck size={16} />
                {dict('en').common.verificacionAutomatizada}
              </span>
            )}
          </div>

          {/* AI Verification - Detail */}
          {iniciativa.estadoVerificacion === 'verificado' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-sans font-bold text-emerald-800">Automated verification — pending human review</span>
              </div>
              <p className="text-sm text-emerald-700">
                This record was verified in an <strong>automated</strong> way using <strong>Claude Sonnet 4</strong> (Anthropic),
                cross-checked against official Mexican government sources. Human review will be noted
                here once an identifiable reviewer and date exist in the record.
              </p>
              {iniciativa.fechaVerificacion && (
                <p className="text-xs text-emerald-600 mt-2 font-mono">
                  Last verified: {new Date(iniciativa.fechaVerificacion).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-sm">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Sponsor
                </div>
                <div className="text-sm text-gray-900">{iniciativa.proponente}</div>
                <div className="text-xs text-gray-600">{iniciativa.partido}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Date introduced
                </div>
                <div className="text-sm text-gray-900">{formatFecha(iniciativa.fecha)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Legislature
                </div>
                <div className="text-sm text-gray-900">{iniciativa.legislatura}</div>
                <div className="text-xs text-gray-600 capitalize">{iniciativa.camara.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-sans uppercase tracking-wider text-gray-500 mb-1">
                  Type
                </div>
                <div className="text-sm text-gray-900">{getTipoLabel(iniciativa.tipo)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">Description</h2>
          <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-line">
            {iniciativa.descripcion}
          </p>
        </div>

        {/* Link to the archive record (verified summary + copy of the document) */}
        {iniciativa.articuloSlug && (
          <Link
            href={`/en/hemeroteca/${iniciativa.articuloSlug}`}
            className="flex items-center gap-3 bg-cyan-50 border border-cyan-200 rounded-sm p-4 hover:border-cyan-400 transition-colors"
          >
            <FileText className="w-5 h-5 text-cyan-700 flex-shrink-0" />
            <span className="font-sans text-sm text-cyan-900">
              Read the verified summary and download the original document in the Archive →
            </span>
          </Link>
        )}

        {/* Analysis · Consequences (Observatory editorial) */}
        {iniciativa.analisis && (
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <Scale className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <h2 className="font-serif text-2xl text-gray-900">
                {iniciativa.analisis.titulo || 'Analysis · Consequences'}
              </h2>
            </div>
            <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-line">
              {iniciativa.analisis.cuerpo}
            </p>
            {iniciativa.analisis.fuente?.url && (
              <a
                href={iniciativa.analisis.fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-start gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium"
              >
                <ExternalLink size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  In-depth analysis
                  {iniciativa.analisis.fuente.autor ? `: ${iniciativa.analisis.fuente.autor}` : ''}
                  {iniciativa.analisis.fuente.titulo ? `, “${iniciativa.analisis.fuente.titulo}”` : ''}
                  {iniciativa.analisis.fuente.publicacion ? ` — ${iniciativa.analisis.fuente.publicacion}` : ''}
                </span>
              </a>
            )}
          </div>
        )}

        {/* Topics */}
        {iniciativa.tematicas && iniciativa.tematicas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {iniciativa.tematicas.map((tematica, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-sm font-sans"
                >
                  {tematicaEn(tematica)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent summary */}
        {iniciativa.resumenAgente && (
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">🤖</span>
              <h2 className="font-serif text-xl text-gray-900">Agent Summary</h2>
            </div>
            <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-line">
              {iniciativa.resumenAgente}
            </p>
          </div>
        )}

        {/* Event timeline */}
        {iniciativa.eventos && iniciativa.eventos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="font-serif text-2xl text-gray-900 mb-6">Legislative Timeline</h2>
            <div className="space-y-4">
              {iniciativa.eventos.map((evento, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-shrink-0 w-24 font-mono text-sm text-gray-500">
                    {formatFecha(evento.fecha)}
                  </div>
                  <div className="flex-1">
                    <div className="font-sans text-sm font-semibold text-gray-900 mb-1 capitalize">
                      {EVENTO_TIPO_EN[evento.tipo] || (evento.tipo || 'event').replace('_', ' ')}
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

        {/* Sources */}
        {iniciativa.fuentes && iniciativa.fuentes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="font-serif text-2xl text-gray-900 mb-4">Sources</h2>
            <div className="space-y-3">
              {iniciativa.fuentes.map((fuente, index) => (
                <a
                  key={index}
                  href={fuente.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-sans text-sm">{fuente.titulo || fuente.url}</span>
                    {fuente.tipo && <span className="text-xs text-gray-500 ml-2">({fuente.tipo})</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Official Links */}
        <div className="bg-white border border-gray-200 rounded-sm p-6">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">Official Links</h2>
          <div className="space-y-3">
            <a
              href={iniciativa.urlGaceta}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <ExternalLink size={16} />
              <span className="font-sans text-sm">View in the Gaceta Parlamentaria (Parliamentary Gazette)</span>
            </a>
            {iniciativa.urlPDF && (
              <a
                href={iniciativa.urlPDF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={16} />
                <span className="font-sans text-sm">Download PDF</span>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
