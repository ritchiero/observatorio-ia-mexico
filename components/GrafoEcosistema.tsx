'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, ForceGraphProps, LinkObject, NodeObject } from 'react-force-graph-2d';
import { centrosDeComunidades } from '@/lib/grafo-comunidades';
// @ts-expect-error — d3-force-3d (dep de force-graph) no publica tipos
import { forceX, forceY, forceCollide } from 'd3-force-3d';

const ForceGraph2DRaw = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// Paleta por tipo (misma familia del sitio)
const COLOR: Record<string, string> = {
  anuncio: '#22d3ee',    // ejecutivo · cian
  iniciativa: '#7ea2ff', // legislativo · azul
  caso: '#c084fc',       // judicial · violeta
  actor: '#94a3b8',      // dependencias / responsables
  camara: '#7ea2ff',
  tema: '#34d399',       // temas: puentes entre poderes
};
const ITEM_TYPES = new Set(['anuncio', 'iniciativa', 'caso']);

export type PoderFilter = { anuncio: boolean; iniciativa: boolean; caso: boolean };
export type EstadoFilter = 'todos' | 'nuevo' | 'vigente' | 'tramite' | 'inactivo';

type GNodeData = {
  id: string; label: string; type: string; val: number;
  href?: string; estado?: string; nuevo?: boolean;
  community?: string; communityLabel?: string;
};
type GLinkData = {
  kind?: 'rel' | 'mesh';
  w?: number; prim?: boolean; cross?: boolean;
};
type GNode = NodeObject<GNodeData>;
type GLink = LinkObject<GNodeData, GLinkData>;
type GData = { nodes: GNode[]; links: GLink[]; stats?: { anuncios: number; iniciativas: number; casos: number } };
const ForceGraph2D = ForceGraph2DRaw as unknown as ComponentType<
  ForceGraphProps<GNodeData, GLinkData> & {
    ref?: (instance: ForceGraphMethods<GNodeData, GLinkData> | null) => void;
  }
>;

const lid = (value: GLink['source']) => String(typeof value === 'object' ? value?.id : value ?? '');
const hash01 = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

export default function GrafoEcosistema({
  onStats,
  poderes = { anuncio: true, iniciativa: true, caso: true },
  estado = 'todos',
}: {
  onStats?: (s: NonNullable<GData['stats']>) => void;
  poderes?: PoderFilter;
  estado?: EstadoFilter;
}) {
  const fgRef = useRef<ForceGraphMethods<GNodeData, GLinkData> | null>(null);
  const [fgReady, setFgReady] = useState(false);
  const bindFg = useCallback((inst: ForceGraphMethods<GNodeData, GLinkData> | null) => {
    fgRef.current = inst;
    setFgReady(!!inst);
  }, []);
  const boxRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<GData | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<GNode | null>(null);
  const fitted = useRef(false);
  const seededData = useRef<GData | null>(null);

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

  // ---- FILTROS: items visibles por poder + estado; conectores sólo si conservan aristas ----
  const view = useMemo(() => {
    if (!data) return null;
    const byId = new Map(data.nodes.map((n) => [n.id, n]));
    const itemOk = (n: GNode) => {
      if (!ITEM_TYPES.has(n.type)) return false;
      if (!poderes[n.type as keyof PoderFilter]) return false;
      if (estado === 'nuevo') return !!n.nuevo;
      if (estado !== 'todos') return n.estado === estado;
      return true;
    };
    const visibles = new Set(data.nodes.filter(itemOk).map((n) => n.id));
    // 1) aristas item→hub de items visibles
    const rel = data.links.filter((l) => {
      if (l.kind === 'mesh') return false;
      const s = byId.get(lid(l.source)); const t = byId.get(lid(l.target));
      if (!s || !t) return false;
      const item = ITEM_TYPES.has(s.type) ? s : t;
      return visibles.has(item.id);
    });
    const used = new Set<string>();
    rel.forEach((l) => { used.add(lid(l.source)); used.add(lid(l.target)); });
    // 2) la malla hub↔hub sobrevive si ambos hubs siguen en uso
    const mesh = data.links.filter(
      (l) => l.kind === 'mesh' && used.has(lid(l.source)) && used.has(lid(l.target))
    );
    const nodes = data.nodes.filter((n) => (ITEM_TYPES.has(n.type) ? visibles.has(n.id) : used.has(n.id)));
    return { nodes, links: [...rel, ...mesh] };
  }, [data, poderes, estado]);

  // Los centros se calculan con el atlas COMPLETO, no con el filtro visible:
  // apagar un poder no debe hacer que las regiones restantes salten de lugar.
  const communityCenters = useMemo(
    () => (data ? centrosDeComunidades(data.nodes) : new Map()),
    [data],
  );

  // Semilla estable una sola vez por payload. Evita el Math.random interno del
  // motor y permite comparar dos full reloads con el mismo mapa de partida.
  useEffect(() => {
    if (!data || !communityCenters.size || seededData.current === data) return;
    for (const node of data.nodes) {
      const center = node.community ? communityCenters.get(node.community) : undefined;
      if (!center) continue;
      const anchor = node.id === node.community;
      const angle = hash01(node.id) * Math.PI * 2;
      const spread = anchor ? 0 : 8 + hash01(`${node.id}:r`) * center.radius * 0.55;
      node.x = center.x + Math.cos(angle) * spread;
      node.y = center.y + Math.sin(angle) * spread;
      node.vx = 0;
      node.vy = 0;
    }
    seededData.current = data;
  }, [data, communityCenters]);

  // Un pozo por comunidad. Los enlaces cross se siguen dibujando como puentes,
  // pero no ejercen fuerza: una iniciativa multitemática ya no cae al centroide
  // global de cámara + temas opuestos.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !view || !fgReady || !communityCenters.size) return;
    // grado por nodo (para aflojar los mega-hubs: halos amplios, no discos rígidos)
    const deg = new Map<string, number>();
    for (const l of view.links) {
      deg.set(lid(l.source), (deg.get(lid(l.source)) ?? 0) + 1);
      deg.set(lid(l.target), (deg.get(lid(l.target)) ?? 0) + 1);
    }
    const dg = (value: GLink['source']) => deg.get(lid(value)) ?? 1;
    const centerOf = (n: GNode) =>
      (n.community && communityCenters.get(n.community)) || { x: 0, y: 0 };
    fg.d3Force('charge')?.strength((n: GNode) => (ITEM_TYPES.has(n.type) ? -14 : -110));
    fg.d3Force('link')
      ?.distance((l: GLink) =>
        l.cross
          ? 170
          : l.kind === 'mesh'
            ? Math.max(58, 100 - (l.w ?? 2) * 4)
            : l.prim
              ? 16 + Math.sqrt(Math.max(dg(l.source), dg(l.target))) * 2
              : 52
      )
      .strength((l: GLink) =>
        l.cross
          ? 0
          : l.kind === 'mesh'
            ? 0.09
            : l.prim
              ? Math.min(0.75, Math.max(0.38, 2 / Math.min(dg(l.source), dg(l.target))))
              : 0.045
      );
    fg.d3Force('gx', forceX((n: GNode) => centerOf(n).x).strength((n: GNode) => (ITEM_TYPES.has(n.type) ? 0.05 : 0.12)));
    fg.d3Force('gy', forceY((n: GNode) => centerOf(n).y).strength((n: GNode) => (ITEM_TYPES.has(n.type) ? 0.05 : 0.12)));
    fg.d3Force(
      'collide',
      forceCollide((n: GNode) => Math.sqrt(n.val ?? 2) * (ITEM_TYPES.has(n.type) ? 1.5 : 2.3) + 2)
        .strength(0.7)
        .iterations(2),
    );
    fg.d3ReheatSimulation();
    const t = setTimeout(() => fg.zoomToFit(650, 36), 1700);
    return () => clearTimeout(t);
  }, [view, fgReady, communityCenters]);

  useEffect(() => {
    if (!fitted.current || !fgRef.current) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(400, 50), 250);
    return () => clearTimeout(t);
  }, [dims]);

  const { neigh } = useMemo(() => {
    const neigh = new Map<string, Set<string>>();
    if (view) {
      for (const l of view.links) {
        const s = lid(l.source); const t = lid(l.target);
        if (!neigh.has(s)) neigh.set(s, new Set());
        if (!neigh.has(t)) neigh.set(t, new Set());
        neigh.get(s)!.add(t);
        neigh.get(t)!.add(s);
      }
    }
    return { neigh };
  }, [view]);

  const isLit = useCallback(
    (id: string) => !hover || hover.id === id || (neigh.get(hover.id)?.has(id) ?? false),
    [hover, neigh]
  );
  const touchesHover = useCallback(
    (l: GLink) => hover && (lid(l.source) === hover.id || lid(l.target) === hover.id),
    [hover]
  );

  const drawCommunities = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      if (!view) return;
      const visible = new Map<string, number>();
      for (const node of view.nodes) {
        if (node.community) visible.set(node.community, (visible.get(node.community) ?? 0) + 1);
      }
      for (const [id, count] of visible) {
        const center = communityCenters.get(id);
        if (!center) continue;
        const radius = center.radius * Math.max(0.58, Math.sqrt(count / center.count));
        const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
        glow.addColorStop(0, 'rgba(56,189,248,0.055)');
        glow.addColorStop(0.72, 'rgba(49,81,114,0.025)');
        glow.addColorStop(1, 'rgba(11,18,32,0)');
        ctx.save();
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        if (count >= 5) {
          const fontSize = Math.max(3.2, 7 / Math.sqrt(scale));
          ctx.font = `600 ${fontSize}px "Space Grotesk", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = 'rgba(148,163,184,0.32)';
          ctx.fillText(center.label.toUpperCase(), center.x, center.y - radius * 0.58);
        }
        ctx.restore();
      }
    },
    [view, communityCenters],
  );

  const drawNode = useCallback(
    (node: GNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const isHubN = !ITEM_TYPES.has(node.type);
      const r = Math.sqrt(node.val ?? 2) * (isHubN ? 2.3 : 1.45);
      const lit = isLit(node.id);
      const inactive = node.estado === 'inactivo';
      const color = COLOR[node.type] ?? '#94a3b8';
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.save();
      ctx.globalAlpha = lit ? (inactive ? 0.45 : 1) : 0.1;
      ctx.shadowColor = color;
      ctx.shadowBlur = lit ? (hover?.id === node.id ? 24 : inactive ? 4 : 10) : 0;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // anillo pulsante para lo NUEVO (últimos 90 días)
      if (node.nuevo && lit) {
        const pulse = 1 + 0.22 * Math.sin(Date.now() / 300);
        ctx.beginPath();
        ctx.arc(x, y, (r + 2.2) * pulse, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.globalAlpha = lit ? 1 : 0.1;
      }

      // labels jerárquicos: los hubs grandes hablan fuerte (estilo "Geralt"),
      // los medianos aparecen al acercarse, los items sólo de cerca o al hover
      const isHub = !ITEM_TYPES.has(node.type);
      const big = isHub && (node.val ?? 0) >= 7;
      const showLabel = big || (isHub && scale > 1.1) || scale > 2.1 || (hover && lit);
      if (showLabel && lit) {
        const raw = String(node.label ?? '');
        const label = raw.length > 40 ? raw.slice(0, 39) + '…' : raw;
        const fs = big
          ? Math.max(5, 3.4 + (node.val ?? 6) * 0.45)
          : Math.max(2.4, (isHub ? 4.2 : 3.2) / Math.sqrt(scale));
        ctx.font = `${big ? 700 : isHub ? 600 : 400} ${fs}px "Space Grotesk", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = big ? 'rgba(248,250,255,0.96)' : isHub ? 'rgba(233,237,246,0.9)' : 'rgba(174,185,212,0.85)';
        ctx.fillText(label, x, y + r + 1.6);
      }
      ctx.restore();
    },
    [hover, isLit]
  );

  const zoomBy = (f: number) => {
    const fg = fgRef.current;
    if (fg) fg.zoom(fg.zoom() * f, 300);
  };

  return (
    <div ref={boxRef} className="relative w-full h-full">
      {view ? (
        <ForceGraph2D
          ref={bindFg}
          width={dims.w}
          height={dims.h}
          graphData={view}
          backgroundColor="#0B1220"
          onRenderFramePre={drawCommunities}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={(node: GNode, color: string, ctx: CanvasRenderingContext2D) => {
            const r = Math.sqrt(node.val ?? 2) * (ITEM_TYPES.has(node.type) ? 1.45 : 2.3) + 3;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
            ctx.fill();
          }}
          linkCurvature={(l: GLink) => (l.cross ? 0.42 : l.kind === 'mesh' ? 0.22 : 0.08)}
          linkColor={(l: GLink) => {
            const dim = hover && !(isLit(lid(l.source)) && isLit(lid(l.target)));
            if (dim) return 'rgba(148,163,184,0.03)';
            if (l.cross) return 'rgba(94,208,239,0.11)';
            return l.kind === 'mesh' ? 'rgba(94,208,239,0.14)' : 'rgba(148,163,184,0.16)';
          }}
          linkWidth={(l: GLink) => (touchesHover(l) ? 1.8 : l.cross ? 0.42 : l.kind === 'mesh' ? Math.min(0.5 + (l.w ?? 2) * 0.1, 1.4) : 0.5)}
          linkDirectionalParticles={(l: GLink) => (touchesHover(l) ? 2 : 0)}
          linkDirectionalParticleWidth={1.8}
          linkDirectionalParticleSpeed={0.007}
          linkDirectionalParticleColor={() => '#5ed0ef'}
          onNodeHover={(n: GNode | null) => setHover(n ?? null)}
          onNodeClick={(n: GNode) => {
            if (n?.href) window.location.href = n.href;
          }}
          onEngineStop={() => {
            if (!fitted.current && fgRef.current) {
              fitted.current = true;
              fgRef.current.zoomToFit(500, 50);
            }
          }}
          cooldownTicks={220}
          d3AlphaDecay={0.018}
          d3VelocityDecay={0.32}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-mono">
          construyendo el grafo…
        </div>
      )}

      {/* Controles de zoom */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
        <ZBtn label="+" testid="zoom-in" onClick={() => zoomBy(1.5)} />
        <ZBtn label="−" testid="zoom-out" onClick={() => zoomBy(1 / 1.5)} />
        <ZBtn label="⤢" testid="zoom-fit" onClick={() => fgRef.current?.zoomToFit(500, 50)} />
      </div>

      {/* tooltip del nodo bajo el cursor */}
      {hover && (
        <div className="pointer-events-none absolute left-16 bottom-4 max-w-sm rounded-lg border border-slate-700/60 bg-slate-900/85 px-3 py-2 backdrop-blur">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR[hover.type] }}>
            {hover.type}
            {hover.nuevo ? ' · nuevo' : ''}
            {hover.estado && ITEM_TYPES.has(hover.type) ? ` · ${hover.estado}` : ''}
          </div>
          <div className="text-sm text-slate-100 leading-snug">{hover.label}</div>
          {hover.communityLabel && hover.communityLabel !== hover.label && (
            <div className="text-[10px] text-cyan-200/60 mt-0.5">región · {hover.communityLabel}</div>
          )}
          {hover.href && <div className="text-[10px] text-slate-400 mt-0.5">clic para abrir ficha →</div>}
        </div>
      )}
    </div>
  );
}

function ZBtn({ label, onClick, testid }: { label: string; onClick: () => void; testid: string }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className="h-9 w-9 rounded-lg border border-slate-700/70 bg-slate-900/80 text-slate-200 text-lg leading-none backdrop-blur hover:border-cyan-500/60 hover:text-cyan-300 transition-colors"
      aria-label={label === '+' ? 'Acercar' : label === '−' ? 'Alejar' : 'Encuadrar'}
    >
      {label}
    </button>
  );
}
