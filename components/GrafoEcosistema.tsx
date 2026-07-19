'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, ForceGraphProps, LinkObject, NodeObject } from 'react-force-graph-2d';
import { centrosDeComunidades } from '@/lib/grafo-comunidades';
import { visibleEnAnio } from '@/lib/grafo-tiempo';
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
  persona: '#fbbf24',    // personas clave: políticos, jueces, quejosos
};
const ITEM_TYPES = new Set(['anuncio', 'iniciativa', 'caso']);

export type PoderFilter = { anuncio: boolean; iniciativa: boolean; caso: boolean };
export type EstadoFilter = 'todos' | 'nuevo' | 'vigente' | 'tramite' | 'inactivo';

type GNodeData = {
  id: string; label: string; type: string; val: number;
  href?: string; estado?: string; nuevo?: boolean;
  community?: string; communityLabel?: string;
  desc?: string; fecha?: string; anio?: number | null;
};
type GLinkData = {
  kind?: 'rel' | 'mesh';
  w?: number; prim?: boolean; cross?: boolean; anio?: number | null;
};
type GNode = NodeObject<GNodeData>;
type GLink = LinkObject<GNodeData, GLinkData>;
type GData = { nodes: GNode[]; links: GLink[]; stats?: { anuncios: number; iniciativas: number; casos: number; comunidades?: number } };
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

export type NodoLite = {
  id: string; label: string; type: string;
  estado?: string; nuevo?: boolean; desc?: string; communityLabel?: string; anio?: number | null;
};

export default function GrafoEcosistema({
  onStats,
  onNodes,
  onViewIds,
  spotlight = null,
  travel = null,
  poderes = { anuncio: true, iniciativa: true, caso: true },
  estado = 'todos',
  periodo = null,
  chrome = true,
  anio = null,
  anioActual = 2026,
}: {
  onStats?: (s: NonNullable<GData['stats']>) => void;
  /** entrega el catálogo lite de nodos (para buscadores externos) */
  onNodes?: (ns: NodoLite[]) => void;
  /** ids presentes en el mapa tras filtros (pasar una función estable, p.ej. un setState) */
  onViewIds?: (ids: Set<string>) => void;
  /** ids a iluminar/enfocar (resultado de una búsqueda externa) */
  spotlight?: string[] | null;
  /** orden de viaje a un nodo (t cambia para re-disparar) */
  travel?: { id: string; t: number } | null;
  poderes?: PoderFilter;
  estado?: EstadoFilter;
  /** filtro de periodo: sólo registros aparecidos dentro del rango de años */
  periodo?: { desde: number; hasta: number } | null;
  /** false = modo ambiente (hero): sin buscador/zoom/panel; clic lleva a /grafo */
  chrome?: boolean;
  /** modo Historia: año de corte acumulativo (null = actualidad, sin corte) */
  anio?: number | null;
  anioActual?: number;
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
  const [selected, setSelected] = useState<GNode | null>(null);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  // táctil (pointer coarse): pinch-zoom nativo del grafo; en escritorio manda Ctrl+rueda
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setCoarse(mq.matches);
    const fn = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  const fitted = useRef(false);
  const seededData = useRef<GData | null>(null);

  useEffect(() => {
    if (chrome) {
      // Dos fuentes: `manifest.json` lo genera el pipeline de imágenes; `personas.json`
      // son retratos curados a mano. Van aparte para no reescribir el manifest
      // generado (y para que un retrato curado gane sobre uno automático).
      const cargar = (u: string) =>
        fetch(u)
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({}));
      Promise.all([cargar('/nodos/manifest.json'), cargar('/nodos/personas.json')])
        .then(([auto, curadas]) => setFotos({ ...auto, ...curadas }))
        .catch(() => {});
    }
    fetch('/api/grafo')
      .then((r) => r.json())
      .then((d: GData) => {
        setData(d);
        if (d?.stats && onStats) onStats(d.stats);
        if (onNodes) {
          onNodes(
            d.nodes.map((n) => ({
              id: String(n.id), label: n.label, type: n.type,
              estado: n.estado, nuevo: n.nuevo, desc: n.desc, communityLabel: n.communityLabel, anio: n.anio,
            })),
          );
        }
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

  // Scroll amable (patrón mapa): la rueda NO se captura —la página puede seguir
  // bajando hacia el footer—; el zoom pide Ctrl/⌘+rueda (el pinch del trackpad
  // llega como wheel con ctrlKey=true, así que también funciona).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;         // scroll normal: dejarlo pasar
      e.preventDefault();
      const fg = fgRef.current;
      if (!fg) return;
      fg.zoom(fg.zoom() * Math.exp(-e.deltaY * 0.0022), 0);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ---- FILTROS: items visibles por poder + estado; conectores sólo si conservan aristas ----
  const view = useMemo(() => {
    if (!data) return null;
    const byId = new Map(data.nodes.map((n) => [n.id, n]));
    const itemOk = (n: GNode) => {
      if (!ITEM_TYPES.has(n.type)) return false;
      if (!poderes[n.type as keyof PoderFilter]) return false;
      if (periodo) {
        const y = n.anio ?? null;
        // sin fecha conocida no puede afirmar pertenencia al rango: fuera, con honestidad
        if (y === null || y < periodo.desde || y > periodo.hasta) return false;
      }
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
  }, [data, poderes, estado, periodo]);

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

  // ---- MODO HISTORIA: corte acumulativo por visibilidad (sin recalentar el layout) ----
  const nodoVisibleEnCorte = useCallback(
    (n: GNodeData) => visibleEnAnio(n.anio ?? null, anio, anioActual),
    [anio, anioActual],
  );
  const linkVisibleEnCorte = useCallback(
    (l: GLink) => {
      if (anio === null || anio >= anioActual) return true;
      const sOk = visibleEnAnio((typeof l.source === 'object' ? l.source?.anio : null) ?? null, anio, anioActual);
      const tOk = visibleEnAnio((typeof l.target === 'object' ? l.target?.anio : null) ?? null, anio, anioActual);
      return sOk && tOk && visibleEnAnio(l.anio ?? null, anio, anioActual);
    },
    [anio, anioActual],
  );

  const enPasado = anio !== null && anio < anioActual;

  // Historia: si el corte oculta el nodo seleccionado, soltarlo — el panel no
  // puede describir un nodo que "aún no existe" y un foco invisible apagaría el mapa
  useEffect(() => {
    if (selected && !visibleEnAnio(selected.anio ?? null, anio, anioActual)) setSelected(null);
  }, [anio, anioActual, selected]);

  // foco activo = hover o selección (el panel mantiene la isla iluminada sin mouse encima);
  // un foco fuera del corte no cuenta (hover puede quedar rancio al mover el slider)
  const active = useMemo(() => {
    const vis = (n: GNode | null) => (n && visibleEnAnio(n.anio ?? null, anio, anioActual) ? n : null);
    return vis(hover) ?? vis(selected);
  }, [hover, selected, anio, anioActual]);
  const spotlightSet = useMemo(() => new Set(spotlight ?? []), [spotlight]);
  const isLit = useCallback(
    (id: string) => {
      if (active) return active.id === id || (neigh.get(String(active.id))?.has(id) ?? false);
      if (spotlightSet.size) return spotlightSet.has(id);   // resultados de búsqueda iluminados
      return true;
    },
    [active, neigh, spotlightSet]
  );

  // reaccionar a órdenes externas: enfocar el conjunto / viajar a un nodo
  useEffect(() => {
    if (!spotlightSet.size || !fgRef.current) return;
    const t = setTimeout(() => fgRef.current?.zoomToFit(700, 90, (n: GNodeData) => spotlightSet.has(n.id)), 80);
    return () => clearTimeout(t);
  }, [spotlightSet]);
  const touchesHover = useCallback(
    (l: GLink) => active && (lid(l.source) === active.id || lid(l.target) === active.id),
    [active]
  );

  // índice por id (panel de vecinos + órdenes de viaje externas)
  const byId = useMemo(() => new Map((view?.nodes ?? []).map((n) => [String(n.id), n])), [view]);

  // avisar qué ids sobreviven los filtros (el buscador externo no ofrece clics muertos)
  useEffect(() => {
    if (onViewIds && view) onViewIds(new Set(view.nodes.map((n) => String(n.id))));
  }, [view, onViewIds]);

  // si un filtro (poder/estado/periodo) esconde al nodo seleccionado, soltarlo:
  // el panel no puede describir un nodo que ya no está en el mapa
  useEffect(() => {
    if (selected && !byId.has(String(selected.id))) setSelected(null);
  }, [byId, selected]);

  // viajar a un nodo: centrar + acercar + seleccionar (abre el panel)
  const goTo = useCallback((n: GNode) => {
    setSelected(n);
    const fg = fgRef.current;
    if (fg && n.x != null && n.y != null) {
      fg.centerAt(n.x, n.y, 650);
      fg.zoom(Math.max(fg.zoom(), 2.8), 650);
    }
  }, []);

  // viaje ordenado desde fuera (buscador del hero); nunca hacia un nodo fuera del corte
  useEffect(() => {
    if (!travel) return;
    const n = byId.get(travel.id);
    if (n && visibleEnAnio(n.anio ?? null, anio, anioActual)) goTo(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel?.t]);

  // enfocar la isla del nodo seleccionado (bbox de su comunidad)
  const focusIsla = useCallback(() => {
    const fg = fgRef.current;
    const com = selected?.community;
    if (fg && com) fg.zoomToFit(600, 70, (n: GNodeData) => n.community === com);
  }, [selected]);

  // teclado: '/' enfoca el buscador · Esc cierra panel/limpia búsqueda
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const drawCommunities = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      if (!view) return;
      const visible = new Map<string, number>();
      for (const node of view.nodes) {
        if (!node.community) continue;
        if (!visibleEnAnio(node.anio ?? null, anio, anioActual)) continue; // Historia: la isla nace con sus nodos
        visible.set(node.community, (visible.get(node.community) ?? 0) + 1);
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
    [view, communityCenters, anio, anioActual],
  );

  const drawNode = useCallback(
    (node: GNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const isHubN = !ITEM_TYPES.has(node.type);
      const r = Math.sqrt(node.val ?? 2) * (isHubN ? 2.3 : 1.45);
      const lit = isLit(node.id);
      // en el pasado no se atenúa por estado ACTUAL: sería un spoiler del destino del nodo
      const inactive = !enPasado && node.estado === 'inactivo';
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

      // anillo fijo de SELECCIÓN (doble trazo, sin pulso: es un estado, no una alerta)
      if (selected && node.id === selected.id) {
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(x, y, r + 3.2, 0, 2 * Math.PI);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r + 5.4, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // anillo pulsante para lo NUEVO (últimos 90 días) — sólo en la actualidad
      if (node.nuevo && lit && !enPasado) {
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
    [hover, isLit, selected, enPasado]
  );

  const zoomBy = (f: number) => {
    const fg = fgRef.current;
    if (fg) fg.zoom(fg.zoom() * f, 300);
  };

  return (
    // en modo ambiente (hero de la home) el canvas deja pasar el scroll táctil vertical
    <div ref={boxRef} className="relative w-full h-full" style={{ touchAction: chrome ? 'none' : 'pan-y' }}>
      {view ? (
        <ForceGraph2D
          ref={bindFg}
          width={dims.w}
          height={dims.h}
          graphData={view}
          backgroundColor="#0B1220"
          onRenderFramePre={drawCommunities}
          nodeVisibility={nodoVisibleEnCorte}
          linkVisibility={linkVisibleEnCorte}
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
          onNodeClick={(n: GNode) => { if (!chrome) { window.location.href = '/grafo'; return; } setSelected(n ?? null); }}
          onBackgroundClick={() => setSelected(null)}
          onEngineStop={() => {
            if (!fitted.current && fgRef.current) {
              fitted.current = true;
              fgRef.current.zoomToFit(500, 50);
            }
          }}
          cooldownTicks={220}
          d3AlphaDecay={0.018}
          d3VelocityDecay={0.32}
          enableZoomInteraction={chrome && coarse}
          enablePanInteraction={chrome}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-mono">
          construyendo el grafo…
        </div>
      )}

      {/* Controles de zoom (móvil: columna flotante a media altura, lejos del dock y del sheet) */}
      {chrome && (
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 sm:right-auto sm:top-auto sm:translate-y-0 sm:bottom-4 sm:left-4">
        <ZBtn label="+" testid="zoom-in" onClick={() => zoomBy(1.5)} />
        <ZBtn label="−" testid="zoom-out" onClick={() => zoomBy(1 / 1.5)} />
        <ZBtn label="⤢" testid="zoom-fit" onClick={() => fgRef.current?.zoomToFit(500, 50)} />
        <span className="mt-1 hidden sm:block max-w-[9rem] font-mono text-[9px] leading-snug text-slate-500">
          Ctrl + rueda = zoom · rueda = seguir bajando
        </span>
      </div>
      )}

      {/* Panel lateral: el apunte del nodo (móvil: bottom sheet SOBRE los filtros; escritorio: columna derecha) */}
      {chrome && selected && (
        <div className="fixed inset-x-2 bottom-2 top-auto z-50 max-h-[55dvh] overflow-y-auto rounded-xl border border-slate-700/70 bg-slate-900/95 p-4 backdrop-blur sm:absolute sm:z-auto sm:inset-x-auto sm:right-3 sm:top-16 sm:bottom-4 sm:max-h-none sm:w-80 sm:max-w-[86vw] sm:bg-slate-900/90">
          <div className="flex items-start justify-between gap-2">
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: COLOR[selected.type] }}>
              {selected.type}
              {!enPasado && selected.nuevo ? ' · nuevo' : ''}
              {!enPasado && selected.estado && ITEM_TYPES.has(selected.type) ? ` · ${selected.estado}` : ''}
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Cerrar"
              className="rounded px-1.5 text-slate-400 hover:text-slate-100"
            >
              ✕
            </button>
          </div>
          {fotos[String(selected.id)] && (
            <img
              src={`/nodos/${fotos[String(selected.id)]}`}
              alt=""
              loading="lazy"
              className="mt-2 w-full rounded-lg border border-slate-700/60 object-cover max-h-44"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-50">{selected.label}</h3>
          {selected.communityLabel && (
            <div className="mt-1 text-[11px] text-cyan-200/70">🏝 región · {selected.communityLabel}</div>
          )}

          {anio !== null && anio < anioActual && (
            <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200/90">
              🕰 Estás viendo el mapa como era en {anio}. La memoria y el estado describen la actualidad, por eso se ocultan aquí.
            </div>
          )}

          {/* Memoria: qué pasa con el tema, no solo bullets */}
          {(anio === null || anio >= anioActual) && (<>
          <div className="mt-3 font-mono text-[9px] uppercase tracking-widest text-slate-500">Memoria</div>
          {selected.desc ? (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{selected.desc}</p>
          ) : (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 italic">
              Sin resumen registrado para este nodo; sus conexiones (abajo) cuentan la historia.
            </p>
          )}
          <div className="mt-2 space-y-1 text-[11px]">
            {(() => {
              const act = lecturaActividad(selected.estado, selected.nuevo);
              const f = fmtFecha(selected.fecha);
              const nCon = neigh.get(String(selected.id))?.size ?? 0;
              return (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: act.c }} />
                    <span style={{ color: act.c }}>{act.t}</span>
                  </div>
                  {f && <div className="text-slate-400">Último movimiento: <span className="text-slate-200">{f}</span></div>}
                  <div className="text-slate-400">
                    Peso en el mapa: <span className="text-slate-200">{nCon} conexión{nCon === 1 ? '' : 'es'}</span>
                    {nCon >= 8 ? ' · nodo central' : nCon >= 4 ? ' · relevante' : ''}
                  </div>
                </>
              );
            })()}
          </div>
          </>)}

          {/* Conexiones (vecinos clicables: saltan en el mapa) */}
          <div className="mt-3 font-mono text-[9px] uppercase tracking-widest text-slate-500">Conexiones</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[...(neigh.get(String(selected.id)) ?? [])]
              .map((nid) => byId.get(nid))
              // Historia: sin spoilers — filtrar ANTES de recortar, para que los
              // vecinos futuros no consuman el cupo de los visibles
              .filter((v): v is GNode => !!v && visibleEnAnio(v.anio ?? null, anio, anioActual))
              .slice(0, 8)
              .map((v) => (
                <button
                  key={String(v.id)}
                  onClick={() => goTo(v)}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-200 hover:border-cyan-500/50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: COLOR[v.type] ?? '#94a3b8' }} />
                  <span className="truncate">{String(v.label).slice(0, 34)}</span>
                </button>
              ))}
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            {selected.community && (
              <button
                onClick={focusIsla}
                data-testid="focus-isla"
                className="rounded-lg border border-slate-700/70 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 hover:border-cyan-500/50"
              >
                Enfocar su isla
              </button>
            )}
            {selected.href && (
              <a
                href={selected.href}
                className="rounded-lg bg-cyan-600/90 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-cyan-500"
              >
                Abrir ficha completa →
              </a>
            )}
          </div>
          <div className="mt-3 text-[10px] text-slate-500">Esc para cerrar · clic en el vacío deselecciona</div>
        </div>
      )}

      {/* tooltip del nodo bajo el cursor (hover: sólo escritorio; en táctil el tap abre el panel) */}
      {chrome && hover && !selected && (
        <div className="pointer-events-none absolute left-16 bottom-4 hidden max-w-sm rounded-lg border border-slate-700/60 bg-slate-900/85 px-3 py-2 backdrop-blur sm:block">
          <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: COLOR[hover.type] }}>
            {hover.type}
            {!enPasado && hover.nuevo ? ' · nuevo' : ''}
            {!enPasado && hover.estado && ITEM_TYPES.has(hover.type) ? ` · ${hover.estado}` : ''}
          </div>
          <div className="text-sm text-slate-100 leading-snug">{hover.label}</div>
          {hover.communityLabel && hover.communityLabel !== hover.label && (
            <div className="text-[10px] text-cyan-200/60 mt-0.5">región · {hover.communityLabel}</div>
          )}
          <div className="text-[10px] text-slate-400 mt-0.5">clic para leer el apunte →</div>
        </div>
      )}
    </div>
  );
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fmtFecha(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function lecturaActividad(estado?: string, nuevo?: boolean) {
  const base =
    estado === 'vigente' ? { t: 'Activo / vigente', c: '#34E59C' } :
    estado === 'inactivo' ? { t: 'Inactivo — desechado o abandonado', c: '#94a3b8' } :
    { t: 'En trámite', c: '#7ea2ff' };
  return nuevo ? { ...base, t: base.t + ' · movimiento reciente' } : base;
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
