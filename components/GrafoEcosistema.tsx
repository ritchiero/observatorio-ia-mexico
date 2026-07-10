'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// Paleta por tipo (misma familia del sitio)
const COLOR: Record<string, string> = {
  anuncio: '#22d3ee',    // ejecutivo · cian
  iniciativa: '#7ea2ff', // legislativo · azul
  caso: '#c084fc',       // judicial · violeta
  actor: '#94a3b8',      // dependencias / responsables
  camara: '#7ea2ff',
  tema: '#34d399',       // temas: puentes entre poderes
};

type GNode = { id: string; label: string; type: string; val: number; href?: string; x?: number; y?: number };
type GLink = { source: any; target: any };
type GData = { nodes: GNode[]; links: GLink[]; stats?: { anuncios: number; iniciativas: number; casos: number } };

export default function GrafoEcosistema({ onStats }: { onStats?: (s: NonNullable<GData['stats']>) => void }) {
  const fgRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GData | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<GNode | null>(null);
  const fitted = useRef(false);

  useEffect(() => {
    fetch('/api/grafo')
      .then((r) => r.json())
      .then((d: GData) => {
        setData(d);
        if (d?.stats && onStats) onStats(d.stats);
      })
      .catch((e) => console.error('grafo fetch:', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;
    const ro = new ResizeObserver((es) => {
      const r = es[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);

  // re-encuadre al cambiar el tamaño del contenedor (el fit inicial puede ocurrir antes de medirlo)
  useEffect(() => {
    if (!fitted.current || !fgRef.current) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 60), 250);
    return () => clearTimeout(t);
  }, [dims]);

  // vecindad para el resaltado tipo Obsidian
  const { neigh, linkKey } = useMemo(() => {
    const neigh = new Map<string, Set<string>>();
    const linkKey = (l: GLink) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return `${s}|${t}`;
    };
    if (data) {
      for (const l of data.links) {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (!neigh.has(s)) neigh.set(s, new Set());
        if (!neigh.has(t)) neigh.set(t, new Set());
        neigh.get(s)!.add(t);
        neigh.get(t)!.add(s);
      }
    }
    return { neigh, linkKey };
  }, [data]);

  const isLit = useCallback(
    (id: string) => !hover || hover.id === id || (neigh.get(hover.id)?.has(id) ?? false),
    [hover, neigh]
  );

  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, scale: number) => {
      const r = Math.sqrt(node.val ?? 2) * 2.1;
      const lit = isLit(node.id);
      const color = COLOR[node.type] ?? '#94a3b8';

      ctx.save();
      ctx.globalAlpha = lit ? 1 : 0.12;
      // halo
      ctx.shadowColor = color;
      ctx.shadowBlur = lit ? (hover?.id === node.id ? 22 : 9) : 0;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // etiqueta: hubs siempre; items al acercarse o al iluminarse por hover
      const isHub = node.type === 'actor' || node.type === 'tema' || node.type === 'camara';
      const showLabel = (isHub && scale > 0.9) || scale > 2.4 || (hover && lit);
      if (showLabel && lit) {
        const raw = String(node.label ?? '');
        const label = raw.length > 42 ? raw.slice(0, 41) + '…' : raw;
        const fs = Math.max(2.6, (isHub ? 4.6 : 3.4) / Math.sqrt(scale));
        ctx.font = `${isHub ? 600 : 400} ${fs}px "Space Grotesk", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHub ? 'rgba(233,237,246,0.92)' : 'rgba(174,185,212,0.85)';
        ctx.fillText(label, node.x, node.y + r + 1.4);
      }
      ctx.restore();
    },
    [hover, isLit]
  );

  return (
    <div ref={boxRef} className="relative w-full h-full">
      {data ? (
        <ForceGraph2D
          ref={fgRef}
          width={dims.w}
          height={dims.h}
          graphData={data}
          backgroundColor="#0B1220"
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const r = Math.sqrt(node.val ?? 2) * 2.1 + 3;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkColor={(l: any) =>
            !hover || (isLit(typeof l.source === 'object' ? l.source.id : l.source) && isLit(typeof l.target === 'object' ? l.target.id : l.target))
              ? 'rgba(148,163,184,0.16)'
              : 'rgba(148,163,184,0.03)'
          }
          linkWidth={(l: any) => {
            if (!hover) return 0.6;
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return (s === hover.id || t === hover.id) ? 1.6 : 0.4;
          }}
          onNodeHover={(n: any) => setHover(n ?? null)}
          onNodeClick={(n: any) => {
            if (n?.href) window.location.href = n.href;
          }}
          onEngineStop={() => {
            if (!fitted.current && fgRef.current) {
              fitted.current = true;
              fgRef.current.zoomToFit(500, 40);
            }
          }}
          cooldownTicks={140}
          d3VelocityDecay={0.32}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-mono">
          construyendo el grafo…
        </div>
      )}

      {/* tooltip del nodo bajo el cursor */}
      {hover && (
        <div className="pointer-events-none absolute left-4 bottom-4 max-w-sm rounded-lg border border-slate-700/60 bg-slate-900/85 px-3 py-2 backdrop-blur">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR[hover.type] }}>
            {hover.type}
          </div>
          <div className="text-sm text-slate-100 leading-snug">{hover.label}</div>
          {hover.href && <div className="text-[10px] text-slate-400 mt-0.5">clic para abrir ficha →</div>}
        </div>
      )}
    </div>
  );
}
