import Link from 'next/link';
import { ActividadLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  CpuChipIcon, 
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ActividadFeedProps {
  actividad: ActividadLog[];
}

const tipoIconos: Record<string, React.ComponentType<{ className?: string }>> = {
  nuevo_anuncio: PlusCircleIcon,
  cambio_status: ArrowPathIcon,
  actualizacion: DocumentTextIcon,
  agente_ejecutado: CpuChipIcon,
  anuncio_manual: PencilSquareIcon,
  agente_fallo: ExclamationTriangleIcon,
};

// OIA-012: las corridas del agente SIN cambios no merecen una tarjeta cada una —
// se colapsan en un resumen ("N verificaciones sin novedad") y el feed queda para
// lo que sí cambió. La señal de vida se conserva; el ruido no.
const esCorridaVacia = (item: ActividadLog) =>
  item.tipo === 'agente_ejecutado' && /\b0 actualizaci/i.test(String(item.descripcion ?? ''));

// Un fallo NUNCA se colapsa: "sin novedad" y "no pude revisar" son cosas distintas
// y confundirlas fue lo que ocultó la caída del agente durante 20 corridas.
const esFallo = (item: ActividadLog) => item.tipo === 'agente_fallo';

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

export default function ActividadFeed({ actividad }: ActividadFeedProps) {
  if (actividad.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8 text-sm sm:text-base">
        No hay actividad registrada aún.
      </div>
    );
  }

  const entradas = agrupar(actividad);
  const fmtCorto = (d: Date | null) =>
    d ? d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '';

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
                    {entrada.n} verificaciones del agente sin novedad
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
        // OIA-010: una entrada superada o retractada se conserva (historial honesto)
        // pero se marca visualmente para que nadie la lea como información vigente.
        const marca = (item as ActividadLog & { estadoEditorial?: string }).estadoEditorial;
        const notaEditorial = (item as ActividadLog & { notaEditorial?: string }).notaEditorial;
        const atenuada = marca === 'superado' || marca === 'retractado';
        const fallo = esFallo(item);
        const fecha = item.fecha ? new Date(item.fecha as unknown as string) : null;
        const Icon = tipoIconos[item.tipo] || ClipboardDocumentListIcon;

        return (
          <div
            key={item.id}
            className={`rounded-lg border p-3 sm:p-4 transition-all ${
              fallo
                ? 'bg-amber-50 border-amber-300'
                : atenuada
                ? 'bg-gray-50 border-dashed border-gray-200'
                : 'bg-white border-gray-200 hover:border-cyan-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 ${fallo ? 'text-amber-600' : atenuada ? 'text-gray-300' : 'text-cyan-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center gap-2 flex-wrap">
                  {formatDate(fecha)}
                  {fallo && (
                    <span className="inline-flex items-center rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                      Fallo del agente
                    </span>
                  )}
                  {marca === 'superado' && (
                    <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                      Superado
                    </span>
                  )}
                  {marca === 'retractado' && (
                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                      Retractado
                    </span>
                  )}
                </div>
                <p className={`text-sm sm:text-base ${fallo ? 'text-amber-900' : atenuada ? 'text-gray-400' : 'text-gray-700'}`}>{item.descripcion}</p>
                {atenuada && notaEditorial && (
                  <p className="text-xs text-gray-500 mt-1 italic">{notaEditorial}</p>
                )}
                {item.anuncioId && item.anuncioTitulo && (
                  <Link
                    href={`/anuncio/${item.anuncioId}`}
                    className="text-cyan-600 hover:text-cyan-700 text-xs sm:text-sm mt-2 inline-block font-medium transition-colors"
                  >
                    Ver anuncio: {item.anuncioTitulo} →
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
