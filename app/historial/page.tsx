'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActividadLog } from '@/types';
import ActividadFeed from '@/components/ActividadFeed';

// Agrupa los tipos crudos del feed en categorías legibles para el filtro.
const GRUPOS: { key: string; label: string; tipos: string[] }[] = [
  { key: 'deteccion', label: 'Detecciones y actualizaciones', tipos: ['actualizacion', 'nuevo_anuncio'] },
  { key: 'status', label: 'Cambios de estatus', tipos: ['cambio_status'] },
  { key: 'agente', label: 'Corridas del agente', tipos: ['agente_ejecuta', 'agente_ejecutado'] },
  { key: 'manual', label: 'Altas y ediciones', tipos: ['anuncio_manual', 'edicion_manual'] },
];

export default function HistorialPage() {
  const [actividad, setActividad] = useState<ActividadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('todos');

  useEffect(() => {
    // pedimos el historial completo (el endpoint tope a 500)
    fetch('/api/actividad?limit=500')
      .then((res) => res.json())
      .then((data) => {
        setActividad(data.actividad || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar historial:', err);
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
    const fmt = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
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
          Cargando historial...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Encabezado */}
        <div className="mb-6">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-600 mb-2">Bitácora de detección</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-cyan-600">📜</span>
            Historial
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
            Registro cronológico de lo que el monitoreo automatizado del Observatorio detecta día a día:
            nuevos anuncios, cambios de estatus y actualizaciones verificadas. Cada evento queda con su fecha y tipo —
            el silencio también se registra.
          </p>
          {rango && (
            <p className="text-xs text-gray-500 mt-3">
              <span className="font-semibold text-gray-700">{actividad.length}</span> eventos registrados
              <span className="text-gray-300 mx-1.5">·</span>
              {rango}
            </p>
          )}
        </div>

        {/* Filtros por tipo */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FiltroChip active={filtro === 'todos'} onClick={() => setFiltro('todos')} label="Todos" count={conteos.todos} />
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

        <ActividadFeed actividad={filtrada} />

        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          Fuente: monitoreo automatizado del Observatorio (agentes de IA bajo coordinación humana). Cada hallazgo se
          verifica contra su fuente y se clasifica por nivel de confianza antes de publicarse.
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
