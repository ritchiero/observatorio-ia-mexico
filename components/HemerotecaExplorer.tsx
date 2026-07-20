'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Loader2, RotateCcw, Landmark, Scale, Building2, MapPin, FileText, Download, ExternalLink } from 'lucide-react';
import type { ItemHemeroteca, Tono } from '@/lib/hemeroteca';

const TONO: Record<Tono, { bar: string; dot: string; text: string; chip: string; emblem: string }> = {
  green: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700', chip: 'bg-emerald-50 text-emerald-700', emblem: 'bg-emerald-50 text-emerald-700' },
  blue: { bar: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-700', chip: 'bg-blue-50 text-blue-700', emblem: 'bg-blue-50 text-blue-700' },
  amber: { bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 text-amber-700', emblem: 'bg-amber-50 text-amber-700' },
  red: { bar: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-700', chip: 'bg-rose-50 text-rose-700', emblem: 'bg-rose-50 text-rose-700' },
  violet: { bar: 'bg-violet-500', dot: 'bg-violet-500', text: 'text-violet-700', chip: 'bg-violet-50 text-violet-700', emblem: 'bg-violet-50 text-violet-700' },
  slate: { bar: 'bg-slate-400', dot: 'bg-slate-400', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-600', emblem: 'bg-slate-100 text-slate-600' },
};
const ICONO = { landmark: Landmark, scale: Scale, building: Building2, 'map-pin': MapPin } as const;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const EJEMPLOS = ['regulación de IA', 'algoritmos en el sector público', 'protección de datos e IA', 'IA en el juicio de amparo'];

function facetar(items: ItemHemeroteca[], sel: (i: ItemHemeroteca) => string) {
  const m = new Map<string, number>();
  for (const i of items) { const v = sel(i); if (v) m.set(v, (m.get(v) ?? 0) + 1); }
  return [...m.entries()].map(([valor, n]) => ({ valor, n })).sort((a, b) => b.n - a.n);
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
  const tonoEst: Record<string, Tono> = { Vigente: 'green', 'En proceso': 'blue', Histórico: 'amber', Derogado: 'red' };

  const toggle = (setter: Dispatch<SetStateAction<Set<string>>>, v: string) =>
    setter((s) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; });

  const limpiar = () => { setQ(''); setFMateria(new Set()); setFCamara(new Set()); setFEstatus(new Set()); setDesde(minY); setHasta(maxY); setAiSlugs(null); setAiResp(''); setAiErr(''); };

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
    setAiLoading(true); setAiErr(''); setAiResp('');
    try {
      const res = await fetch('/api/hemeroteca/buscar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: pregunta }) });
      const j = await res.json();
      if (!res.ok) { setAiErr(j.error || 'El buscador no respondió'); return; }
      setAiResp(j.respuesta || ''); setAiSlugs(new Set<string>(j.slugs || []));
    } catch { setAiErr('No se pudo conectar con el buscador'); }
    finally { setAiLoading(false); }
  };

  const matVisibles = fMat.filter((m) => !matQ || norm(m.valor).includes(norm(matQ)));
  const activos = Boolean(q || fMateria.size || fCamara.size || fEstatus.size || aiSlugs || desde !== minY || hasta !== maxY);

  const Check = ({ on, label, n, dot, onClick }: { on: boolean; label: string; n: number; dot?: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-2 w-full text-left py-1 group">
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
        {on && <span className="w-1.5 h-1.5 bg-white rounded-sm" />}
      </span>
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      <span className="text-sm text-gray-700 flex-1 truncate">{label}</span>
      <span className="text-xs text-gray-400 tabular-nums">{n || '—'}</span>
    </button>
  );

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" aria-hidden />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') preguntarIA(); }}
              placeholder={`Buscar con IA en ${items.length} fichas verificadas…`}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              aria-label="Buscar en la hemeroteca"
            />
          </div>
          <button onClick={preguntarIA} disabled={aiLoading || q.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 px-1 text-xs text-gray-400">
          <span>Ejemplos:</span>
          {EJEMPLOS.map((e) => (
            <button key={e} onClick={() => setQ(e)} className="text-blue-600 hover:underline">&ldquo;{e}&rdquo;</button>
          ))}
        </div>
      </div>

      {(aiResp || aiErr) && (
        <div className={`mb-5 rounded-lg border p-3 text-sm flex items-start gap-2 ${aiErr ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /><p>{aiErr || aiResp}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans-tech text-lg font-semibold text-gray-900">Filtros</h2>
            {activos && <button onClick={limpiar} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><RotateCcw className="w-3 h-3" /> Limpiar todo</button>}
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Materia</h3>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden />
              <input value={matQ} onChange={(e) => setMatQ(e.target.value)} placeholder="Buscar materia…" className="w-full pl-8 pr-2 py-1.5 rounded-md border border-gray-200 text-sm outline-none focus:border-blue-400" />
            </div>
            {(verMat ? matVisibles : matVisibles.slice(0, 5)).map((m) => (
              <Check key={m.valor} on={fMateria.has(m.valor)} label={m.valor} n={m.n} onClick={() => toggle(setFMateria, m.valor)} />
            ))}
            {matVisibles.length > 5 && (
              <button onClick={() => setVerMat((v) => !v)} className="text-xs text-blue-600 hover:underline mt-1">{verMat ? 'Ver menos' : `Ver todas (${matVisibles.length})`}</button>
            )}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Cámara / Órgano</h3>
            {fCam.map((c) => <Check key={c.valor} on={fCamara.has(c.valor)} label={c.valor} n={c.n} onClick={() => toggle(setFCamara, c.valor)} />)}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Estatus</h3>
            {fEst.map((e) => <Check key={e.valor} on={fEstatus.has(e.valor)} label={e.valor} n={e.n} dot={TONO[tonoEst[e.valor] ?? 'slate'].dot} onClick={() => toggle(setFEstatus, e.valor)} />)}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Año</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="tabular-nums w-9">{desde}</span>
              <input type="range" min={minY} max={maxY} value={desde} onChange={(e) => setDesde(Math.min(Number(e.target.value), hasta))} className="flex-1 accent-blue-600" aria-label="Año desde" />
              <input type="range" min={minY} max={maxY} value={hasta} onChange={(e) => setHasta(Math.max(Number(e.target.value), desde))} className="flex-1 accent-blue-600" aria-label="Año hasta" />
              <span className="tabular-nums w-9 text-right">{hasta}</span>
            </div>
          </section>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500"><strong className="text-gray-900">{filtrados.length}</strong> {filtrados.length === 1 ? 'resultado' : 'resultados'}{activos ? ` de ${items.length}` : ''}</span>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Ordenar por:
              <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} className="border border-gray-200 rounded-md px-2 py-1 text-sm outline-none focus:border-blue-400">
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="az">A–Z</option>
              </select>
            </label>
          </div>

          {filtrados.length === 0 ? (
            <p className="text-gray-500 py-10 text-center">Sin resultados con esos filtros.</p>
          ) : (
            <ul className="space-y-3">
              {filtrados.map((it) => {
                const org = TONO[it.organoTono]; const vig = TONO[it.vigenciaTono];
                const Icon = ICONO[it.organoIcono as keyof typeof ICONO] ?? Landmark;
                return (
                  <li key={it.id} className="relative rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden">
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${vig.bar}`} aria-hidden />
                    <div className="flex gap-4 p-5 pl-6">
                      <div className={`hidden sm:flex w-11 h-11 rounded-lg items-center justify-center shrink-0 ${org.emblem}`}><Icon className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-semibold uppercase tracking-wide ${org.text}`}>{it.tipoLabel}</div>
                        <h3 className="font-serif-display text-xl leading-snug text-gray-900 mt-0.5">
                          <Link href={`/hemeroteca/${it.slug}`} className="hover:text-blue-700 transition-colors">{it.titulo}</Link>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{it.resumen}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {it.tags.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{t}</span>)}
                          {it.tagsExtra > 0 && <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">+{it.tagsExtra}</span>}
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end justify-between text-right w-36 shrink-0">
                        <div>
                          <div className="text-xs text-gray-500">{it.fechaLegible}</div>
                          <div className={`inline-flex items-center gap-1.5 mt-1 text-xs font-medium ${vig.text}`}><span className={`w-1.5 h-1.5 rounded-full ${vig.dot}`} />{it.vigenciaLabel}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mt-3 text-xs">
                          <Link href={`/hemeroteca/${it.slug}`} className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700"><FileText className="w-3.5 h-3.5" /> Ficha completa</Link>
                          {it.copiaRespaldo && <a href={it.copiaRespaldo} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700"><Download className="w-3.5 h-3.5" /> PDF</a>}
                          {it.urlGaceta && <a href={it.urlGaceta} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700"><ExternalLink className="w-3.5 h-3.5" /> Fuente</a>}
                        </div>
                      </div>
                    </div>
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
