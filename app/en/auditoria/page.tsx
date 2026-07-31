import { getAdminDb } from '@/lib/firebase-admin';

// Audit page (v2) — English twin of app/auditoria/page.tsx. SERVER-rendered
// (data lives in the HTML, readable by a human or an AI with a single fetch).
// v2 adds what the external audit asked for: a source URL per record,
// readable hiding reasons (plain text, not a hover tooltip), and a status
// glossary. Same Firestore access as the Spanish original — only the
// presentation text is translated.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Doc = Record<string, unknown>;
const RE_OFICIAL = /(\.gob\.mx|scjn|sjf|diputados|senado\.gob|congreso|segob|dof|indautor|impi|ine\.mx|inai|unesco|europa\.eu)/i;

function urls(d: Doc): string[] {
  return (JSON.stringify(d).match(/https?:\/\/[^\s"'<>)\]}]+/g) || []);
}
function srcUrl(d: Doc): string {
  const direct = [d.fuenteOriginal, d.urlGaceta, d.urlPDF].find(u => typeof u === 'string' && /^https?:\/\//.test(u as string));
  if (direct) return direct as string;
  for (const arr of [d.fuentes, d.documentos]) {
    if (Array.isArray(arr)) {
      const u = (arr as { url?: string }[]).map(f => f?.url).find(u => typeof u === 'string' && /^https?:\/\//.test(u));
      if (u) return u;
    }
  }
  return urls(d)[0] || '';
}
function host(u: string): string {
  try { return new URL(u).host.replace(/^www\./, ''); } catch { return u.slice(0, 36); }
}
function tier(d: Doc): 'oficial' | 'prensa' | 'sin' {
  const us = urls(d);
  if (!us.length) return 'sin';
  return us.some(u => RE_OFICIAL.test(u)) ? 'oficial' : 'prensa';
}
function poder(d: Doc): string {
  const t = `${d.dependencia ?? ''} ${d.responsable ?? ''}`.toLowerCase();
  if (/senado|diputad|congreso|legislat|jucopo/.test(t)) return 'Legislative';
  if (/suprema|tribunal|scjn|judicatura/.test(t)) return 'Judicial';
  if (/presidencia|secretar|agencia|atdt|conahcyt|secihti|gobierno de|salud|econom|sep\b|indautor|impi/.test(t)) return 'Executive';
  return 'Other';
}
function enf(t: string): string {
  const x = (t || '').toLowerCase();
  return x.startsWith('reforma') ? 'amendment' : x.includes('ley') ? 'comprehensive' : 'other';
}
function ts(v: unknown): string {
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') return (v as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  return String(v ?? '').slice(0, 10);
}
const fColor: Record<string, string> = { oficial: 'text-emerald-700', prensa: 'text-blue-700', sin: 'text-red-600' };

function Fuente({ d }: { d: Doc }) {
  const t = tier(d); const u = srcUrl(d);
  if (t === 'sin' || !u) return <span className="text-red-600 text-[11px]">no source</span>;
  return <a href={u} target="_blank" rel="noopener noreferrer" className={`${fColor[t]} text-[11px] underline decoration-dotted whitespace-nowrap`} title={u}>{t === 'oficial' ? '🟢' : '🔵'} {host(u)} ↗</a>;
}
function Titulo({ t, oculto, motivo }: { t: string; oculto: boolean; motivo: string }) {
  return (
    <div>
      <span className="text-gray-900">{t}</span>
      {oculto && motivo && <div className="text-[11px] italic text-amber-700 mt-1">🔒 {motivo}</div>}
    </div>
  );
}

function Tabla({ titulo, eyebrow, cols, filas }: { titulo: string; eyebrow: string; cols: string[]; filas: { oculto: boolean; cells: React.ReactNode[] }[] }) {
  const vis = filas.filter(f => !f.oculto).length;
  return (
    <section className="mb-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-700 font-semibold">{eyebrow}</div>
      <h2 className="font-serif text-2xl text-gray-900 mt-1 mb-3">{titulo} <span className="text-sm font-sans text-gray-400">· {vis} visible + {filas.length - vis} hidden = {filas.length}</span></h2>
      <div className="overflow-auto border border-gray-200 rounded-xl bg-white">
        <table className="w-full text-[12.5px] border-collapse">
          <thead><tr className="bg-gray-50 border-b-2 border-gray-200">{cols.map(c => <th key={c} className="text-left px-3 py-2 font-sans-tech text-[11px] uppercase tracking-wide text-gray-500 whitespace-nowrap">{c}</th>)}</tr></thead>
          <tbody>{filas.map((f, i) => (
            <tr key={i} className={`border-b border-gray-100 ${f.oculto ? 'bg-amber-50/40' : i % 2 ? 'bg-gray-50/40' : ''}`}>
              {f.cells.map((cell, j) => <td key={j} className="px-3 py-2 align-top">{cell}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

const Folio = ({ v, oc }: { v: unknown; oc: boolean }) => <span className="font-mono text-[11px] text-cyan-700 whitespace-nowrap">{String(v ?? '—')}{oc && <span className="text-amber-600"> 🔒</span>}</span>;

export default async function Auditoria() {
  const db = getAdminDb();
  const [aS, iS, cS] = await Promise.all([db.collection('anuncios').get(), db.collection('iniciativas').get(), db.collection('casos_ia').get()]);
  const sortFn = (a: Doc, b: Doc) => Number(!!a.oculto) - Number(!!b.oculto) || String(a.folio).localeCompare(String(b.folio));
  const anuncios = aS.docs.map(d => d.data() as Doc).sort(sortFn);
  const inis = iS.docs.map(d => d.data() as Doc).sort(sortFn);
  const casos = cS.docs.map(d => d.data() as Doc).sort(sortFn);
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <div className="max-w-[1280px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-700 font-semibold">Observatorio IA México · Audit</div>
        <h1 className="font-serif text-3xl text-gray-900 mt-1">Complete inventory for review</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-3xl">
          Server-rendered (data is embedded in the HTML). Includes <b>hidden/reclassified</b> records (🔒, amber background, with a <b>readable reason</b>) and the <b>source URL</b> for each record. Live data as of {hoy}. {anuncios.length} announcements · {inis.length} bills · {casos.length} cases.
        </p>

        {/* Status glossary */}
        <div className="mt-5 border border-gray-200 rounded-xl bg-white p-4 text-[12.5px]">
          <div className="font-mono text-[11px] uppercase tracking-wide text-gray-500 mb-2">Status glossary</div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 text-gray-700">
            <div><b>Announcements (Executive):</b> <span className="text-gray-500">prometido</span> = announced, no visible work yet · <span className="text-gray-500">en_desarrollo</span> = active, verifiable work underway · <span className="text-gray-500">operando</span> = live and running publicly · <span className="text-gray-500">incumplido</span> = deadline passed, unmet · <span className="text-gray-500">abandonado</span> = cancelled.</div>
            <div><b>Legislation:</b> <span className="text-gray-500">presentada/en_comisiones/turnada</span> = in progress (submitted, in committee, or referred to committee) · <span className="text-gray-500">aprobada</span> = passed a floor vote · <span className="text-gray-500">publicada</span> = law in force (DOF, the federal official gazette) · <span className="text-gray-500">desechada/archivada</span> = did not advance.</div>
          </div>
        </div>

        <div className="mt-8">
          <Tabla titulo="Announcements" eyebrow="01 · Tracker / Projects" cols={['File No.', 'Title / reason if hidden', 'Status', 'Branch', 'Agency', 'Date', 'Source (URL)']}
            filas={anuncios.map(d => ({ oculto: !!d.oculto, cells: [
              <Folio key="f" v={d.folio} oc={!!d.oculto} />,
              <Titulo key="t" t={String(d.titulo ?? '')} oculto={!!d.oculto} motivo={String(d.motivoOculto ?? '')} />,
              <span key="s" className="whitespace-nowrap">{String(d.status ?? '')}</span>,
              <span key="p" className="whitespace-nowrap">{poder(d)}</span>,
              <span key="d" className="text-gray-600">{String(d.dependencia ?? d.responsable ?? '')}</span>,
              <span key="fe" className="font-mono text-[11px] text-gray-500 whitespace-nowrap">{ts(d.fechaAnuncio)}</span>,
              <Fuente key="fu" d={d} />,
            ] }))} />

          <Tabla titulo="Legislation" eyebrow="02 · Bills" cols={['File No.', 'Title / reason if hidden', 'Status', 'Focus', 'Chamber', 'Date', 'Source (URL)']}
            filas={inis.map(d => ({ oculto: !!d.oculto, cells: [
              <Folio key="f" v={d.folio} oc={!!d.oculto} />,
              <Titulo key="t" t={String(d.titulo ?? '')} oculto={!!d.oculto} motivo={String(d.motivoOculto ?? '')} />,
              <span key="s" className="whitespace-nowrap">{String(d.status ?? d.estatus ?? '')}</span>,
              <span key="e" className="whitespace-nowrap">{enf(String(d.tipo ?? ''))}</span>,
              <span key="c" className="text-gray-600 whitespace-nowrap">{String(d.camara ?? '')}</span>,
              <span key="fe" className="font-mono text-[11px] text-gray-500 whitespace-nowrap">{ts(d.fecha)}</span>,
              <Fuente key="fu" d={d} />,
            ] }))} />

          <Tabla titulo="Judicial cases" eyebrow="03 · Precedents" cols={['File No.', 'Name / reason if hidden', 'Status', 'Subject matter', 'Court', 'Criterion', 'Source (URL)']}
            filas={casos.map(d => ({ oculto: !!d.oculto, cells: [
              <Folio key="f" v={d.folio} oc={!!d.oculto} />,
              <Titulo key="t" t={String(d.nombre ?? '')} oculto={!!d.oculto} motivo={String(d.motivoOculto ?? '')} />,
              <span key="s" className="whitespace-nowrap">{String(d.estado ?? '')}</span>,
              <span key="m" className="whitespace-nowrap">{String(d.materia ?? '')}</span>,
              <span key="tr" className="text-gray-600">{String(d.tribunalActual ?? '')}</span>,
              <span key="cr" className="whitespace-nowrap">{(d.criterio || (d.criterios as unknown[])?.length) ? 'Yes' : 'No'}</span>,
              <Fuente key="fu" d={d} />,
            ] }))} />
        </div>
        <p className="text-gray-400 text-xs mt-6 font-mono">Live data from Firestore · case file numbers as a stable reference · 🟢 official source · 🔵 press.</p>
      </div>
    </div>
  );
}
