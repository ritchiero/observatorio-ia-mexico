'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActividadLog } from '@/types';
import ActividadFeedEn from '@/components/ActividadFeedEn';

// Groups the feed's raw types into filter-friendly categories.
const GRUPOS: { key: string; label: string; tipos: string[] }[] = [
  { key: 'deteccion', label: 'Detections and updates', tipos: ['actualizacion', 'nuevo_anuncio'] },
  { key: 'status', label: 'Status changes', tipos: ['cambio_status'] },
  { key: 'agente', label: 'Agent runs', tipos: ['agente_ejecuta', 'agente_ejecutado', 'agente_parcial', 'agente_fallo'] },
  { key: 'manual', label: 'Additions and edits', tipos: ['anuncio_manual', 'edicion_manual'] },
];

export default function HistorialPageEn() {
  const [actividad, setActividad] = useState<ActividadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('todos');

  useEffect(() => {
    // request the full history (the endpoint caps at 500)
    fetch('/api/actividad?limit=500')
      .then((res) => res.json())
      .then((data) => {
        setActividad(data.actividad || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading history:', err);
        setLoading(false);
      });
  }, []);

  const tipoEn = (a: ActividadLog, tipos: string[]) => tipos.includes(a.tipo as unknown as string);

  const conteos = useMemo(() => {
    const c: Record<string, number> = { todos: actividad.length };
    for (const g of GRUPOS) c[g.key] = actividad.filter((a) => tipoEn(a, g.tipos)).length;
    return c;
  }, [actividad]);

  const filtrada = useMemo(() => {
    if (filtro === 'todos') return actividad;
    const grupo = GRUPOS.find((g) => g.key === filtro);
    return grupo ? actividad.filter((a) => tipoEn(a, grupo.tipos)) : actividad;
  }, [actividad, filtro]);

  const rango = useMemo(() => {
    const fechas = actividad
      .map((a) => (a.fecha ? new Date(a.fecha as unknown as string) : null))
      .filter((d): d is Date => !!d && !isNaN(d.getTime()));
    if (!fechas.length) return null;
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const min = new Date(Math.min(...fechas.map((d) => d.getTime())));
    const max = new Date(Math.max(...fechas.map((d) => d.getTime())));
    return `${fmt(min)} – ${fmt(max)}`;
  }, [actividad]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-white">
        <div className="text-lg sm:text-xl text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-600 mb-2">Detection log</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-cyan-600">📜</span>
            History
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
            Chronological record of what the Observatory&apos;s automated monitoring detects day by day:
            new announcements, status changes and verified updates. Every event is logged with its date and type —
            silence is recorded too.
          </p>
          {rango && (
            <p className="text-xs text-gray-500 mt-3">
              <span className="font-semibold text-gray-700">{actividad.length}</span> events recorded
              <span className="text-gray-300 mx-1.5">·</span>
              {rango}
            </p>
          )}
        </div>

        {/* Filters by type */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FiltroChip active={filtro === 'todos'} onClick={() => setFiltro('todos')} label="All" count={conteos.todos} />
          {GRUPOS.filter((g) => conteos[g.key] > 0).map((g) => (
            <FiltroChip
              key={g.key}
              active={filtro === g.key}
              onClick={() => setFiltro(g.key)}
              label={g.label}
              count={conteos[g.key]}
            />
          ))}
        </div>

        <ActividadFeedEn actividad={filtrada} />

        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          Source: automated monitoring by the Observatory (AI agents under human coordination). Every finding is
          verified against its source and classified by confidence level before publishing.
        </p>
      </div>
    </div>
  );
}

function FiltroChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
        active
          ? 'bg-cyan-600 text-white border-cyan-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-cyan-300'
      }`}
    >
      {label}
      <span className={`ml-1.5 tabular-nums ${active ? 'text-cyan-100' : 'text-gray-400'}`}>{count}</span>
    </button>
  );
}
