'use client';

import { useState } from 'react';
import GrafoEcosistema from '@/components/GrafoEcosistema';

export default function GrafoPage() {
  const [stats, setStats] = useState<{ anuncios: number; iniciativas: number; casos: number } | null>(null);

  return (
    <div className="relative h-[calc(100dvh-4rem)] min-h-[560px] bg-[#0B1220] overflow-hidden">
      {/* Grafo a pantalla completa */}
      <div className="absolute inset-0">
        <GrafoEcosistema onStats={setStats} />
      </div>

      {/* Overlay editorial (hero) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-b from-[#0B1220]/90 via-[#0B1220]/40 to-transparent">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-400 mb-2">
          Prototipo · el mapa vivo
        </p>
        <h1 className="text-2xl sm:text-4xl font-semibold text-white max-w-3xl leading-tight">
          Así se conecta la IA del Estado mexicano
        </h1>
        <p className="text-slate-300/90 text-sm sm:text-base mt-2 max-w-2xl">
          Cada punto es un registro real del Observatorio. Las líneas son relaciones que ya viven en los datos:
          quién lo opera, dónde se legisla, qué tema lo atraviesa. Pasa el cursor para iluminar un vecindario;
          haz clic para abrir la ficha.
        </p>
        {stats && (
          <div className="flex flex-wrap gap-2 mt-4 pointer-events-auto">
            <Chip color="#22d3ee" label={`${stats.anuncios} anuncios · Ejecutivo`} />
            <Chip color="#7ea2ff" label={`${stats.iniciativas} iniciativas · Legislativo`} />
            <Chip color="#c084fc" label={`${stats.casos} precedentes · Judicial`} />
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="pointer-events-none absolute right-4 bottom-4 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 backdrop-blur">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Leyenda</div>
        <Leg color="#22d3ee" t="Anuncio (Ejecutivo)" />
        <Leg color="#7ea2ff" t="Iniciativa / cámara (Legislativo)" />
        <Leg color="#c084fc" t="Precedente (Judicial)" />
        <Leg color="#34d399" t="Tema — puente entre poderes" />
        <Leg color="#94a3b8" t="Dependencia / actor" />
      </div>
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 backdrop-blur"
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
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
