'use client';

import { useEffect, useState } from 'react';

// English edition of the "AI in the Mexican State 2026" report. Same live
// /api/indice computation as the Spanish original — only labels are translated;
// every number is computed the same way, from the same data, at the same cut.

interface Indice {
  generatedAt: string;
  tracker: {
    totalAnuncios: number;
    porPoder: Record<string, number>;
    ejecutivo: {
      n: number; indiceCumplimiento: number; vencidas: number;
      porStatus: Record<string, number>;
      porDependencia: { dependencia: string; n: number; score: number }[];
    };
  };
  legislacion: {
    total: number; leyVigente: number;
    porStatus: Record<string, number>;
    enfoque: { integral: number; ajuste: number; otro: number };
    ajustesPorLey: { k: string; v: number }[];
    porCamara: { k: string; v: number }[];
    porAnio: Record<string, number>;
    porTema: { k: string; v: number }[];
  };
  estatal: { federal: number; totalEstatal: number; porEstado: { estado: string; n: number }[] };
  casos: { total: number; conCriterio: number; porMateria: Record<string, number>; porTribunal: Record<string, number> };
  confianza: { oficialPct: { anuncios: number; iniciativas: number; casos: number }; sinFuente: number };
}

const C = { ink: '#0B1220', body: '#3B475C', mute: '#6B7689', cyan: '#0E94C0', blue: '#2855E0', green: '#0E9E63', red: '#DC2626', amber: '#C77E12', line: '#E5E9F2' };

function Bar({ label, value, max, color = C.blue, suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ margin: '7px 0' }}>
      <div className="flex justify-between" style={{ fontSize: 12.5, color: C.body, marginBottom: 3 }}>
        <span className="font-sans-tech">{label}</span>
        <span className="font-mono" style={{ color: C.ink, fontWeight: 600 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 8, background: '#EEF1F7', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 880, margin: '0 auto', padding: '36px 20px', borderTop: `1px solid ${C.line}` }}>
      <div className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.22em', color: C.cyan, fontWeight: 600 }}>{eyebrow}</div>
      <h2 className="font-serif-display" style={{ fontSize: 'clamp(24px,4vw,34px)', color: C.ink, margin: '8px 0 18px', fontWeight: 500, letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 14, padding: 18 }}>{children}</div>;
}

export default function Informe2026En() {
  const [d, setD] = useState<Indice | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch('/api/indice').then(r => r.json()).then(j => { if (j.error) setErr(true); else setD(j); }).catch(() => setErr(true));
  }, []);

  if (err) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-sans-tech">Could not load the index.</div>;
  if (!d) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-sans-tech">Computing the index…</div>;

  const t = d.tracker, l = d.legislacion, e = d.estatal, ca = d.casos, cf = d.confianza;
  const op = t.ejecutivo.porStatus;
  const aniosMax = Math.max(1, ...Object.values(l.porAnio));
  const estadoMax = Math.max(1, ...e.porEstado.map(x => x.n));
  const temaMax = Math.max(1, ...l.porTema.map(x => x.v));

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <header style={{ maxWidth: 880, margin: '0 auto', padding: '56px 20px 8px', textAlign: 'center' }}>
        <div className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: '0.26em', color: C.cyan, fontWeight: 600 }}>Observatorio · Annual Report</div>
        <h1 className="font-serif-display" style={{ fontSize: 'clamp(32px,6vw,56px)', color: C.ink, margin: '14px 0 6px', fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.05 }}>
          AI in the Mexican<br />State — <em style={{ color: C.cyan, fontStyle: 'italic' }}>2026</em>
        </h1>
        <p className="font-serif-display" style={{ color: C.body, fontSize: 17, maxWidth: 600, margin: '10px auto 0' }}>
          What the Mexican state promised, what Congress legislated, and what the courts ruled on artificial intelligence — with verifiable official sources.
        </p>
        <p className="font-mono" style={{ fontSize: 11, color: C.mute, marginTop: 14 }}>v1 · live data · {new Date(d.generatedAt).toLocaleDateString('en-US')}</p>
      </header>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '18px 20px' }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { n: `${t.ejecutivo.indiceCumplimiento}/100`, l: 'Executive Branch compliance index', col: C.cyan },
          { n: `${l.leyVigente}`, l: `of ${l.total} bills are law in force`, col: C.green },
          { n: `${Math.round(100 * e.federal / Math.max(1, e.federal + e.totalEstatal))}%`, l: 'of legislation is federal', col: C.blue },
          { n: `${l.enfoque.ajuste}`, l: `narrow amendments vs. ${l.enfoque.integral} comprehensive AI bills`, col: C.amber },
        ].map((s, i) => (
          <div key={i} style={{ border: `1px solid ${C.line}`, background: '#fff', borderRadius: 14, padding: 16 }}>
            <div className="font-serif-display" style={{ fontSize: 30, fontWeight: 600, color: s.col, lineHeight: 1 }}>{s.n}</div>
            <div className="font-sans-tech" style={{ fontSize: 12, color: C.mute, marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <Section eyebrow="01 · Accountability" title="Executive Branch compliance tracker">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 6 }}>Weighted compliance index</div>
            <div className="font-serif-display" style={{ fontSize: 52, fontWeight: 600, color: C.cyan, lineHeight: 1 }}>{t.ejecutivo.indiceCumplimiento}<span style={{ fontSize: 22, color: C.mute }}>/100</span></div>
            <div className="font-sans-tech" style={{ fontSize: 12, color: C.mute, marginTop: 8 }}>{t.ejecutivo.n} Executive Branch commitments · {t.ejecutivo.vencidas} past their promised deadline without operating</div>
          </Card>
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 4 }}>Status of promises</div>
            <Bar label="Operating" value={op.operando || 0} max={t.ejecutivo.n} color={C.green} />
            <Bar label="In development" value={op.en_desarrollo || 0} max={t.ejecutivo.n} color={C.blue} />
            <Bar label="Promised" value={op.prometido || 0} max={t.ejecutivo.n} color={C.amber} />
            <Bar label="Broken" value={op.incumplido || 0} max={t.ejecutivo.n} color={C.red} />
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 8 }}>Compliance by agency (≥2 promises)</div>
            {t.ejecutivo.porDependencia.map((x) => (
              <Bar key={x.dependencia} label={`${x.dependencia} (${x.n})`} value={x.score} max={100} color={x.score >= 70 ? C.green : x.score >= 40 ? C.amber : C.red} suffix="/100" />
            ))}
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card>
            <details>
              <summary className="font-sans-tech" style={{ fontSize: 13, color: C.mute, cursor: 'pointer' }}>
                How this index is calculated (universe, formula, cutoff)
              </summary>
              <div className="font-sans-tech" style={{ fontSize: 12.5, color: C.body, lineHeight: 1.75, marginTop: 10 }}>
                <p><b>Universe:</b> the {t.ejecutivo.n} announcements classified as <b>Executive Branch</b> (by
                agency/official responsible). This is a subset of the homepage tracker&apos;s total, which also
                includes announcements from the Legislature, the Judiciary, academia and others — that is why the
                two figures differ, and neither is wrong: they measure different universes.</p>
                <p style={{ marginTop: 8 }}><b>Formula:</b> average of per-status weights × 100. Weights: operating = 1 ·
                in development = 0.5 (0.35 if its promised deadline has already passed) · promised = 0.25 · broken and
                abandoned = 0. A commitment &quot;in development&quot; past its deadline is penalized; one that is operating counts in full.</p>
                <p style={{ marginTop: 8 }}><b>Cutoff:</b> figures are computed live from the database when this page loads
                (not a monthly snapshot). Legislative figures distinguish process status
                (introduced / in committee / approved / published): &quot;approved&quot; does not mean &quot;in force&quot;.</p>
              </div>
            </details>
          </Card>
        </div>
      </Section>

      <Section eyebrow="02 · Legislation" title="From bill to law — and how AI is being regulated">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 6 }}>Regulatory approach</div>
            <Bar label="Narrow amendments (patchwork)" value={l.enfoque.ajuste} max={l.total} color={C.amber} />
            <Bar label="Comprehensive AI law" value={l.enfoque.integral} max={l.total} color={C.blue} />
            <div className="font-sans-tech" style={{ fontSize: 12, color: C.mute, marginTop: 8 }}>Of {l.total} bills, only <b style={{ color: C.green }}>{l.leyVigente}</b> are law in force.</div>
          </Card>
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 4 }}>Most-legislated topics</div>
            {l.porTema.slice(0, 6).map((x) => <Bar key={x.k} label={x.k} value={x.v} max={temaMax} color={C.cyan} />)}
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card>
            <div className="font-sans-tech" style={{ fontSize: 13, color: C.mute, marginBottom: 4 }}>Bills by year</div>
            <div className="flex items-end gap-2" style={{ height: 120, marginTop: 8 }}>
              {Object.entries(l.porAnio).filter(([y]) => y !== '?').map(([y, v]) => (
                <div key={y} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div className="font-mono" style={{ fontSize: 11, color: C.ink, fontWeight: 600 }}>{v}</div>
                  <div style={{ width: '70%', height: `${(v / aniosMax) * 100}%`, background: C.blue, borderRadius: '4px 4px 0 0', minHeight: 3 }} />
                  <div className="font-mono" style={{ fontSize: 10, color: C.mute, marginTop: 4 }}>{y}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section eyebrow="03 · Federalism" title="State-by-state AI legislation ranking">
        <Card>
          <div className="font-sans-tech" style={{ fontSize: 14, color: C.body, marginBottom: 10 }}>
            Legislative activity on AI is almost entirely <b style={{ color: C.ink }}>federal</b>: {e.federal} of {e.federal + e.totalEstatal} bills. Only <b style={{ color: C.ink }}>{e.porEstado.length}</b> states have any at all; the rest have none.
          </div>
          {e.porEstado.slice(0, 12).map((x) => <Bar key={x.estado} label={x.estado} value={x.n} max={estadoMax} color={C.green} />)}
        </Card>
      </Section>

      <Section eyebrow="04 · Case law" title="Judicial precedents">
        <Card>
          <div className="flex gap-8 flex-wrap">
            <div><div className="font-serif-display" style={{ fontSize: 40, fontWeight: 600, color: C.ink }}>{ca.total}</div><div className="font-sans-tech" style={{ fontSize: 12, color: C.mute }}>precedents</div></div>
            <div><div className="font-serif-display" style={{ fontSize: 40, fontWeight: 600, color: C.green }}>{ca.conCriterio}</div><div className="font-sans-tech" style={{ fontSize: 12, color: C.mute }}>with a settled legal standard</div></div>
          </div>
          <div className="font-sans-tech" style={{ fontSize: 12, color: C.mute, marginTop: 10 }}>By subject matter: {Object.entries(ca.porMateria).map(([k, v]) => `${k} ${v}`).join(' · ')}</div>
        </Card>
      </Section>

      <Section eyebrow="05 · Methodology" title="Traceability and confidence levels">
        <Card>
          <div className="font-sans-tech" style={{ fontSize: 14, color: C.body, marginBottom: 10 }}><b style={{ color: C.green }}>{cf.sinFuente} records with no source</b> across the whole index. % backed by an official source:</div>
          <Bar label="Bills" value={cf.oficialPct.iniciativas} max={100} color={C.green} suffix="%" />
          <Bar label="Cases" value={cf.oficialPct.casos} max={100} color={C.green} suffix="%" />
          <Bar label="Announcements" value={cf.oficialPct.anuncios} max={100} color={C.amber} suffix="%" />
        </Card>
        <p className="font-sans-tech" style={{ fontSize: 12, color: C.mute, marginTop: 16, textAlign: 'center' }}>
          Coming next: an inventory of AI actually in use by the Mexican state, and an international comparison (Mexico vs. the world).
        </p>
        <p className="font-sans-tech" style={{ fontSize: 11, color: C.mute, marginTop: 24, textAlign: 'center' }}>
          <a href="/informe-2026" className="underline hover:text-cyan-700">Ver en español</a>
        </p>
      </Section>
    </div>
  );
}
