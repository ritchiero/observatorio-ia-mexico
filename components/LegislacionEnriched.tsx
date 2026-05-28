'use client';

// Sección "Legislación en IA" — diseño "Enriched + Status" (l04) elegido por Ricardo.
// Header de dos columnas (título + barra de distribución por estatus REAL), cards
// enriquecidas con stripe de etapa, tag de estatus, escudo de verificación y avatar.
// Datos en vivo desde props (legStats + iniciativas destacadas).

import Link from 'next/link';
import { Scale, ShieldCheck, ArrowRight } from 'lucide-react';

const L = {
  bg: '#F4F6FB', panel: '#FFFFFF', ink: '#0B1220', body: '#3B475C',
  mute: '#6B7689', faint: '#A2ABBE', line: '#E5E9F2', line2: '#CED6E6',
  cyan: '#0E94C0', blue: '#2855E0', green: '#0E9E63', violet: '#7A3FB8', amber: '#C8771A', red: '#C0392B',
};

interface LegStats { total: number; activas: number; aprobadas: number; verificadas: number }
interface Iniciativa { id: string; titulo: string; status?: string; proponente?: string; fecha?: string; camara?: string; estadoVerificacion?: string }
interface Props { legStats: LegStats; loading: boolean; iniciativas: Iniciativa[] }

// status crudo → [etiqueta legible, color]
function stageOf(raw?: string): [string, string] {
  const s = (raw || '').toLowerCase();
  if (s.includes('aprob') || s.includes('publicad')) return ['Aprobada', L.green];
  if (s.includes('dictam')) return ['Dictamen', L.amber];
  if (s.includes('comision')) return ['En comisiones', L.blue];
  if (s.includes('turnad')) return ['Turnada', L.blue];
  if (s.includes('discus')) return ['En discusión', L.blue];
  if (s.includes('lectura')) return ['Primera lectura', L.blue];
  if (s.includes('desech') || s.includes('archiv')) return ['Desechada', L.red];
  if (s.includes('present')) return ['Presentada', L.mute];
  if (s.includes('elabor') || s.includes('prepar') || s.includes('recib') || s.includes('proceso')) return ['En proceso', L.mute];
  return [raw ? raw.replace(/_/g, ' ') : 'En trámite', L.mute];
}

function iniciales(nombre?: string): string {
  if (!nombre) return '··';
  return nombre.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function fechaMes(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch { return ''; }
}

export default function LegislacionEnriched({ legStats, loading, iniciativas }: Props) {
  const desechadas = Math.max(0, legStats.total - legStats.activas - legStats.aprobadas);
  const dist: [string, number, string][] = [
    ['Activas', legStats.activas, L.blue],
    ['Aprobadas', legStats.aprobadas, L.green],
    ['Desechadas', desechadas, L.faint],
  ];
  const distTotal = dist.reduce((a, d) => a + d[1], 0) || 1;
  const cards = iniciativas.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-1" style={{ color: L.ink }}>
      {/* kicker */}
      <div className="inline-flex items-center gap-2 font-mono uppercase" style={{ padding: '7px 14px 7px 11px', border: `1px solid ${L.blue}33`, background: `${L.blue}0D`, borderRadius: 999, fontSize: 10.5, letterSpacing: '0.18em', color: L.blue, fontWeight: 600 }}>
        <Scale size={13} /> Monitoreo Legislativo
      </div>

      {/* header dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 md:items-end mt-5">
        <div>
          <h2 className="font-serif-display" style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(34px,6vw,56px)', lineHeight: 1.0, letterSpacing: '-0.035em', color: L.ink }}>
            Legislación en <em style={{ fontStyle: 'italic', fontWeight: 400, color: L.blue }}>IA</em>
          </h2>
          <p className="font-sans-tech" style={{ margin: '14px 0 0', maxWidth: 460, fontSize: 14.5, lineHeight: 1.5, color: L.body }}>
            Seguimiento de todas las iniciativas de ley relacionadas con inteligencia artificial en el Congreso Federal y congresos estatales.
          </p>
        </div>

        {/* barra de distribución por estatus (real) */}
        <div>
          <div className="font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: '0.16em', color: L.mute, marginBottom: 8 }}>
            Distribución por estatus · {loading ? '—' : legStats.total}
          </div>
          <div className="flex" style={{ height: 12, borderRadius: 999, overflow: 'hidden', border: `1px solid ${L.line2}`, background: L.panel }}>
            {dist.map((d, i) => (
              <div key={i} title={`${d[0]} · ${d[1]}`} style={{ width: `${(d[1] / distTotal) * 100}%`, background: d[2], transition: 'width .6s ease' }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5" style={{ marginTop: 10 }}>
            {dist.map((d, i) => (
              <span key={i} className="font-mono inline-flex items-center gap-1.5" style={{ fontSize: 10, color: L.body, letterSpacing: '0.04em' }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: d[2] }} />{d[0]} <b style={{ color: L.ink }}>{loading ? '—' : d[1]}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* cards enriquecidas */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
          {cards.map((it, idx) => {
            const [label, c] = stageOf(it.status);
            return (
              <Link key={it.id || idx} href={`/legislacion/${it.id}`} className="group relative flex overflow-hidden transition-shadow hover:shadow-lg" style={{ background: L.panel, border: `1px solid ${L.line2}`, borderRadius: 12, boxShadow: '0 8px 24px -16px rgba(11,18,32,0.28)' }}>
                <div style={{ width: 5, background: c, flex: 'none' }} />
                <div style={{ padding: '18px 20px', flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase inline-flex items-center gap-1.5" style={{ fontSize: 10, letterSpacing: '0.12em', color: c, fontWeight: 600, padding: '4px 10px', border: `1px solid ${c}40`, background: `${c}0D`, borderRadius: 999 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: c, boxShadow: `0 0 6px ${c}88` }} />{label}
                    </span>
                    {it.estadoVerificacion === 'verificado' && <ShieldCheck size={15} style={{ color: L.green }} aria-label="Verificado con IA" />}
                  </div>
                  <h3 className="font-sans-tech line-clamp-3 group-hover:text-blue-700 transition-colors" style={{ margin: '14px 0 0', fontSize: 15.5, fontWeight: 600, lineHeight: 1.32, color: L.ink, letterSpacing: '-0.01em' }}>
                    {it.titulo}
                  </h3>
                  <div className="flex items-center gap-2.5" style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${L.line}` }}>
                    <span className="font-mono" style={{ width: 26, height: 26, borderRadius: 999, background: `${c}18`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, flex: 'none' }}>{iniciales(it.proponente)}</span>
                    <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                      <div className="font-sans-tech truncate" style={{ fontSize: 12.5, color: L.body, fontWeight: 500 }}>{it.proponente || 'Sin proponente'}</div>
                      <div className="font-mono" style={{ fontSize: 9, color: L.faint, letterSpacing: '0.08em', marginTop: 2 }}>{[it.camara ? it.camara.toUpperCase() : null, fechaMes(it.fecha)].filter(Boolean).join(' · ')}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: c }}><ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* footer: CTA + verificadas */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-9">
        <Link href="/legislacion" className="inline-flex items-center gap-2.5 font-mono uppercase transition-transform hover:scale-[1.02]" style={{ padding: '13px 24px', background: L.ink, color: '#fff', borderRadius: 8, fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, boxShadow: '0 10px 28px -12px rgba(11,18,32,0.5)' }}>
          <Scale size={15} /> Ver todas las iniciativas <ArrowRight size={14} />
        </Link>
        <span className="font-mono inline-flex items-center gap-2" style={{ fontSize: 11.5, letterSpacing: '0.04em', color: L.mute }}>
          <ShieldCheck size={15} style={{ color: L.green }} />
          <b style={{ color: L.ink, fontWeight: 600 }}>{loading ? '—' : legStats.verificadas}</b> iniciativas verificadas con IA
        </span>
      </div>
    </div>
  );
}
