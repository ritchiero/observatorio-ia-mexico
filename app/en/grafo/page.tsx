'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import GrafoEcosistema, { EstadoFilter, NodoLite, PoderFilter } from '@/components/GrafoEcosistema';
import { PLAYBACK_INICIO, visibleEnAnio } from '@/lib/grafo-tiempo';

// Twin en inglés de app/grafo/page.tsx — misma lógica, mismos datos, strings en inglés.
// El buscador manda lang:'en' a /api/grafo/buscar para respuesta y fast-path en inglés.

const T = {
  void: '#05070C', text: '#E7ECF7', body: '#B5BFD4',
  cyan: '#3DE0FF', blue: '#4D7BFF', violet: '#A47CFF',
};

function IrisMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs><linearGradient id="grafoIrisEn" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#3DE0FF" /><stop offset="1" stopColor="#4D7BFF" /></linearGradient></defs>
      <path d="M6 50 Q50 24 94 50 Q50 76 6 50 Z" stroke="#48556F" strokeWidth="4" />
      <circle cx="50" cy="50" r="21" stroke="url(#grafoIrisEn)" strokeWidth="6" strokeDasharray="11 8" />
      <circle cx="50" cy="50" r="9" fill="url(#grafoIrisEn)" />
    </svg>
  );
}

const PODER_COLOR: Record<string, string> = {
  anuncio: '#22d3ee', iniciativa: '#7ea2ff', caso: '#c084fc',
  actor: '#94a3b8', camara: '#7ea2ff', tema: '#34d399', persona: '#fbbf24',
};
const PODER_META: { key: keyof PoderFilter; label: string; color: string }[] = [
  { key: 'anuncio', label: 'Executive', color: '#22d3ee' },
  { key: 'iniciativa', label: 'Legislative', color: '#7ea2ff' },
  { key: 'caso', label: 'Judicial', color: '#c084fc' },
];
const ESTADOS: { key: EstadoFilter; label: string }[] = [
  { key: 'todos', label: 'All' },
  { key: 'nuevo', label: 'New' },
  { key: 'vigente', label: 'Active' },
  { key: 'tramite', label: 'In progress' },
  { key: 'inactivo', label: 'Inactive' },
];

export default function GrafoPageEn() {
  const [stats, setStats] = useState<{
    anuncios: number; iniciativas: number; casos: number; comunidades?: number;
    anual?: { porAnio: Record<string, { anuncios: number; iniciativas: number; casos: number }>; sinFecha: { anuncios: number; iniciativas: number; casos: number } };
  } | null>(null);
  const [poderes, setPoderes] = useState<PoderFilter>({ anuncio: true, iniciativa: true, caso: true });
  const [estado, setEstado] = useState<EstadoFilter>('todos');
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  const [nodos, setNodos] = useState<NodoLite[]>([]);
  const [query, setQuery] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<{ respuesta: string; nodos: { id: string; label: string; type: string }[] } | null>(null);
  const [spotlight, setSpotlight] = useState<string[] | null>(null);
  const [travel, setTravel] = useState<{ id: string; t: number } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [historia, setHistoria] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ANIO_ACTUAL = useMemo(() => {
    const hoy = new Date().getFullYear();
    const ys = Object.keys(stats?.anual?.porAnio ?? {}).map(Number).filter(Number.isFinite);
    return ys.length ? Math.min(Math.max(...ys), hoy) : hoy;
  }, [stats]);
  const [anio, setAnio] = useState(ANIO_ACTUAL);
  const estadoGuardado = useRef<EstadoFilter>('todos');

  const [periodo, setPeriodo] = useState<{ desde: number; hasta: number } | null>(null);
  const [periodoOpen, setPeriodoOpen] = useState(false);
  const periodoGuardado = useRef<{ desde: number; hasta: number } | null>(null);
  const periodoRef = useRef<HTMLDivElement>(null);
  const [viewIds, setViewIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (!periodoOpen) return;
    const onDown = (e: PointerEvent) => {
      if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setPeriodoOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [periodoOpen]);
  const ANIOS = useMemo(() => {
    const ys = Object.keys(stats?.anual?.porAnio ?? {}).map(Number).filter(Number.isFinite);
    if (!ys.length) return [];
    const [min, max] = [Math.min(...ys), Math.max(...ys)];
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [stats]);
  const sumaPeriodo = (p: { desde: number; hasta: number }) => {
    const acc = { anuncios: 0, iniciativas: 0, casos: 0 };
    for (const [k, v] of Object.entries(stats?.anual?.porAnio ?? {})) {
      const y = Number(k);
      if (y >= p.desde && y <= p.hasta) { acc.anuncios += v.anuncios; acc.iniciativas += v.iniciativas; acc.casos += v.casos; }
    }
    return acc;
  };
  const rango = (desde: number, hasta: number) =>
    desde === ANIOS[0] && hasta === ANIOS[ANIOS.length - 1] ? null : { desde, hasta };
  const setDesde = (d: number) => setPeriodo((p) => rango(d, Math.max(d, p?.hasta ?? ANIOS[ANIOS.length - 1])));
  const setHasta = (h: number) => setPeriodo((p) => rango(Math.min(h, p?.desde ?? ANIOS[0]), h));
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const anioVacio = (y: number) => {
    const r = stats?.anual?.porAnio?.[String(y)];
    return !r || (r.anuncios + r.iniciativas + r.casos === 0);
  };
  const acumuladoHasta = (y: number) => {
    const acc = { anuncios: 0, iniciativas: 0, casos: 0 };
    const porAnio = stats?.anual?.porAnio ?? {};
    for (const [k, v] of Object.entries(porAnio)) {
      if (Number(k) <= y) { acc.anuncios += v.anuncios; acc.iniciativas += v.iniciativas; acc.casos += v.casos; }
    }
    return acc;
  };
  const abrirHistoria = () => {
    estadoGuardado.current = estado;
    periodoGuardado.current = periodo;
    setEstado('todos');
    setPeriodo(null);
    setPeriodoOpen(false);
    setAnio(ANIO_ACTUAL);
    setHistoria(true);
    limpiarAi();
  };
  const cerrarHistoria = () => {
    setHistoria(false);
    setPlaying(false);
    setAnio(ANIO_ACTUAL);
    setEstado(estadoGuardado.current);
    setPeriodo(periodoGuardado.current);
  };
  const play = () => {
    if (reducedMotion) return;
    if (anio >= ANIO_ACTUAL) setAnio(PLAYBACK_INICIO);
    setPlaying(true);
  };
  useEffect(() => {
    if (!historia || !playing) return;
    if (anio >= ANIO_ACTUAL) { setPlaying(false); return; }
    const dur = anioVacio(anio) ? 350 : 1000;
    const t = setTimeout(() => setAnio((y) => Math.min(y + 1, ANIO_ACTUAL)), dur);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historia, playing, anio, ANIO_ACTUAL]);

  const corte = historia && anio < ANIO_ACTUAL ? anio : null;

  const slug = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ITEMS = useMemo(() => new Set(['anuncio', 'iniciativa', 'caso']), []);
  const results = useMemo(() => {
    const q = slug(query.trim());
    if (q.length < 2) return [];
    const hit = (n: NodoLite) =>
      slug(n.label).includes(q) || slug(n.communityLabel ?? '').includes(q) || slug(n.desc ?? '').includes(q);
    const enCorte = (n: NodoLite) => visibleEnAnio(n.anio ?? null, corte, ANIO_ACTUAL);
    const enView = (n: NodoLite) => !viewIds || viewIds.has(n.id);
    const hubs = nodos.filter((n) => !ITEMS.has(n.type) && hit(n) && enCorte(n) && enView(n));
    const items = nodos.filter((n) => ITEMS.has(n.type) && hit(n) && enCorte(n) && enView(n));
    return [...hubs, ...items].slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodos, query, ITEMS, corte, ANIO_ACTUAL, viewIds]);

  const irA = (id: string) => {
    setQuery('');
    setTravel({ id, t: Date.now() });
  };

  const preguntar = async () => {
    const q = query.trim();
    if (corte !== null) return;
    if (q.length < 3 || aiBusy) return;
    setAiBusy(true);
    try {
      const r = await fetch('/api/grafo/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, lang: 'en' }),
      });
      const d = await r.json();
      if (!r.ok) {
        setAi({ respuesta: d?.error ?? 'The search is unavailable right now.', nodos: [] });
        setSpotlight(null);
      } else {
        setAi({ respuesta: d.respuesta, nodos: d.nodos ?? [] });
        setSpotlight((d.nodos ?? []).map((n: { id: string }) => n.id));
      }
    } catch {
      setAi({ respuesta: 'Could not reach the search.', nodos: [] });
    } finally {
      setAiBusy(false);
    }
  };

  const limpiarAi = () => { setAi(null); setSpotlight(null); };

  useEffect(() => {
    if (corte !== null || periodo) limpiarAi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corte, periodo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT';
      if (e.key === '/' && !typing) { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key === 'Escape') { limpiarAi(); setQuery(''); setPeriodoOpen(false); searchRef.current?.blur(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePoder = (k: keyof PoderFilter) =>
    setPoderes((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="relative h-[calc(100dvh-4rem)] min-h-[560px] bg-[#0B1220] overflow-hidden">
      <div className="absolute inset-0">
        <GrafoEcosistema onStats={setStats} onNodes={setNodos} onViewIds={setViewIds} spotlight={spotlight} travel={travel} poderes={poderes} estado={estado} periodo={periodo} anio={corte} anioActual={ANIO_ACTUAL} locale="en" />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-b from-[#0B1220]/95 via-[#0B1220]/55 to-transparent">
        <Link href="/en" className="pointer-events-auto inline-flex items-center gap-3 group">
          <span className="transition-transform duration-300 group-hover:rotate-[8deg]"><IrisMark /></span>
          <span className="flex flex-col leading-none">
            <span className="font-mono uppercase font-semibold" style={{ fontSize: 9.5, letterSpacing: '0.28em', color: T.cyan }}>Observatorio · v.2026</span>
            <span className="font-sans-tech uppercase" style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: '0.04em' }}>AI Mexico</span>
          </span>
        </Link>

        <h1 className="font-serif-display mt-3" style={{ fontSize: 'clamp(21px, 6vw, 46px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 500, color: T.text, maxWidth: 720 }}>
          {'AI in '}
          <span style={{ fontStyle: 'italic', fontWeight: 400,
            background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 50%, ${T.violet} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Mexico
          </span>
          , on a living map.
        </h1>
        <p className="font-mono uppercase mt-2" style={{ fontSize: 10, letterSpacing: '0.18em', color: T.body }}>
          Citizen watchdog on AI in the Mexican state · real data
        </p>
        <p className="hidden sm:block text-slate-300/90 text-xs sm:text-sm mt-1.5 max-w-2xl">
          Every dot is a real record from the state. Hover to light up its neighborhood; click to read the note.
        </p>

        <div className="mt-4 max-w-2xl pointer-events-auto relative">
          <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-900/95 px-4 py-1 shadow-[0_0_36px_rgba(61,224,255,0.18)] backdrop-blur focus-within:border-cyan-400/80 focus-within:shadow-[0_0_44px_rgba(61,224,255,0.32)]">
            <span className="text-cyan-300 text-base" aria-hidden>✨</span>
            <input
              ref={searchRef}
              data-testid="grafo-buscar"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (ai) limpiarAi(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); preguntar(); } }}
              placeholder="Ask the map: what's going on with deepfakes? what's live today?…"
              className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
            {corte !== null && (
              <span className="shrink-0 font-mono text-[9px] uppercase text-amber-300/80" title="The AI answers about the present">
                🕰 {anio}
              </span>
            )}
            {corte === null && (
            <button
              onClick={preguntar}
              data-testid="grafo-preguntar"
              className="shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-transform hover:scale-105 disabled:opacity-50"
              disabled={aiBusy}
            >
              {aiBusy ? '…' : 'Ask'}
            </button>
            )}
          </div>

          {results.length > 0 && !ai && !aiBusy && (
            <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900/95 backdrop-blur">
              {results.map((n) => (
                <button
                  key={n.id}
                  onClick={() => irA(n.id)}
                  className="flex w-full items-center gap-2 px-3.5 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800/80"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PODER_COLOR[n.type] ?? '#94a3b8' }} />
                  <span className="truncate">{n.label}</span>
                  <span className="ml-auto shrink-0 font-mono text-[9px] uppercase text-slate-500">{n.type}</span>
                </button>
              ))}
            </div>
          )}

          {(aiBusy || ai) && (
            <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-xl border border-cyan-800/50 bg-slate-900/95 p-3 backdrop-blur">
              {aiBusy ? (
                <div className="flex items-center gap-2 text-xs text-cyan-200/80">
                  <span className="h-3 w-3 animate-spin rounded-full border border-cyan-400 border-t-transparent" />
                  The Observatory is reading the map…
                </div>
              ) : ai && (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">✨ Answer from the map</div>
                    <button onClick={limpiarAi} aria-label="Close" className="rounded px-1 text-slate-400 hover:text-slate-100">✕</button>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200">{ai.respuesta}</p>
                  {ai.nodos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ai.nodos.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => irA(n.id)}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-200 hover:border-cyan-500/50"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PODER_COLOR[n.type] ?? '#94a3b8' }} />
                          <span className="truncate">{n.label.slice(0, 40)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <button
          data-testid="filtros-toggle"
          onClick={() => setFiltrosOpen((o) => !o)}
          className={`sm:hidden mt-2.5 pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] backdrop-blur ${
            historia || periodo || estado !== 'todos' || !poderes.anuncio || !poderes.iniciativa || !poderes.caso
              ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100'
              : 'border-slate-700/70 bg-slate-900/80 text-slate-200'
          }`}
        >
          ☰ Filters
          {historia ? ' · History' : ''}
          {periodo ? ` · ${periodo.desde}–${periodo.hasta}` : ''}
          {estado !== 'todos' ? ` · ${ESTADOS.find((e) => e.key === estado)?.label ?? estado}` : ''}
          <span className="text-slate-400">{filtrosOpen ? '▴' : '▾'}</span>
        </button>

        <div className={`${filtrosOpen ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2 mt-2 sm:mt-3 pointer-events-auto`}>
          {PODER_META.map((p) => {
            const on = poderes[p.key];
            const fuente = corte !== null ? acumuladoHasta(anio) : periodo ? sumaPeriodo(periodo) : stats;
            const count = fuente
              ? p.key === 'anuncio' ? fuente.anuncios : p.key === 'iniciativa' ? fuente.iniciativas : fuente.casos
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
                disabled={historia}
                title={historia ? 'In History mode only the current status exists' : undefined}
                onClick={() => setEstado(e.key)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${
                  estado === e.key ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>

          {ANIOS.length > 0 && (
            <div className="relative" ref={periodoRef}>
              <div
                className={`inline-flex items-center gap-0.5 rounded-full border py-1 text-[11px] backdrop-blur transition-colors ${
                  periodo && !historia ? 'pl-3 pr-1.5' : 'px-3'
                } ${historia ? 'opacity-40' : ''} ${
                  periodo
                    ? 'border-cyan-400/70 bg-cyan-500/15 text-cyan-100'
                    : 'border-slate-700/70 bg-slate-900/70 text-slate-200 hover:border-cyan-400/50'
                }`}
              >
                <button
                  data-testid="f-periodo"
                  disabled={historia}
                  title={historia ? 'In History mode, time is controlled by the playback' : 'Filter by year range'}
                  onClick={() => setPeriodoOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 disabled:cursor-not-allowed"
                >
                  🗓 {periodo ? `${periodo.desde}–${periodo.hasta}` : 'Period'}
                </button>
                {periodo && !historia && (
                  <button
                    aria-label="Remove period filter"
                    onClick={() => { setPeriodo(null); setPeriodoOpen(false); }}
                    className="rounded-full px-1 text-cyan-200/70 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              {periodoOpen && !historia && (
                <div className="absolute left-0 top-full z-50 mt-1 flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/95 px-3 py-2 backdrop-blur">
                  <select
                    data-testid="periodo-desde"
                    aria-label="From"
                    value={periodo?.desde ?? ANIOS[0]}
                    onChange={(e) => setDesde(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-1 text-[11px] text-slate-100"
                  >
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="text-[11px] text-slate-400">to</span>
                  <select
                    data-testid="periodo-hasta"
                    aria-label="To"
                    value={periodo?.hasta ?? ANIOS[ANIOS.length - 1]}
                    onChange={(e) => setHasta(Number(e.target.value))}
                    className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-1 text-[11px] text-slate-100"
                  >
                    {ANIOS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button
                    onClick={() => { setPeriodo(null); setPeriodoOpen(false); }}
                    className="rounded-full px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-100"
                  >
                    All time
                  </button>
                  {(() => {
                    const sf = stats?.anual?.sinFecha;
                    const n = sf ? sf.anuncios + sf.iniciativas + sf.casos : 0;
                    return periodo && n > 0 ? (
                      <span className="text-[10px] text-slate-500">{n} undated, outside the period</span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}

          {stats?.comunidades ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-cyan-200/80 backdrop-blur">
              🏝 {stats.comunidades} islands
            </span>
          ) : null}

          {stats?.anual && Object.keys(stats.anual.porAnio).length > 0 && (
          <button
            data-testid="historia-toggle"
            onClick={() => (historia ? cerrarHistoria() : abrirHistoria())}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] backdrop-blur transition-colors ${
              historia
                ? 'border-amber-400/70 bg-amber-500/15 text-amber-200'
                : 'border-slate-700/70 bg-slate-900/70 text-slate-200 hover:border-amber-400/50'
            }`}
          >
            {historia ? '⏹ Exit History' : '▶ History'}
          </button>
          )}

          <span className="mx-1 h-4 w-px bg-slate-700/70 hidden sm:block" />

          <Link
            href="/en/informe-2026"
            className="font-sans-tech uppercase inline-flex items-center gap-2 transition-transform hover:scale-[1.04]"
            style={{
              fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, color: T.void,
              padding: '7px 14px', borderRadius: 100,
              background: `linear-gradient(135deg, ${T.cyan} 0%, ${T.blue} 100%)`,
              boxShadow: `0 6px 24px ${T.cyan}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}
          >
            2026 Report
            <span style={{ width: 5, height: 5, borderRadius: 999, background: T.void }} />
          </Link>
        </div>
      </div>

      {historia && (
        <div className="absolute bottom-4 left-1/2 z-40 w-[min(680px,92vw)] -translate-x-1/2 rounded-2xl border border-amber-500/30 bg-slate-900/95 px-4 py-3 backdrop-blur shadow-[0_0_40px_rgba(251,191,36,0.12)]">
          <div className="flex items-center gap-3">
            <button
              data-testid="historia-play"
              onClick={() => (playing ? setPlaying(false) : play())}
              disabled={reducedMotion}
              title={reducedMotion ? 'Reduced motion is on: use ‹ › to step through' : undefined}
              className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={() => { setPlaying(false); setAnio((y) => Math.max(PLAYBACK_INICIO, y - 1)); }} className="h-8 w-8 shrink-0 rounded-full border border-slate-700 text-slate-300 hover:border-amber-400/60">‹</button>
            <button onClick={() => { setPlaying(false); setAnio((y) => Math.min(ANIO_ACTUAL, y + 1)); }} className="h-8 w-8 shrink-0 rounded-full border border-slate-700 text-slate-300 hover:border-amber-400/60">›</button>
            <div className="font-serif-display shrink-0 text-3xl font-semibold tabular-nums text-amber-200" style={{ minWidth: 86 }}>
              {corte === null ? 'Today' : anio}
            </div>
            <input
              type="range"
              data-testid="historia-slider"
              min={PLAYBACK_INICIO}
              max={ANIO_ACTUAL}
              value={anio}
              onChange={(e) => { setPlaying(false); setAnio(Number(e.target.value)); }}
              className="w-full accent-amber-400"
            />
            <button onClick={cerrarHistoria} aria-label="Close History mode" className="shrink-0 rounded px-1.5 text-slate-400 hover:text-slate-100">✕</button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            {(() => { const c = corte !== null ? acumuladoHasta(anio) : stats; return c ? (
              <>
                <span><b className="text-cyan-300">{c.anuncios}</b> announcements</span>
                <span><b className="text-blue-300">{c.iniciativas}</b> bills</span>
                <span><b className="text-violet-300">{c.casos}</b> cases</span>
              </>
            ) : null; })()}
            {corte !== null && anioVacio(anio) && (
              <span className="text-amber-300/90 normal-case">No new linked records in {anio}</span>
            )}
            {corte === null && stats?.anual && (stats.anual.sinFecha.anuncios + stats.anual.sinFecha.iniciativas + stats.anual.sinFecha.casos) > 0 && (
              <span className="normal-case text-slate-500">
                {stats.anual.sinFecha.anuncios + stats.anual.sinFecha.iniciativas + stats.anual.sinFecha.casos} undated (outside the playback)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute right-4 bottom-4 rounded-lg border border-slate-700/60 bg-slate-900/80 px-3 py-2 backdrop-blur hidden sm:block">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Legend</div>
        <Leg color="#22d3ee" t="Announcement (Executive)" />
        <Leg color="#7ea2ff" t="Bill / chamber (Legislative)" />
        <Leg color="#c084fc" t="Precedent (Judicial)" />
        <Leg color="#34d399" t="Topic — bridge between branches" />
        <Leg color="#fbbf24" t="Key person — politician, judge, plaintiff" />
        <Leg color="#94a3b8" t="Agency / actor" />
        <Leg color="#f59e0b" t="Private sector — companies, clusters" />
        <Leg color="#f472b6" t="Academia — universities, research centers" />
        <div className="mt-1 text-[10px] text-slate-500">Color = origin / type · ring = new · dim = inactive · click = note</div>
        <div className="mt-1 text-[10px]">
          <Link href="/en/grafo/tabla" className="pointer-events-auto text-cyan-400/80 hover:text-cyan-300 underline">
            Accessible view: the same data as a table →
          </Link>
        </div>
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
