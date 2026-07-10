'use client';

import { useState } from 'react';
import GrafoEcosistema, { EstadoFilter, PoderFilter } from '@/components/GrafoEcosistema';

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
  const [stats, setStats] = useState<{ anuncios: number; iniciativas: number; casos: number } | null>(null);
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

      {/* Overlay editorial (hero) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 p-5 sm:p-8 bg-gradient-to-b from-[#0B1220]/95 via-[#0B1220]/50 to-transparent">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-400 mb-1.5">
          Prototipo · el mapa vivo
        </p>
        <h1 className="text-xl sm:text-3xl font-semibold text-white max-w-3xl leading-tight">
          Así se conecta la IA del Estado mexicano
        </h1>
        <p className="text-slate-300/90 text-xs sm:text-sm mt-1.5 max-w-2xl">
          Cada punto es un registro real. Pasa el cursor para iluminar su vecindario; haz clic para abrir la ficha.
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
