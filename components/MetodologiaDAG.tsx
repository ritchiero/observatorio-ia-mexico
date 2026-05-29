'use client';

// Sección Metodología — diseño "DAG Flow (Light)" elegido por Ricardo.
// Tema claro. Desktop (lg+): diagrama de flujo DAG animado (verticales → pipeline).
// Tablet/móvil (<lg): versión apilada equivalente. Conteos en vivo desde props.

const C = {
  bg: '#F4F6FB', panel: '#FFFFFF', ink: '#0B1220', body: '#3B475C',
  mute: '#6B7689', faint: '#A2ABBE', line: '#E5E9F2', line2: '#CED6E6',
  cyan: '#0E94C0', blue: '#2855E0', green: '#0E9E63', violet: '#7A3FB8',
};

interface Props {
  anuncios: number;
  iniciativas: number;
  casos: number;
}

type Vertical = {
  id: string; code: string; accent: string; title: string; cat: string; n: number;
  desc: string; sources: [string, string][];
};

function IconAnnounce({ s = 22, c, w = 1.5 }: { s?: number; c: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11v2a1 1 0 0 0 1 1h3l4 4V6L7 10H4a1 1 0 0 0-1 1z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M19 6a7 7 0 0 1 0 12" />
    </svg>
  );
}
function IconLegis({ s = 22, c, w = 1.5 }: { s?: number; c: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-2.5 6a3 3 0 0 0 5 0L5 7z" /><path d="M19 7l-2.5 6a3 3 0 0 0 5 0L19 7z" /><path d="M8 21h8" />
    </svg>
  );
}
function IconLitig({ s = 22, c, w = 1.5 }: { s?: number; c: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" /><path d="M5 21V10" /><path d="M19 21V10" /><path d="M9 21v-7" /><path d="M15 21v-7" /><path d="M12 3 3.5 8h17L12 3z" />
    </svg>
  );
}
const ICONS = [IconAnnounce, IconLegis, IconLitig];

function Check({ s = 18, c = '#fff', w = 2.5 }: { s?: number; c?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
  );
}

const STEPS = [
  { n: '1', verb: 'INGEST', title: 'Detección en fuentes oficiales', accent: C.cyan },
  { n: '2', verb: 'EXTRACT', title: 'Extracción de datos clave', accent: C.blue },
  { n: '3', verb: 'AUDIT', title: 'Verificación humana', accent: C.violet },
  { n: '✓', verb: 'PUBLISH', title: 'Publicación con citas', accent: C.green },
];

// Niveles de confianza por dato (espejo de lib/nivelConfianza.ts, en lenguaje público).
const TIERS: { key: string; color: string; label: string; desc: string }[] = [
  { key: 'oficial', color: C.green, label: 'Fuente oficial', desc: 'Verificado contra una fuente gubernamental o judicial: gob.mx, DOF, SCJN/SJF, congresos u organismos públicos.' },
  { key: 'documentada', color: C.cyan, label: 'Fuente documentada', desc: 'Respaldado por fuente pública verificable (p. ej. diario de circulación nacional), pendiente de corroboración oficial.' },
  { key: 'sin_verificar', color: '#C77E12', label: 'Sin fuente citada', desc: 'Marcador interno. No publicamos datos sin al menos una fuente citada y accesible.' },
];

export default function MetodologiaDAG({ anuncios, iniciativas, casos }: Props) {
  const VERTICALS: Vertical[] = [
    {
      id: '01', code: 'ANNOUNCE', accent: C.cyan, title: 'Anuncios Oficiales', cat: 'Gobierno · Comunicación', n: anuncios,
      desc: 'Promesas gubernamentales sobre proyectos de IA: laboratorios, plataformas, inversiones.',
      sources: [['Conferencias matutinas', 'GOB'], ['Diario Oficial de la Federación', 'DOF'], ['Comunicados de dependencias', 'SHCP']],
    },
    {
      id: '02', code: 'LEGIS', accent: C.green, title: 'Legislación en IA', cat: 'Congreso · Normativa', n: iniciativas,
      desc: 'Iniciativas de ley federales y estatales que regulan o mencionan inteligencia artificial.',
      sources: [['Gaceta Parlamentaria', 'DIP'], ['Sistema de Información Legislativa', 'SIL'], ['Congresos estatales', '32 ENT']],
    },
    {
      id: '03', code: 'LITIG', accent: C.violet, title: 'Casos Judiciales', cat: 'Poder Judicial · Litigio', n: casos,
      desc: 'Precedentes donde la IA es objeto del litigio o herramienta del proceso judicial.',
      sources: [['Semanario Judicial de la Federación', 'SJF'], ['Portal de la SCJN', 'SCJN'], ['Tribunales Colegiados y TFJA', 'TFJA']],
    },
  ];
  const reg = (n: number) => (n > 0 ? n : '—');

  return (
    <div className="relative overflow-hidden" style={{ color: C.ink }}>
      {/* grid sutil */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${C.line2}55 1px, transparent 1px), linear-gradient(90deg, ${C.line2}55 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 0%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse at 50% 30%, #000 0%, transparent 80%)',
      }} />
      {/* washes de color */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 40% 40% at 18% 25%, rgba(14,148,192,0.07), transparent 60%), radial-gradient(ellipse 40% 40% at 82% 75%, rgba(122,63,184,0.06), transparent 60%)`,
      }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* header */}
        <header className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2.5 font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.26em', color: C.cyan, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: C.cyan, boxShadow: `0 0 8px ${C.cyan}80`, animation: 'glass-pulse 2s ease-in-out infinite' }} />
            Metodología · Pipeline
            <span className="hidden sm:inline" style={{ width: 28, height: 1, background: C.line2 }} />
            <span className="hidden sm:inline">03 verticales</span>
          </div>
          <h2 className="font-serif-display" style={{ margin: '18px 0 0', fontWeight: 500, fontSize: 'clamp(34px, 6vw, 60px)', lineHeight: 1.0, letterSpacing: '-0.035em', color: C.ink }}>
            Metodología del <em style={{ fontStyle: 'italic', fontWeight: 400, color: C.cyan }}>Observatorio</em>
          </h2>
          <p className="font-serif-display" style={{ margin: '18px auto 0', maxWidth: 600, fontSize: 'clamp(16px,2.2vw,18px)', lineHeight: 1.5, color: C.body }}>
            Tres verticales de monitoreo con <b style={{ color: C.cyan, fontWeight: 500 }}>fuentes oficiales verificables</b>, validadas por un pipeline auditable con verificación humana.
          </p>
        </header>

        {/* ===== DESKTOP: diagrama DAG ===== */}
        <div className="hidden lg:block mt-14 relative">
          <svg viewBox="0 0 1160 360" style={{ width: '100%', display: 'block' }} aria-hidden="true">
            <defs>
              <marker id="dagArr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill={C.faint} /></marker>
            </defs>
            {[60, 180, 300].map((y, i) => (
              <path key={i} d={`M 300 ${y} C 384 ${y}, 384 180, 440 180`} fill="none" stroke={[C.cyan, C.green, C.violet][i]} strokeOpacity="0.55" strokeWidth="1.6" markerEnd="url(#dagArr)" />
            ))}
            {STEPS.map((s, i) => i < STEPS.length - 1 && (
              <line key={i} x1={490 + i * 150} y1="180" x2={560 + i * 150} y2="180" stroke={C.line2} strokeWidth="1.6" markerEnd="url(#dagArr)" strokeDasharray="3 4" />
            ))}
            {[60, 180, 300].map((y, i) => (
              <circle key={'pk' + i} r="3.4" fill={[C.cyan, C.green, C.violet][i]} style={{ filter: `drop-shadow(0 0 5px ${[C.cyan, C.green, C.violet][i]}99)` }}>
                <animateMotion dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} path={`M 300 ${y} C 384 ${y}, 384 180, 440 180`} />
                <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
              </circle>
            ))}
            {STEPS.slice(0, 3).map((s, i) => (
              <circle key={'pp' + i} r="3" fill={C.blue} style={{ filter: `drop-shadow(0 0 5px ${C.blue}99)` }}>
                <animate attributeName="cx" values={`${490 + i * 150};${560 + i * 150}`} dur="1.6s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                <animate attributeName="cy" values="180;180" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
              </circle>
            ))}
          </svg>

          {/* overlay nodes */}
          <div className="absolute inset-0">
            {VERTICALS.map((v, i) => {
              const Icon = ICONS[i];
              const top = [`${60 / 360 * 100}%`, `${180 / 360 * 100}%`, `${300 / 360 * 100}%`][i];
              return (
                <div key={v.id} style={{ position: 'absolute', left: 0, top, transform: 'translateY(-50%)', width: '24%' }}>
                  <div style={{ border: `1px solid ${v.accent}40`, background: C.panel, borderRadius: 12, padding: '13px 15px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: `0 6px 20px -10px ${v.accent}55, 0 1px 0 rgba(255,255,255,0.7)` }}>
                    <span style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${v.accent}40`, background: `${v.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon s={18} c={v.accent} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="font-sans-tech" style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{v.title}</div>
                      <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: v.accent, marginTop: 3, fontWeight: 600 }}>{v.code} · {reg(v.n)} REGS</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {STEPS.map((s, i) => (
              <div key={i} style={{ position: 'absolute', left: `${(440 + i * 150) / 1160 * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div className="font-mono" style={{ width: 50, height: 50, borderRadius: 999, border: `1.5px solid ${s.accent}`, background: i === 3 ? s.accent : C.panel, color: i === 3 ? '#fff' : s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, margin: '0 auto', boxShadow: `0 8px 22px -8px ${s.accent}88, 0 0 0 6px ${s.accent}12` }}>
                  {s.n === '✓' ? <Check c="#fff" /> : s.n}
                </div>
                <div className="font-mono" style={{ fontSize: 8.5, letterSpacing: '0.16em', color: s.accent, marginTop: 9, fontWeight: 700 }}>{s.verb}</div>
                <div className="font-sans-tech" style={{ fontSize: 11.5, color: C.body, marginTop: 4, width: 110, marginLeft: -30, fontWeight: 500, lineHeight: 1.25 }}>{s.title}</div>
              </div>
            ))}
            <div className="font-mono" style={{ position: 'absolute', left: `${440 / 1160 * 100}%`, top: '50%', transform: 'translate(-50%, -82px)', fontSize: 9, letterSpacing: '0.18em', color: C.faint, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>▼ INGRESO</div>
          </div>
        </div>

        {/* ===== TABLET/MÓVIL: versión apilada ===== */}
        <div className="lg:hidden mt-10 space-y-8">
          {/* verticales como cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VERTICALS.map((v, i) => {
              const Icon = ICONS[i];
              return (
                <div key={v.id} style={{ border: `1px solid ${v.accent}33`, background: C.panel, borderRadius: 16, padding: 18, boxShadow: `0 8px 24px -16px ${v.accent}66` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ width: 40, height: 40, borderRadius: 11, border: `1px solid ${v.accent}40`, background: `${v.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon s={20} c={v.accent} /></span>
                    <div>
                      <div className="font-sans-tech" style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{v.title}</div>
                      <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: '0.14em', color: v.accent, marginTop: 2, fontWeight: 600 }}>{v.code} · {reg(v.n)} REGS</div>
                    </div>
                  </div>
                  <p className="font-sans-tech" style={{ fontSize: 13, lineHeight: 1.5, color: C.body, margin: '0 0 12px' }}>{v.desc}</p>
                  <div className="space-y-1.5">
                    {v.sources.map(([name, tag]) => (
                      <div key={name} className="flex items-center gap-2" style={{ fontSize: 11.5, color: C.mute }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: v.accent, flex: 'none' }} />
                        <span className="font-sans-tech" style={{ flex: 1 }}>{name}</span>
                        <span className="font-mono" style={{ fontSize: 8.5, letterSpacing: '0.1em', color: C.faint }}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* pipeline apilado */}
          <div style={{ border: `1px solid ${C.line}`, background: C.panel, borderRadius: 16, padding: '20px 16px' }}>
            <div className="font-mono text-center" style={{ fontSize: 10, letterSpacing: '0.2em', color: C.faint, textTransform: 'uppercase', marginBottom: 16 }}>Pipeline de verificación</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {STEPS.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-mono" style={{ width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${s.accent}`, background: i === 3 ? s.accent : C.panel, color: i === 3 ? '#fff' : s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, margin: '0 auto', boxShadow: `0 0 0 6px ${s.accent}12` }}>
                    {s.n === '✓' ? <Check c="#fff" /> : s.n}
                  </div>
                  <div className="font-mono" style={{ fontSize: 8.5, letterSpacing: '0.16em', color: s.accent, marginTop: 8, fontWeight: 700 }}>{s.verb}</div>
                  <div className="font-sans-tech" style={{ fontSize: 11.5, color: C.body, marginTop: 3, fontWeight: 500, lineHeight: 1.25 }}>{s.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Fuentes & nivel de confianza ===== */}
        <div className="mt-14" style={{ borderTop: `1px solid ${C.line}`, paddingTop: 40 }}>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2.5 font-mono uppercase" style={{ fontSize: 11, letterSpacing: '0.26em', color: C.green, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: C.green, boxShadow: `0 0 8px ${C.green}80` }} />
              Trazabilidad
            </div>
            <h3 className="font-serif-display" style={{ margin: '14px 0 0', fontWeight: 500, fontSize: 'clamp(24px,4vw,36px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: C.ink }}>
              Fuentes y <em style={{ fontStyle: 'italic', fontWeight: 400, color: C.green }}>nivel de confianza</em>
            </h3>
            <p className="font-serif-display" style={{ margin: '14px auto 0', maxWidth: 640, fontSize: 'clamp(15px,2vw,17px)', lineHeight: 1.55, color: C.body }}>
              Cada registro se publica con su fuente citada. Priorizamos fuentes oficiales; los diarios de circulación nacional sirven solo como respaldo, <b style={{ color: C.ink, fontWeight: 500 }}>nunca un sitio no oficial como fuente única</b>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-5xl mx-auto">
            {TIERS.map((t) => (
              <div key={t.key} style={{ border: `1px solid ${C.line2}`, background: C.panel, borderRadius: 14, padding: 18, boxShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>
                <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: t.color, boxShadow: `0 0 8px ${t.color}66`, flex: 'none' }} />
                  <span className="font-sans-tech" style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{t.label}</span>
                </div>
                <p className="font-sans-tech" style={{ fontSize: 12.5, lineHeight: 1.5, color: C.mute, margin: 0 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* footer strip — afirmaciones reales + Powered by Claude */}
        <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
          {([['Monitoreo automatizado', C.green], ['IA + verificación humana', C.cyan], ['Fuentes oficiales verificables', C.violet]] as [string, string][]).map(([t, col], i) => (
            <span key={i} className="font-mono uppercase" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 15px', border: `1px solid ${C.line2}`, borderRadius: 999, background: C.panel, fontSize: 10.5, letterSpacing: '0.1em', color: C.body, fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: col, boxShadow: `0 0 8px ${col}66` }} />{t}
            </span>
          ))}
          <span className="font-mono inline-flex items-center gap-1.5" style={{ fontSize: 10.5, color: C.faint, letterSpacing: '0.08em' }}>
            Powered by
            <img src="https://ik.imagekit.io/lawgic/Claude%20(1).png" alt="Claude AI" className="h-4 w-auto inline-block align-middle" />
          </span>
        </div>
      </div>
    </div>
  );
}
