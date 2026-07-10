'use client';

import { useState } from 'react';
import Link from 'next/link';
import GrafoEcosistema, { EstadoFilter, PoderFilter } from '@/components/GrafoEcosistema';

// tokens de la skin glass del hero de la home (misma marca, mismo evento)
const T = {
  void: '#05070C', text: '#E7ECF7', body: '#B5BFD4',
  cyan: '#3DE0FF', blue: '#4D7BFF', violet: '#A47CFF',
};

function IrisMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs><linearGradient id="grafoIris" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#3DE0FF" /><stop offset="1" stopColor="#4D7BFF" /></linearGradient></defs>
      <path d="M6 50 Q50 24 94 50 Q50 76 6 50 Z" stroke="#48556F" strokeWidth="4" />
      <circle cx="50" cy="50" r="21" stroke="url(#grafoIris)" strokeWidth="6" strokeDasharray="11 8" />
      <circle cx="50" cy="50" r="9" fill="url(#grafoIris)" />
    </svg>
  );
}

const PODER_META: { key: keyof PoderFilter; label: string; color: string }[] = [
  { key: 'anuncio', label: 'Ejecutivo', color: '#22d3ee' },
  { key: 'iniciativa', label: 'Legislativo', color: '#7ea2ff' },
  { key: 'caso', label: 'Judicial', color: '#c084fc' },
];
const ESTADOS: { key: EstadoFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'nuevo', label: 'Nuevos' },
  { key: 'vigente', label: 'Vigentes' },
  { key: 'tramite', label: 'En trámite' },
  { key: 'inactivo', label: 'Inactivos' },
];

export default function GrafoPage() {
  const [stats, setStats] = useState<{ anuncios: number; iniciativas: number; casos: number; comunidades?: number } | null>(null);
  const [poderes, setPoderes] = useState<PoderFilter>({ anuncio: true, iniciativa: true, caso: true });
  const [estado, setEstado] = useState<EstadoFilter>('todos');

  const togglePoder = (k: keyof PoderFilter) =>
    setPoderes((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="relative h-[calc(100dvh-4rem)] min-h-[560px] bg-[#0B1220] overflow-hidden">
      {/* Grafo a pantalla completa */}
      <div className="absolute inset-0">
        <GrafoEcosistema onStats={setStats} poderes={poderes} estado={estado} />
      </div>

      {/* Overlay hero: primero QUIÉN (Observatorio) y QUÉ PELEA; el mapa es la prueba */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 p-5 sm:p-8 bg-gradient-to-b from-[#0B1220]/95 via-[#0B1220]/55 to-transparent">
        {/* marca hero-level (misma lockup de la home) */}
        <Link href="/" className="pointer-events-auto inline-flex items-center gap-3 group">
          <span className="transition-transform duration-300 group-hover:rotate-[8deg]"><IrisMark /></span>
          <span className="flex flex-col leading-none">
            <span className="font-mono uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: '0.28em', color: T.cyan }}>Observatorio · v.2026</span>
            <span className="font-sans-tech uppercase" style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: '0.04em' }}>IA México</span>
          </span>
        </Link>

        {/* voz de campaña + qué estás viendo */}
        <h1 className="font-serif-display mt-3" style={{ fontSize: 'clamp(26px, 4.2vw, 46px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 500, color: T.text, maxWidth: 720 }}>
          La gran ilusión{' '}
          <span style={{ fontStyle: 'italic', fontWeight: 400,
            background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 50%, ${T.violet} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            artificial del estado
          </span>
          , en un mapa.
        </h1>
        <p className="font-mono uppercase mt-2" style={{ fontSize: 10, letterSpacing: '0.18em', color: T.body }}>
          Monitoreo ciudadano de la IA en el Estado mexicano · datos reales
        </p>
        <p className="text-slate-300/90 text-xs sm:text-sm mt-1.5 max-w-2xl">
          Cada punto es un registro real del Estado. Pasa el cursor para iluminar su vecindario; haz clic para leer el apunte.
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pointer-events-auto">
          {PODER_META.map((p) => {
            const on = poderes[p.key];
            const count = stats
              ? p.key === 'anuncio' ? stats.anuncios : p.key === 'iniciativa' ? stats.iniciativas : stats.casos
              : null;
            return (
              <button
                key={p.key}
                data-testid={`f-${p.key}`}
                onClick={() => togglePoder(p.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur transition-all ${
                  on
                    ? 'border-slate-500/80 bg-slate-800/80 text-slate-100'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500 line-through'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: on ? p.color : '#475569' }} />
                {p.label}
                {count !== null && <span className="text-slate-400 tabular-nums">{count}</span>}
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px bg-slate-700/70 hidden sm:block" />

          <div className="inline-flex rounded-full border border-slate-700/70 bg-slate-900/70 p-0.5 backdrop-blur">
            {ESTADOS.map((e) => (
              <button
                key={e.key}
                data-testid={`f-estado-${e.key}`}
                onClick={() => setEstado(e.key)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
                  estado === e.key ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>

          {stats?.comunidades ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-cyan-200/80 backdrop-blur">
              🏝 {stats.comunidades} islas
            </span>
          ) : null}

          <span className="mx-1 h-4 w-px bg-slate-700/70 hidden sm:block" />

          <Link
            href="/informe-2026"
            className="font-sans-tech uppercase inline-flex items-center gap-2 transition-transform hover:scale-[1.04]"
            style={{
              fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, color: T.void,
              padding: '7px 14px', borderRadius: 100,
              background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)`,
              boxShadow: `0 6px 24px ${T.cyan}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}
          >
            Informe 2026
            <span style={{ width: 5, height: 5, borderRadius: 999, background: T.void }} />
          </Link>
        </div>
      </div>

      {/* Leyenda */}
      <div className="pointer-events-none absolute right-4 bottom-4 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 backdrop-blur hidden sm:block">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Leyenda</div>
        <Leg color="#22d3ee" t="Anuncio (Ejecutivo)" />
        <Leg color="#7ea2ff" t="Iniciativa / cámara (Legislativo)" />
        <Leg color="#c084fc" t="Precedente (Judicial)" />
        <Leg color="#34d399" t="Tema — puente entre poderes" />
        <Leg color="#94a3b8" t="Dependencia / actor" />
        <div className="mt-1 text-[10px] text-slate-500">anillo = nuevo · tenue = inactivo</div>
      </div>
    </div>
  );
}

function Leg({ color, t }: { color: string; t: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-300 leading-relaxed">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
      {t}
    </div>
  );
}
