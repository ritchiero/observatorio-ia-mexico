import { getAdminDb } from '@/lib/firebase-admin';

// Página de auditoría: renderizada en el SERVIDOR (los datos van en el HTML),
// para que cualquier revisor —humano o IA— pueda leer el inventario completo
// con un solo fetch, sin depender de hidratación. Incluye registros ocultos/
// reclasificados (con su motivo) para auditar completitud y curación.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Doc = Record<string, unknown>;
const RE_OFICIAL = /(\.gob\.mx|scjn|sjf|diputados|senado\.gob|congreso|segob|dof|indautor|impi|ine\.mx|inai|unesco|europa\.eu)/i;
const RE_URL = /https?:\/\//;

function tier(d: Doc): string {
  const raw = JSON.stringify(d);
  if (!RE_URL.test(raw)) return 'sin fuente';
  return RE_OFICIAL.test(raw) ? 'oficial' : 'prensa';
}
function poder(d: Doc): string {
  const t = `${d.dependencia ?? ''} ${d.responsable ?? ''}`.toLowerCase();
  if (/senado|diputad|congreso|legislat|jucopo/.test(t)) return 'Legislativo';
  if (/suprema|tribunal|scjn|judicatura/.test(t)) return 'Judicial';
  if (/presidencia|secretar|agencia|atdt|conahcyt|secihti|gobierno de|salud|econom|sep\b|indautor|impi/.test(t)) return 'Ejecutivo';
  return 'Otro';
}
function enf(t: string): string {
  const x = (t || '').toLowerCase();
  return x.startsWith('reforma') ? 'ajuste' : x.includes('ley') ? 'integral' : 'otro';
}
function ts(v: unknown): string {
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') return (v as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  return String(v ?? '').slice(0, 10);
}
const fuenteColor: Record<string, string> = { oficial: 'bg-emerald-100 text-emerald-700', prensa: 'bg-blue-100 text-blue-700', 'sin fuente': 'bg-red-100 text-red-700' };

function Tabla({ titulo, eyebrow, cols, filas }: { titulo: string; eyebrow: string; cols: string[]; filas: { oculto: boolean; motivo?: string; cells: React.ReactNode[] }[] }) {
  const vis = filas.filter(f => !f.oculto).length;
  const oc = filas.length - vis;
  return (
    <section className="mb-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-700 font-semibold">{eyebrow}</div>
      <h2 className="font-serif text-2xl text-gray-900 mt-1 mb-3">{titulo} <span className="text-sm font-sans text-gray-400">· {vis} visibles + {oc} ocultos</span></h2>
      <div className="overflow-auto border border-gray-200 rounded-xl bg-white">
        <table className="w-full text-[12.5px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              {cols.map(c => <th key={c} className="text-left px-3 py-2 font-sans-tech text-[11px] uppercase tracking-wide text-gray-500 whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} title={f.motivo} className={`border-b border-gray-100 ${f.oculto ? 'opacity-50' : i % 2 ? 'bg-gray-50/40' : ''}`}>
                {f.cells.map((cell, j) => <td key={j} className="px-3 py-2 align-top">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function Auditoria() {
  const db = getAdminDb();
  const [aS, iS, cS] = await Promise.all([
    db.collection('anuncios').get(),
    db.collection('iniciativas').get(),
    db.collection('casos_ia').get(),
  ]);
  const Folio = ({ v, oc }: { v: unknown; oc: boolean }) => (
    <span className="font-mono text-[11px] text-cyan-700 whitespace-nowrap">{String(v ?? '—')}{oc && <span className="text-amber-600"> 🔒</span>}</span>
  );
  const Fuente = ({ v }: { v: string }) => <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium ${fuenteColor[v]}`}>{v}</span>;

  const anuncios = aS.docs.map(d => d.data() as Doc).sort((a, b) => Number(!!a.oculto) - Number(!!b.oculto) || String(a.folio).localeCompare(String(b.folio)));
  const inis = iS.docs.map(d => d.data() as Doc).sort((a, b) => Number(!!a.oculto) - Number(!!b.oculto) || String(a.folio).localeCompare(String(b.folio)));
  const casos = cS.docs.map(d => d.data() as Doc).sort((a, b) => Number(!!a.oculto) - Number(!!b.oculto) || String(a.folio).localeCompare(String(b.folio)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <div className="max-w-[1240px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-700 font-semibold">Observatorio IA México · Auditoría</div>
        <h1 className="font-serif text-3xl text-gray-900 mt-1">Inventario completo para revisión</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Renderizado en el servidor (datos en el HTML, legibles por humanos o IA). Incluye registros <b>ocultos/reclasificados</b> (🔒, en gris, con el motivo al pasar el cursor) para auditar completitud y curación. {anuncios.length} anuncios · {inis.length} iniciativas · {casos.length} casos.
        </p>

        <div className="mt-8">
          <Tabla titulo="Anuncios" eyebrow="01 · Tracker / proyectos" cols={['Folio', 'Título', 'Status', 'Poder', 'Dependencia', 'Fecha', 'Fuente']}
            filas={anuncios.map(d => ({
              oculto: !!d.oculto, motivo: String(d.motivoOculto ?? ''),
              cells: [
                <Folio key="f" v={d.folio} oc={!!d.oculto} />,
                <span key="t" className="text-gray-900">{String(d.titulo ?? '')}</span>,
                <span key="s" className="whitespace-nowrap">{String(d.status ?? '')}</span>,
                <span key="p" className="whitespace-nowrap">{poder(d)}</span>,
                <span key="d" className="text-gray-600">{String(d.dependencia ?? d.responsable ?? '')}</span>,
                <span key="fe" className="font-mono text-[11px] text-gray-500 whitespace-nowrap">{ts(d.fechaAnuncio)}</span>,
                <Fuente key="fu" v={tier(d)} />,
              ],
            }))} />

          <Tabla titulo="Legislación" eyebrow="02 · Iniciativas" cols={['Folio', 'Título', 'Status', 'Enfoque', 'Cámara', 'Fecha', 'Fuente']}
            filas={inis.map(d => ({
              oculto: !!d.oculto, motivo: String(d.motivoOculto ?? ''),
              cells: [
                <Folio key="f" v={d.folio} oc={!!d.oculto} />,
                <span key="t" className="text-gray-900">{String(d.titulo ?? '')}</span>,
                <span key="s" className="whitespace-nowrap">{String(d.status ?? d.estatus ?? '')}</span>,
                <span key="e" className="whitespace-nowrap">{enf(String(d.tipo ?? ''))}</span>,
                <span key="c" className="text-gray-600 whitespace-nowrap">{String(d.camara ?? '')}</span>,
                <span key="fe" className="font-mono text-[11px] text-gray-500 whitespace-nowrap">{ts(d.fecha)}</span>,
                <Fuente key="fu" v={tier(d)} />,
              ],
            }))} />

          <Tabla titulo="Casos judiciales" eyebrow="03 · Precedentes" cols={['Folio', 'Nombre', 'Estado', 'Materia', 'Tribunal', 'Criterio', 'Fuente']}
            filas={casos.map(d => ({
              oculto: !!d.oculto, motivo: String(d.motivoOculto ?? ''),
              cells: [
                <Folio key="f" v={d.folio} oc={!!d.oculto} />,
                <span key="t" className="text-gray-900">{String(d.nombre ?? '')}</span>,
                <span key="s" className="whitespace-nowrap">{String(d.estado ?? '')}</span>,
                <span key="m" className="whitespace-nowrap">{String(d.materia ?? '')}</span>,
                <span key="tr" className="text-gray-600">{String(d.tribunalActual ?? '')}</span>,
                <span key="cr" className="whitespace-nowrap">{(d.criterio || (d.criterios as unknown[])?.length) ? 'sí' : 'no'}</span>,
                <Fuente key="fu" v={tier(d)} />,
              ],
            }))} />
        </div>
        <p className="text-gray-400 text-xs mt-6 font-mono">Datos en vivo desde Firestore · folios de expediente como referencia estable.</p>
      </div>
    </div>
  );
}
