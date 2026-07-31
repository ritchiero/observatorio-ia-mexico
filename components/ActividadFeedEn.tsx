import Link from 'next/link';
import { ActividadLog } from '@/types';
import { STATUS_ANUNCIO_EN } from '@/lib/i18n/labels-en';
import {
  PlusCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CpuChipIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface ActividadFeedEnProps {
  actividad: ActividadLog[];
}

const tipoIconos: Record<string, React.ComponentType<{ className?: string }>> = {
  nuevo_anuncio: PlusCircleIcon,
  cambio_status: ArrowPathIcon,
  actualizacion: DocumentTextIcon,
  agente_ejecutado: CpuChipIcon,
  anuncio_manual: PencilSquareIcon,
};

// OIA-012: monitoring-agent runs with NO changes don't deserve a card each —
// they collapse into one summary ("N checks, nothing new") and the feed is
// left for what actually changed. The heartbeat signal survives; the noise doesn't.
// NOTE: this still tests the raw Spanish descripcion coming from Firestore
// (the field is translated only for display, further down), so the pattern
// below must stay in Spanish.
const esCorridaVacia = (item: ActividadLog) =>
  item.tipo === 'agente_ejecutado' && /\b0 actualizaci/i.test(String(item.descripcion ?? ''));

type FeedEntry =
  | { kind: 'item'; item: ActividadLog }
  | { kind: 'grupo'; id: string; n: number; desde: Date | null; hasta: Date | null };

function agrupar(actividad: ActividadLog[]): FeedEntry[] {
  const out: FeedEntry[] = [];
  let grupo: ActividadLog[] = [];
  const cierra = () => {
    if (!grupo.length) return;
    if (grupo.length === 1) {
      out.push({ kind: 'item', item: grupo[0] });
    } else {
      const fechas = grupo.map((g) => (g.fecha ? new Date(g.fecha as unknown as string) : null)).filter(Boolean) as Date[];
      out.push({
        kind: 'grupo',
        id: `grupo-${grupo[0].id}`,
        n: grupo.length,
        desde: fechas.length ? new Date(Math.min(...fechas.map((f) => f.getTime()))) : null,
        hasta: fechas.length ? new Date(Math.max(...fechas.map((f) => f.getTime()))) : null,
      });
    }
    grupo = [];
  };
  for (const item of actividad) {
    if (esCorridaVacia(item)) grupo.push(item);
    else { cierra(); out.push({ kind: 'item', item }); }
  }
  cierra();
  return out;
}

// ---------------------------------------------------------------------------
// Traducción de "descripcion": los ~200 registros de actividad son efímeros
// (los escriben los agentes de monitoreo directo a Firestore, en español) y no
// tienen overlay de traducción pre-generado — no vale la pena traducirlos uno
// por uno. En vez de eso, se reconocen aquí los patrones recurrentes que
// producen lib/agents.ts y las rutas de cron/admin ("Agente ejecutado. N
// actualización(es) detectada(s).", cambios de status, altas manuales, etc.)
// y se traducen con regex. Lo que no matchea (texto libre generado por el LLM,
// notas editoriales) se deja tal cual en español antes que inventar una
// traducción — mejor una frase en ES de más que una mentira en EN.
const MESES_EN: Record<string, string> = {
  enero: 'January',
  febrero: 'February',
  marzo: 'March',
  abril: 'April',
  mayo: 'May',
  junio: 'June',
  julio: 'July',
  agosto: 'August',
  septiembre: 'September',
  octubre: 'October',
  noviembre: 'November',
  diciembre: 'December',
};

const statusEn = (codigo: string): string => {
  const key = codigo.trim();
  return STATUS_ANUNCIO_EN[key] || key;
};

type ReglaDescripcion = { test: RegExp; build: (m: RegExpMatchArray) => string };

const REGLAS_DESCRIPCION: ReglaDescripcion[] = [
  // "Agente de monitoreo ejecutado. N actualización(es) detectada(s)."
  {
    test: /^Agente de monitoreo ejecutado\.\s*(\d+)\s*actualizaci[oó]n\(es\)\s*detectada\(s\)\.?\s*$/i,
    build: (m) => `Monitoring agent run. ${m[1]} update(s) detected.`,
  },
  // "Agente de detección ejecutado. N nuevo(s) anuncio(s) encontrado(s)."
  {
    test: /^Agente de detecci[oó]n ejecutado\.\s*(\d+)\s*nuevo\(s\)\s*anuncio\(s\)\s*encontrado\(s\)\.?\s*$/i,
    build: (m) => `Detection agent run. ${m[1]} new announcement(s) found.`,
  },
  // "Agente de casos judiciales ejecutado. N nuevo(s) caso(s) encontrado(s)."
  {
    test: /^Agente de casos judiciales ejecutado\.\s*(\d+)\s*nuevo\(s\)\s*caso\(s\)\s*encontrado\(s\)\.?\s*$/i,
    build: (m) => `Judicial cases agent run. ${m[1]} new case(s) found.`,
  },
  // "Agente de legislación ejecutado. N nueva(s) iniciativa(s) encontrada(s)."
  {
    test: /^Agente de legislaci[oó]n ejecutado\.\s*(\d+)\s*nueva\(s\)\s*iniciativa\(s\)\s*encontrada\(s\)\.?\s*$/i,
    build: (m) => `Legislative agent run. ${m[1]} new initiative(s) found.`,
  },
  // 'Recap mensual de <mes> <año> generado: "<título>"'
  {
    test: /^Recap mensual de (\S+) (\d{4}) generado:\s*"([\s\S]*)"\s*$/i,
    build: (m) => `Monthly recap for ${MESES_EN[m[1].toLowerCase()] || m[1]} ${m[2]} generated: "${m[3]}"`,
  },
  // "Nuevo anuncio detectado (FOLIO): <título>"
  {
    test: /^Nuevo anuncio detectado \(([^)]+)\):\s*([\s\S]*)$/i,
    build: (m) => `New announcement detected (${m[1]}): ${m[2]}`,
  },
  // 'Status cambió de "X" a "Y": justificación'
  {
    test: /^Status cambi[oó] de "([^"]*)" a "([^"]*)":\s*([\s\S]*)$/i,
    build: (m) => `Status changed from "${statusEn(m[1])}" to "${statusEn(m[2])}": ${m[3]}`,
  },
  // 'Status cambió a "Y". justificación' (variante corta)
  {
    test: /^Status cambi[oó] a "([^"]*)"\.?\s*([\s\S]*)$/i,
    build: (m) => `Status changed to "${statusEn(m[1])}".${m[2] ? ` ${m[2]}` : ''}`,
  },
  // "Anuncio agregado manualmente: <título>"
  {
    test: /^Anuncio agregado manualmente:\s*([\s\S]*)$/i,
    build: (m) => `Announcement added manually: ${m[1]}`,
  },
  // "Anuncio actualizado/importado: <título>"
  {
    test: /^Anuncio (actualizado|importado):\s*([\s\S]*)$/i,
    build: (m) => `Announcement ${m[1] === 'actualizado' ? 'updated' : 'imported'}: ${m[2]}`,
  },
  // "Fuente actualizada: <título>"
  {
    test: /^Fuente actualizada:\s*([\s\S]*)$/i,
    build: (m) => `Source updated: ${m[1]}`,
  },
  // "Fuente eliminada: <url>"
  {
    test: /^Fuente eliminada:\s*([\s\S]*)$/i,
    build: (m) => `Source deleted: ${m[1]}`,
  },
  // "Nuevo evento agregado al timeline: <título>"
  {
    test: /^Nuevo evento agregado al timeline:\s*([\s\S]*)$/i,
    build: (m) => `New event added to the timeline: ${m[1]}`,
  },
  // "Evento actualizado: <título>"
  {
    test: /^Evento actualizado:\s*([\s\S]*)$/i,
    build: (m) => `Event updated: ${m[1]}`,
  },
  // "Evento eliminado: <título>"
  {
    test: /^Evento eliminado:\s*([\s\S]*)$/i,
    build: (m) => `Event deleted: ${m[1]}`,
  },
  // "Nuevo caso judicial detectado: <nombre>"
  {
    test: /^Nuevo caso judicial detectado:\s*([\s\S]*)$/i,
    build: (m) => `New judicial case detected: ${m[1]}`,
  },
  // "Nueva iniciativa legislativa detectada: <título>"
  {
    test: /^Nueva iniciativa legislativa detectada:\s*([\s\S]*)$/i,
    build: (m) => `New legislative initiative detected: ${m[1]}`,
  },
  // "Actualización detectada" (fallback corto y literal)
  {
    test: /^Actualizaci[oó]n detectada\.?\s*$/i,
    build: () => 'Update detected',
  },
];

function traducirDescripcion(descripcion: string): string {
  const texto = String(descripcion ?? '');
  for (const regla of REGLAS_DESCRIPCION) {
    const m = texto.match(regla.test);
    if (m) return regla.build(m);
  }
  return texto; // patrón no reconocido: se deja en español antes que inventar
}

function formatDateEn(date: Date | null): string {
  if (!date) return 'Not specified';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export default function ActividadFeedEn({ actividad }: ActividadFeedEnProps) {
  if (actividad.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8 text-sm sm:text-base">
        No activity recorded yet.
      </div>
    );
  }

  const entradas = agrupar(actividad);
  const fmtCorto = (d: Date | null) =>
    d ? d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="space-y-2 sm:space-y-3">
      {entradas.map((entrada) => {
        if (entrada.kind === 'grupo') {
          return (
            <div
              key={entrada.id}
              className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-3 sm:p-4"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <CpuChipIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-500">
                    {entrada.n} agent checks — nothing new
                    {entrada.desde && entrada.hasta
                      ? ` (${fmtCorto(entrada.desde)} – ${fmtCorto(entrada.hasta)})`
                      : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        }
        const { item } = entrada;
        // OIA-010: a superseded or retracted entry is kept (an honest record)
        // but flagged visually so no one reads it as current information.
        const marca = (item as ActividadLog & { estadoEditorial?: string }).estadoEditorial;
        const notaEditorial = (item as ActividadLog & { notaEditorial?: string }).notaEditorial;
        const atenuada = marca === 'superado' || marca === 'retractado';
        const fecha = item.fecha ? new Date(item.fecha as unknown as string) : null;
        const Icon = tipoIconos[item.tipo] || ClipboardDocumentListIcon;

        return (
          <div
            key={item.id}
            className={`rounded-lg border p-3 sm:p-4 transition-all ${
              atenuada
                ? 'bg-gray-50 border-dashed border-gray-200'
                : 'bg-white border-gray-200 hover:border-cyan-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 ${atenuada ? 'text-gray-300' : 'text-cyan-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center gap-2 flex-wrap">
                  {formatDateEn(fecha)}
                  {marca === 'superado' && (
                    <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      Superseded
                    </span>
                  )}
                  {marca === 'retractado' && (
                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      Retracted
                    </span>
                  )}
                </div>
                <p className={`text-sm sm:text-base ${atenuada ? 'text-gray-400' : 'text-gray-700'}`}>{traducirDescripcion(item.descripcion)}</p>
                {atenuada && notaEditorial && (
                  <p className="text-xs text-gray-500 mt-1 italic">{notaEditorial}</p>
                )}
                {item.anuncioId && item.anuncioTitulo && (
                  <Link
                    href={`/en/anuncio/${item.anuncioId}`}
                    className="text-cyan-600 hover:text-cyan-700 text-xs sm:text-sm mt-2 inline-block font-medium transition-colors"
                  >
                    View announcement: {item.anuncioTitulo} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
