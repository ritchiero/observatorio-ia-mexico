'use client';

// Sección "Legislación en IA" — diseño "Enriched + Status" (l04) elegido por Ricardo.
// Header de dos columnas (título + barra de distribución por estatus REAL), cards
// enriquecidas con stripe de etapa, tag de estatus, escudo de verificación y avatar.
// Datos en vivo desde props (legStats + iniciativas destacadas).

import Link from 'next/link';
import { Scale, ShieldCheck, ArrowRight } from 'lucide-react';

const L = {
  bg: '#F4F6FB', panel: '#FFFFFF', ink: '#0B1220', body: '#3B475C',
  mute: '#515E74', faint: '#A2ABBE', line: '#E5E9F2', line2: '#CED6E6',
  cyan: '#0E94C0', blue: '#2855E0', green: '#087047', violet: '#7A3FB8', amber: '#874607', red: '#C0392B',
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
    if (isNaN(d.getTime())) return '';
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch { return ''; }
}

export default function LegislacionEnriched({ legStats, loading, iniciativas }: Props) {
  const desechadas = Math.max(0, legStats.total - legStats.activas - legStats.aprobadas);
  const dist: [string, number, string][] = [
    ['Activas', legStats.activas, L.blue],
    ['Aprobadas / publicadas', legStats.aprobadas, L.green],
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
          <div className="font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.10em', color: L.mute, marginBottom: 8 }}>
            Distribución por estatus · {loading ? '—' : legStats.total}
          </div>
          <div aria-hidden="true" className="flex" style={{ height: 12, borderRadius: 999, overflow: 'hidden', border: `1px solid ${L.line2}`, background: L.panel }}>
            {dist.map(d => (
              <div key={d[0]} className="motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${(d[1] / distTotal) * 100}%`, background: d[2] }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5" style={{ marginTop: 10 }}>
            {dist.map(d => (
              <span key={d[0]} className="font-mono inline-flex items-center gap-1.5" style={{ fontSize: 11, color: L.body, letterSpacing: '0.04em' }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: d[2] }} />{d[0]} <b style={{ color: L.ink }}>{loading ? '—' : d[1]}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* cards enriquecidas */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-9">
          <h3 className="font-sans-tech text-base font-semibold sm:col-span-2 lg:col-span-3" style={{ color: L.ink }}>Iniciativas más recientes</h3>
          {cards.map((it, idx) => {
            const [label, c] = stageOf(it.status);
            const verificada = it.estadoVerificacion === 'verificado';
            const verificacion = verificada ? 'Verificada con IA'
              : it.estadoVerificacion === 'revision' ? 'Verificación en revisión' : 'Verificación pendiente';
            return (
              <Link key={it.id || idx} href={`/legislacion/${it.id}`} className="group relative flex overflow-hidden rounded-xl hover:shadow-lg motion-safe:transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2855E0]" style={{ background: L.panel, border: `1px solid ${L.line2}` }}>
                <div style={{ width: 5, background: c, flex: 'none' }} />
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase inline-flex items-center gap-1.5" style={{ fontSize: 11, letterSpacing: '0.07em', color: c, fontWeight: 600, padding: '4px 10px', border: `1px solid ${c}40`, background: `${c}0D`, borderRadius: 999 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: c, boxShadow: `0 0 6px ${c}88` }} />{label}
                    </span>
                  </div>
                  <h4 className="font-sans-tech line-clamp-4 break-words sm:line-clamp-3 group-hover:underline group-focus-visible:underline decoration-[#2855E0]/40 underline-offset-2" style={{ margin: '14px 0 0', fontSize: 17, fontWeight: 600, lineHeight: 1.35, color: L.ink, letterSpacing: '-0.01em' }}>
                    {it.titulo}
                  </h4>
                  <div className="font-sans-tech flex items-center gap-1.5 mt-2" style={{ fontSize: 13, color: L.body }}>
                    {verificada && <ShieldCheck aria-hidden="true" size={14} style={{ color: L.green }} />}
                    {verificacion}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center gap-2.5 border-t pt-3" style={{ borderColor: L.line }}>
                      <span aria-hidden="true" className="font-mono" style={{ width: 26, height: 26, borderRadius: 999, background: `${c}18`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, flex: 'none' }}>{iniciales(it.proponente)}</span>
                      <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                        <div className="font-sans-tech truncate" style={{ fontSize: 12.5, color: L.body, fontWeight: 500 }}>{it.proponente || 'Sin proponente'}</div>
                        <div className="font-mono" style={{ fontSize: 11, color: L.mute, letterSpacing: '0.025em', marginTop: 2 }}>{[it.camara ? it.camara.toUpperCase() : null, fechaMes(it.fecha)].filter(Boolean).join(' · ')}</div>
                      </div>
                      <ArrowRight aria-hidden="true" className="ml-auto shrink-0" size={16} style={{ color: L.blue }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* footer: CTA + verificadas */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-9">
        <Link href="/legislacion" className="inline-flex min-h-11 items-center gap-2.5 font-mono uppercase hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2855E0]" style={{ padding: '13px 24px', background: L.ink, color: '#fff', borderRadius: 8, fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, boxShadow: '0 10px 28px -12px rgba(11,18,32,0.5)' }}>
          <Scale aria-hidden="true" size={15} /> Ver todas las iniciativas <ArrowRight aria-hidden="true" size={14} />
        </Link>
        <span className="font-mono inline-flex items-center gap-2" style={{ fontSize: 11.5, letterSpacing: '0.04em', color: L.mute }}>
          <ShieldCheck size={15} style={{ color: L.green }} />
          <b style={{ color: L.ink, fontWeight: 600 }}>{loading ? '—' : legStats.verificadas}</b> iniciativas verificadas con IA
        </span>
      </div>
    </div>
  );
}
