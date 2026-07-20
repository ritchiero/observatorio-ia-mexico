'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import type { FacetasHemeroteca } from '@/lib/hemeroteca';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type Activo = { materia?: string; camara?: string; estatus?: string; anio?: string };

export default function HemerotecaExplorer({ facetas, total }: { facetas: FacetasHemeroteca; total: number }) {
  const [q, setQ] = useState('');
  const [activo, setActivo] = useState<Activo>({});
  const [aiSlugs, setAiSlugs] = useState<Set<string> | null>(null);
  const [aiResp, setAiResp] = useState('');
  const [aiErr, setAiErr] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [visibles, setVisibles] = useState(total);
  const cardsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    cardsRef.current = Array.from(document.querySelectorAll<HTMLElement>('[data-ficha]'));
  }, []);

  const aplicar = useCallback((texto: string, act: Activo, ai: Set<string> | null) => {
    const tokens = norm(texto).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const el of cardsRef.current) {
      const d = el.dataset;
      const okText = tokens.every((t) => (d.text ?? '').includes(t));
      const okMat = !act.materia || d.materia === act.materia;
      const okCam = !act.camara || d.camara === act.camara;
      const okEst = !act.estatus || d.estatus === act.estatus;
      const okAnio = !act.anio || d.anio === act.anio;
      const okAi = !ai || ai.has(d.slug ?? '');
      const visible = okText && okMat && okCam && okEst && okAnio && okAi;
      el.hidden = !visible;
      if (visible) n++;
    }
    setVisibles(n);
  }, []);

  useEffect(() => { aplicar(q, activo, aiSlugs); }, [q, activo, aiSlugs, aplicar]);

  const toggle = (k: keyof Activo, v: string) => setActivo((a) => ({ ...a, [k]: a[k] === v ? undefined : v }));

  const limpiar = () => { setQ(''); setActivo({}); setAiSlugs(null); setAiResp(''); setAiErr(''); };

  const preguntarIA = async () => {
    const pregunta = q.trim();
    if (pregunta.length < 3) return;
    setAiLoading(true); setAiErr(''); setAiResp('');
    try {
      const r = await fetch('/api/hemeroteca/buscar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: pregunta }),
      });
      const j = await r.json();
      if (!r.ok) { setAiErr(j.error || 'El buscador no respondió'); return; }
      setAiResp(j.respuesta || '');
      setAiSlugs(new Set<string>(j.slugs || []));
    } catch { setAiErr('No se pudo conectar con el buscador'); }
    finally { setAiLoading(false); }
  };

  const grupos: Array<{ k: keyof Activo; label: string; opts: { valor: string; n: number }[] }> = [
    { k: 'materia', label: 'Materia', opts: facetas.materia },
    { k: 'camara', label: 'Cámara', opts: facetas.camara },
    { k: 'estatus', label: 'Estatus', opts: facetas.estatus },
    { k: 'anio', label: 'Año', opts: facetas.anio },
  ];
  const hayFiltro = q || Object.values(activo).some(Boolean) || aiSlugs;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') preguntarIA(); }}
            placeholder="Busca por tema, ley, autor… o pregúntale a la IA"
            className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
            aria-label="Buscar en la hemeroteca"
          />
          {q && <button onClick={() => setQ('')} aria-label="Limpiar texto" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <button
          onClick={preguntarIA}
          disabled={aiLoading || q.trim().length < 3}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Preguntar a la IA
        </button>
      </div>

      {(aiResp || aiErr) && (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${aiErr ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-cyan-200 bg-cyan-50 text-cyan-900'}`}>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
            <p>{aiErr || aiResp}</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {grupos.map((g) => (
          <div key={g.k} className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500 w-16 shrink-0">{g.label}</span>
            {g.opts.map((o) => (
              <button
                key={o.valor}
                onClick={() => toggle(g.k, o.valor)}
                aria-pressed={activo[g.k] === o.valor}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${activo[g.k] === o.valor ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-300'}`}
              >
                {o.valor} <span className="opacity-60">{o.n}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500" aria-live="polite">
        <span>{visibles} {visibles === 1 ? 'ficha' : 'fichas'}{hayFiltro ? ` de ${total}` : ''}</span>
        {hayFiltro && <button onClick={limpiar} className="text-cyan-700 hover:text-cyan-800 font-medium">Limpiar filtros</button>}
      </div>
    </div>
  );
}
