'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpDown,
  Building2,
  Download,
  ExternalLink,
  FileText,
  Landmark,
  Loader2,
  MapPin,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
} from 'lucide-react';
import type { ItemHemeroteca, Tono } from '@/lib/hemeroteca';

const TONO: Record<Tono, { bar: string; dot: string; text: string; chip: string; emblem: string; ring: string }> = {
  green: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700', chip: 'bg-emerald-50 text-emerald-700', emblem: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-100' },
  blue: { bar: 'bg-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-700', chip: 'bg-cyan-50 text-cyan-700', emblem: 'bg-cyan-50 text-cyan-700', ring: 'ring-cyan-100' },
  amber: { bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 text-amber-700', emblem: 'bg-amber-50 text-amber-700', ring: 'ring-amber-100' },
  red: { bar: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-700', chip: 'bg-rose-50 text-rose-700', emblem: 'bg-rose-50 text-rose-700', ring: 'ring-rose-100' },
  violet: { bar: 'bg-violet-500', dot: 'bg-violet-500', text: 'text-violet-700', chip: 'bg-violet-50 text-violet-700', emblem: 'bg-violet-50 text-violet-700', ring: 'ring-violet-100' },
  slate: { bar: 'bg-slate-400', dot: 'bg-slate-400', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-600', emblem: 'bg-slate-100 text-slate-600', ring: 'ring-slate-100' },
};
const ICONO = { landmark: Landmark, scale: Scale, building: Building2, 'map-pin': MapPin } as const;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const EJEMPLOS = ['deepfakes en elecciones', 'IA en justicia', 'derechos de autor', 'protección de datos', 'riesgo algorítmico'];

function facetar(items: ItemHemeroteca[], sel: (i: ItemHemeroteca) => string) {
  const m = new Map<string, number>();
  for (const i of items) {
    const v = sel(i);
    if (v) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].map(([valor, n]) => ({ valor, n })).sort((a, b) => b.n - a.n);
}

function compactNumber(n: number) {
  return new Intl.NumberFormat('es-MX').format(n);
}

export default function HemerotecaExplorer({ items }: { items: ItemHemeroteca[] }) {
  const anios = items.map((i) => Number(i.anio)).filter((n) => Number.isFinite(n));
  const minY = anios.length ? Math.min(...anios) : 2020;
  const maxY = anios.length ? Math.max(...anios) : 2026;

  const [q, setQ] = useState('');
  const [fMateria, setFMateria] = useState<Set<string>>(new Set());
  const [fCamara, setFCamara] = useState<Set<string>>(new Set());
  const [fEstatus, setFEstatus] = useState<Set<string>>(new Set());
  const [desde, setDesde] = useState(minY);
  const [hasta, setHasta] = useState(maxY);
  const [orden, setOrden] = useState<'recientes' | 'antiguos' | 'az'>('recientes');
  const [matQ, setMatQ] = useState('');
  const [verMat, setVerMat] = useState(false);
  const [aiSlugs, setAiSlugs] = useState<Set<string> | null>(null);
  const [aiResp, setAiResp] = useState('');
  const [aiErr, setAiErr] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fMat = facetar(items, (i) => i.materia);
  const fCam = facetar(items, (i) => i.camaraGrupo);
  const fEst = facetar(items, (i) => i.vigenciaLabel);
  const tonoEst: Record<string, Tono> = {
    Vigente: 'green',
    'En seguimiento': 'blue',
    'Sin actualización reciente': 'slate',
    Histórico: 'amber',
    Derogado: 'red',
  };

  const toggle = (setter: Dispatch<SetStateAction<Set<string>>>, v: string) =>
    setter((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });

  const limpiar = () => {
    setQ('');
    setFMateria(new Set());
    setFCamara(new Set());
    setFEstatus(new Set());
    setDesde(minY);
    setHasta(maxY);
    setAiSlugs(null);
    setAiResp('');
    setAiErr('');
  };

  const filtrados = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const r = items.filter((it) => {
      if (aiSlugs && !aiSlugs.has(it.slug)) return false;
      if (tokens.length && !tokens.every((t) => it.texto.includes(t))) return false;
      if (fMateria.size && !fMateria.has(it.materia)) return false;
      if (fCamara.size && !fCamara.has(it.camaraGrupo)) return false;
      if (fEstatus.size && !fEstatus.has(it.vigenciaLabel)) return false;
      const y = Number(it.anio);
      if (Number.isFinite(y) && (y < desde || y > hasta)) return false;
      return true;
    });
    r.sort((a, b) => {
      if (orden === 'az') return a.titulo.localeCompare(b.titulo);
      const cmp = (a.fecha ?? '').localeCompare(b.fecha ?? '');
      return orden === 'antiguos' ? cmp : -cmp;
    });
    return r;
  }, [items, q, aiSlugs, fMateria, fCamara, fEstatus, desde, hasta, orden]);

  const preguntarIA = async () => {
    const pregunta = q.trim();
    if (pregunta.length < 3) return;
    setAiLoading(true);
    setAiErr('');
    setAiResp('');
    try {
      const res = await fetch('/api/hemeroteca/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: pregunta }),
      });
      const j = await res.json();
      if (!res.ok) {
        setAiErr(j.error || 'El buscador no respondió');
        return;
      }
      setAiResp(j.respuesta || '');
      setAiSlugs(new Set<string>(j.slugs || []));
    } catch {
      setAiErr('No se pudo conectar con el buscador');
    } finally {
      setAiLoading(false);
    }
  };

  const matVisibles = fMat.filter((m) => !matQ || norm(m.valor).includes(norm(matQ)));
  const activos = Boolean(q || fMateria.size || fCamara.size || fEstatus.size || aiSlugs || desde !== minY || hasta !== maxY);
  const filtrosActivos = [
    ...[...fMateria].map((v) => ({ v, tipo: 'Materia', clear: () => toggle(setFMateria, v) })),
    ...[...fCamara].map((v) => ({ v, tipo: 'Órgano', clear: () => toggle(setFCamara, v) })),
    ...[...fEstatus].map((v) => ({ v, tipo: 'Seguimiento', clear: () => toggle(setFEstatus, v) })),
  ];

  const Check = ({ on, label, n, dot, onClick }: { on: boolean; label: string; n: number; dot?: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="group flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-slate-100/80">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-slate-950 bg-slate-950' : 'border-slate-300 group-hover:border-slate-500'}`}>
        {on && <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />}
      </span>
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      <span className="flex-1 truncate text-sm text-slate-700">{label}</span>
      <span className="text-xs tabular-nums text-slate-400">{n || '-'}</span>
    </button>
  );

  return (
    <div>
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-700" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') preguntarIA(); }}
              placeholder={`Buscar con IA en ${compactNumber(items.length)} fichas verificadas`}
              className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-[15px] text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              aria-label="Buscar en la hemeroteca"
            />
          </div>
          <button
            type="button"
            onClick={preguntarIA}
            disabled={aiLoading || q.trim().length < 3}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Buscar
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-[0.14em] text-slate-400">Prueba:</span>
          {EJEMPLOS.map((e) => (
            <button key={e} type="button" onClick={() => setQ(e)} className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700">
              {e}
            </button>
          ))}
        </div>
      </section>

      {(aiResp || aiErr) && (
        <div className={`mb-6 rounded-lg border p-4 text-sm leading-6 ${aiErr ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-cyan-200 bg-cyan-50 text-cyan-950'}`}>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-4 w-4 shrink-0" aria-hidden />
            <p>{aiErr || aiResp}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-sans-tech text-base font-semibold text-slate-950">Filtros</h2>
                <p className="mt-0.5 text-xs text-slate-500">Refina por materia, órgano y año</p>
              </div>
              {activos && (
                <button type="button" onClick={limpiar} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-950">
                  <RotateCcw className="h-3 w-3" /> Limpiar
                </button>
              )}
            </div>

            <section className="pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Materia</h3>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden />
                <input value={matQ} onChange={(e) => setMatQ(e.target.value)} placeholder="Buscar materia" className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-cyan-500 focus:bg-white" />
              </div>
              <div className="space-y-0.5">
                {(verMat ? matVisibles : matVisibles.slice(0, 6)).map((m) => (
                  <Check key={m.valor} on={fMateria.has(m.valor)} label={m.valor} n={m.n} onClick={() => toggle(setFMateria, m.valor)} />
                ))}
              </div>
              {matVisibles.length > 6 && (
                <button type="button" onClick={() => setVerMat((v) => !v)} className="mt-2 text-xs font-medium text-cyan-700 hover:underline">
                  {verMat ? 'Ver menos' : `Ver todas (${matVisibles.length})`}
                </button>
              )}
            </section>

            <section className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Cámara / órgano</h3>
              <div className="space-y-0.5">
                {fCam.map((c) => <Check key={c.valor} on={fCamara.has(c.valor)} label={c.valor} n={c.n} onClick={() => toggle(setFCamara, c.valor)} />)}
              </div>
            </section>

            <section className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Seguimiento</h3>
              <div className="space-y-0.5">
                {fEst.map((e) => <Check key={e.valor} on={fEstatus.has(e.valor)} label={e.valor} n={e.n} dot={TONO[tonoEst[e.valor] ?? 'slate'].dot} onClick={() => toggle(setFEstatus, e.valor)} />)}
              </div>
            </section>

            <section className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Año</h3>
              <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2 text-sm text-slate-600">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-center tabular-nums">{desde}</span>
                <div className="grid gap-2">
                  <input type="range" min={minY} max={maxY} value={desde} onChange={(e) => setDesde(Math.min(Number(e.target.value), hasta))} className="w-full accent-slate-950" aria-label="Año desde" />
                  <input type="range" min={minY} max={maxY} value={hasta} onChange={(e) => setHasta(Math.max(Number(e.target.value), desde))} className="w-full accent-cyan-700" aria-label="Año hasta" />
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-center tabular-nums">{hasta}</span>
              </div>
            </section>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-950">{compactNumber(filtrados.length)}</strong> {filtrados.length === 1 ? 'resultado' : 'resultados'}{activos ? ` de ${compactNumber(items.length)}` : ''}
                </p>
                {filtrosActivos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {filtrosActivos.map((f) => (
                      <button key={`${f.tipo}-${f.v}`} type="button" onClick={f.clear} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
                        {f.tipo}: {f.v} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <ArrowUpDown className="h-4 w-4" aria-hidden />
                Ordenar
                <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-cyan-500">
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="az">A-Z</option>
                </select>
              </label>
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-900">Sin resultados con esos filtros.</p>
              <p className="mt-2 text-sm text-slate-500">Prueba limpiando una materia o ampliando el rango de años.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtrados.map((it) => {
                const org = TONO[it.organoTono];
                const vig = TONO[it.vigenciaTono];
                const Icon = ICONO[it.organoIcono as keyof typeof ICONO] ?? Landmark;
                return (
                  <li key={it.id}>
                    <article className={`group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/35 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/55`}>
                      <span className={`absolute inset-y-0 left-0 w-1 ${vig.bar}`} aria-hidden />
                      <div className="grid gap-0 md:grid-cols-[144px_minmax(0,1fr)_168px]">
                        <div className="flex items-center justify-center border-b border-slate-100 bg-slate-50/70 p-4 md:border-b-0 md:border-r">
                          <div className={`flex h-24 w-full items-center justify-center rounded-lg bg-white p-3 ring-1 ${org.ring}`}>
                            {it.organoLogo ? (
                              <Image src={it.organoLogo} alt={it.organoLabel} width={140} height={84} className="max-h-16 w-auto object-contain" />
                            ) : (
                              <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${org.emblem}`}>
                                <Icon className="h-7 w-7" aria-hidden />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 p-4 md:p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${org.chip}`}>{it.organoLabel}</span>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{it.jurisdiccion}</span>
                            {it.numero && <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">#{it.numero}</span>}
                          </div>

                          <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-950 md:text-2xl">
                            <Link href={`/hemeroteca/${it.slug}`} className="outline-none transition hover:text-cyan-700 focus:text-cyan-700">
                              {it.titulo}
                            </Link>
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{it.resumen}</p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <span className="rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium text-white">{it.materia}</span>
                            {it.tags.map((t) => <span key={t} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600 capitalize">{t}</span>)}
                            {it.tagsExtra > 0 && <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">+{it.tagsExtra}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between border-t border-slate-100 p-4 md:border-l md:border-t-0 md:p-5">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{it.tipoLabel}</div>
                            <div className="mt-2 text-sm text-slate-600">{it.fechaLegible || it.anio || 'Sin fecha'}</div>
                            <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${vig.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${vig.dot}`} />{it.vigenciaLabel}
                            </div>
                            {it.estatusFuenteLabel && (
                              <div className="mt-1 text-[11px] leading-4 text-slate-400">
                                Fuente: {it.estatusFuenteLabel}
                              </div>
                            )}
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2 md:flex-col">
                            <Link href={`/hemeroteca/${it.slug}`} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                              <FileText className="h-3.5 w-3.5" /> Ficha
                            </Link>
                            {it.copiaRespaldo && <a href={it.copiaRespaldo} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"><Download className="h-3.5 w-3.5" /> PDF</a>}
                            {it.urlGaceta && <a href={it.urlGaceta} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"><ExternalLink className="h-3.5 w-3.5" /> Fuente</a>}
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
