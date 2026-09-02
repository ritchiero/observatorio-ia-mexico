import type { Metadata } from 'next';
import Link from 'next/link';

// English twin of app/metodologia/page.tsx — same structure and data,
// translated editorial content (legal glossary: official body names stay in
// Spanish with an English gloss on first mention).

export const metadata: Metadata = {
  title: 'Methodology — how we build the Observatory',
  description:
    'Process, traceability and criteria of Observatorio IA México: how every record is detected, cross-checked, classified and published; what each status means; and how to report an error.',
  alternates: { canonical: '/en/metodologia', languages: { es: '/metodologia', en: '/en/metodologia' } },
};

const BASE = 'https://www.observatorio-ia-mexico.com';
const ISSUES_URL = 'https://github.com/ritchiero/observatorio-ia-mexico/issues/new';

async function counts(): Promise<{ anuncios: number; iniciativas: number; casos: number }> {
  try {
    const [a, i, c] = await Promise.all([
      fetch(`${BASE}/api/anuncios`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`${BASE}/api/iniciativas`, { next: { revalidate: 3600 } }).then((r) => r.json()),
      fetch(`${BASE}/api/casos-ia`, { next: { revalidate: 3600 } }).then((r) => r.json()),
    ]);
    return {
      anuncios: (a.data ?? a.anuncios ?? []).length,
      iniciativas: (i.data ?? i.iniciativas ?? []).length,
      casos: (c.casos ?? c.data ?? []).length,
    };
  } catch {
    return { anuncios: 0, iniciativas: 0, casos: 0 };
  }
}

const STEPS = [
  { n: '01', titulo: 'Detect', quien: 'Agents', que: 'Continuous monitoring of government, legislative and judicial sources (gob.mx, DOF — the Official Gazette of the Federation, parliamentary gazettes, SJF — the Federal Judicial Weekly).', salida: 'A candidate finding with source, date, actor and original link.' },
  { n: '02', titulo: 'Normalize', quien: 'System', que: 'Standardization of names, dates and agencies, plus duplicate detection against what is already published.', salida: 'A single record with structured fields.' },
  { n: '03', titulo: 'Cross-check', quien: 'Agent / person', que: 'Comparison against the primary document or verifiable public sources. Without sufficient evidence, the finding is not published.', salida: 'Linked evidence with verbatim quotes.' },
  { n: '04', titulo: 'Classify', quien: 'Rules', que: 'Application of the public status, topic and scope criteria (see section 04). Trust labels are never assigned by hand: they are derived from the source.', salida: 'Reproducible status and classification.' },
  { n: '05', titulo: 'Publish', quien: 'Observatory', que: 'The record goes out with its sources, its review level and its public reference number. No public record without an accessible source.', salida: 'A public record with full traceability.' },
  { n: '06', titulo: 'Monitor', quien: 'History', que: 'Review of status changes, deadlines and corrections. Every material update generates a public event in the activity log.', salida: 'A visible history per record.' },
];

const AXIS_A = [
  { label: 'Official source', desc: 'The evidence comes from gob.mx, the DOF, parliamentary gazettes, the SCJN/SJF (Supreme Court / Federal Judicial Weekly), state congresses or another public body. Derived automatically from the source domain — never assigned by hand.', tag: 'ORIGIN', tono: 'emerald' },
  { label: 'Documented source', desc: 'A verifiable public outlet or document (e.g. a national newspaper), pending corroboration against an official primary source.', tag: 'ORIGIN', tono: 'blue' },
  { label: 'No accessible source', desc: 'Not published. The Observatory keeps no public records without a source anyone can consult.', tag: 'RULE', tono: 'gray' },
];

const AXIS_B = [
  { label: 'Automated cross-check', desc: 'An agent compared the record’s fields against its sources. This does not imply human audit, and the record never presents it as such.', tag: 'AI', tono: 'blue' },
  { label: 'Audited by a person', desc: 'A person reviewed the record against its evidence. To count as audited, the reviewer and date must be on file.', tag: 'HUMAN', tono: 'emerald' },
  { label: 'Audit pending', desc: 'The record is published as provisional with its source in plain sight, labeled "pending human audit", and prioritized by sensitivity.', tag: 'PENDING', tono: 'amber' },
];

const CRITERIA = [
  { estatus: 'Promised', emoji: '⚪', regla: 'Publicly announced by an authority, with no verifiable evidence of execution yet.' },
  { estatus: 'In development', emoji: '🟡', regla: 'There is concrete, verifiable progress (a contract, works, a pilot, an open call), but it is not yet available to its target population.' },
  { estatus: 'Operating', emoji: '🟢', regla: 'There is public evidence of real use or availability for the target population. Operating does not equal fulfilling everything promised: it qualifies what already works.' },
  { estatus: 'Concluded', emoji: '✅', regla: 'The commitment had a bounded scope (an event, a delivery, a publication) and it happened. Closed with its evidence.' },
  { estatus: 'Broken', emoji: '🔴', regla: 'An explicit, verifiable deadline passed with no evidence of fulfillment. Without a verifiable deadline no breach is declared: the record keeps its last provable status.' },
  { estatus: 'Abandoned', emoji: '⚫', regla: 'The authority cancelled the commitment, or the program sustaining it ceased to exist, with evidence of the abandonment.' },
];

export default async function MethodologyPage() {
  const n = await counts();
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <p className="font-sans-tech text-[11px] uppercase tracking-[0.22em] text-cyan-700 mb-4">Methodology · version 2026.08</p>
          <h1 className="font-serif-display text-4xl md:text-6xl font-light text-gray-900 leading-[1.02] tracking-tight">
            How we build <em className="italic text-cyan-700">the Observatory</em>.
          </h1>
          <p className="font-serif-display text-lg md:text-xl text-gray-600 mt-6 max-w-2xl leading-relaxed">
            We monitor AI announcements, legislation and judicial cases across the Mexican state. Agents automate
            detection and the initial cross-check; every record declares its sources, its review level and its history.
            The method must be possible to <strong className="text-gray-900 font-medium">read, question and reproduce</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-sans-tech text-sm text-gray-500">
            <span><strong className="text-gray-900">{n.anuncios}</strong> announcements</span>
            <span><strong className="text-gray-900">{n.iniciativas}</strong> bills</span>
            <span><strong className="text-gray-900">{n.casos}</strong> judicial cases</span>
            <span className="text-gray-400">· live counts from the collections</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-24">

        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-5">Editorial commitment</h2>
          <ul className="grid md:grid-cols-2 gap-x-10 gap-y-4 font-sans-tech text-[15px] text-gray-700 leading-relaxed">
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Automation is never presented as human audit.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>We publish the origin of every claim and distinguish between source, review and status.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>No public record without an accessible source.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Trust labels are derived from the source; they are never hand-assigned by whoever captures the record.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>Every editorial correction keeps its history and generates a public event.</li>
            <li className="flex gap-3"><span className="text-cyan-600 mt-0.5">—</span>When the method changes, it is versioned here — never silently patched.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">01 · Process</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-8">From finding to public record.</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((p) => (
              <div key={p.n} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-mono text-cyan-600 text-sm">{p.n}</span>
                  <span className="font-sans-tech text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">{p.quien}</span>
                </div>
                <h4 className="font-sans-tech font-semibold text-gray-900 mb-2">{p.titulo}</h4>
                <p className="font-sans-tech text-sm text-gray-600 leading-relaxed mb-3">{p.que}</p>
                <p className="font-sans-tech text-xs text-gray-400 leading-relaxed"><span className="text-gray-500 font-medium">Output:</span> {p.salida}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">02 · Traceability</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">Two axes, so evidence and review never get conflated.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            "Official source" describes where the evidence comes from — not who verified it. They are independent axes,
            and each record shows them separately. Today Axis A is derived automatically from each source’s domain;
            Axis B fields are being rolled out record by record, and in the meantime every record states honestly
            whether its human audit is still pending.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-sans-tech text-sm font-semibold text-gray-900 mb-4">Axis A · Source origin</h4>
              <div className="space-y-3">
                {AXIS_A.map((e) => (
                  <div key={e.label} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans-tech font-medium text-gray-900 text-sm">{e.label}</span>
                      <span className={`font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-full ${e.tono === 'emerald' ? 'bg-emerald-50 text-emerald-700' : e.tono === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{e.tag}</span>
                    </div>
                    <p className="font-sans-tech text-[13px] text-gray-600 leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-sans-tech text-sm font-semibold text-gray-900 mb-4">Axis B · Review level</h4>
              <div className="space-y-3">
                {AXIS_B.map((e) => (
                  <div key={e.label} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans-tech font-medium text-gray-900 text-sm">{e.label}</span>
                      <span className={`font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-full ${e.tono === 'emerald' ? 'bg-emerald-50 text-emerald-700' : e.tono === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{e.tag}</span>
                    </div>
                    <p className="font-sans-tech text-[13px] text-gray-600 leading-relaxed">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">03 · Worked example</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">The methodology is best understood on a real record.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            Anyone should be able to reconstruct what happened from the first finding to the current state. This is a
            real public record of the Observatory — including its pending human audit, because transparency also covers
            what is still missing.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-5 md:px-7 py-4 border-b border-gray-200 flex flex-wrap items-center gap-2 justify-between">
              <span className="font-mono text-xs text-gray-500">LEG-2026-013 · public record</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="font-sans-tech text-[11px] uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">Official source</span>
                <span className="font-sans-tech text-[11px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">Automated cross-check</span>
                <span className="font-sans-tech text-[11px] uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">Human audit pending</span>
              </div>
            </div>
            <div className="px-5 md:px-7 py-6">
              <h4 className="font-serif-display text-xl md:text-2xl text-gray-900 leading-snug mb-4">
                AI regulation against digital violence and deepfakes — reform to the Código Penal Federal (Federal
                Criminal Code) and the Ley de Acceso de las Mujeres a una Vida Libre de Violencia (Law on Women’s
                Access to a Life Free of Violence)
              </h4>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 font-sans-tech text-sm mb-6">
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Primary source</dt><dd className="text-gray-900">Gaceta del Senado (Senate Gazette) · LXVI Legislature</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Sponsor</dt><dd className="text-gray-900">Sen. Karen Castrejón Trujillo</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Legislative status</dt><dd className="text-gray-900">In committee</dd></div>
                <div className="flex justify-between sm:block"><dt className="text-gray-400">Next action</dt><dd className="text-gray-900">Confirm committee ruling and preserve the primary document</dd></div>
              </dl>
              <ol className="border-l-2 border-gray-200 pl-5 space-y-3 font-sans-tech text-sm text-gray-600 mb-6">
                <li><span className="font-mono text-xs text-gray-400 mr-2">Feb 4, 2026</span>Detected in the Gaceta del Senado; the record is created with a public reference number.</li>
                <li><span className="font-mono text-xs text-gray-400 mr-2">Feb 4, 2026</span>Initial cross-check: sponsor, date and subject matter against the parliamentary source.</li>
                <li><span className="font-mono text-xs text-gray-400 mr-2">2026</span>Published as provisional, with its source in plain sight and flagged for human audit.</li>
              </ol>
              <Link href="/en/legislacion/lqMENbXyrHBr9JI88cxd" className="font-sans-tech text-sm text-cyan-700 hover:text-cyan-900 font-medium">
                Open the full record →
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-sans-tech text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">04 · Criteria</h2>
          <h3 className="font-serif-display text-3xl md:text-4xl font-light text-gray-900 mb-3">What each status means.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            These are the six statuses of the announcements catalog — the same rule regardless of topic or institution.
            Every total shown on the site is the sum of its visible parts; a status outside the catalog is shown as
            "unclassified", never hidden. For legislation and judicial cases, the status mirrors the parliamentary or
            judicial source (in committee, referred, resolved…), not our own interpretation.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {CRITERIA.map((c) => (
              <div key={c.estatus} className="border border-gray-200 rounded-xl p-5 flex gap-4">
                <span className="text-xl" aria-hidden>{c.emoji}</span>
                <div>
                  <h4 className="font-sans-tech font-semibold text-gray-900 mb-1">{c.estatus}</h4>
                  <p className="font-sans-tech text-sm text-gray-600 leading-relaxed">{c.regla}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-sans-tech text-sm text-gray-500 leading-relaxed mt-6 max-w-3xl">
            "Operating" is not "compliance" either: recap percentages are labeled "in operation", and "compliance" is
            reserved for commitments with a verifiable scope and deadline.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-12">
          <h3 className="font-serif-display text-2xl md:text-3xl font-light text-gray-900 mb-3">The methodology has a history too.</h3>
          <p className="font-sans-tech text-[15px] text-gray-600 max-w-3xl leading-relaxed mb-8">
            This page is versioned (v2026.08). Status changes and corrections live in the public activity log; the data
            can be browsed as an accessible table; and any error can be reported in the project’s public repository.
          </p>
          <div className="flex flex-wrap gap-3 font-sans-tech text-sm">
            <Link href="/en/actividad" className="px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors">View the activity log</Link>
            <Link href="/en/grafo/tabla" className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">Data as an accessible table</Link>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:border-cyan-400 hover:text-cyan-700 transition-colors">Report an error ↗</a>
          </div>
        </section>
      </div>
    </div>
  );
}
