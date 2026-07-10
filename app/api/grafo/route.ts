import { NextResponse } from 'next/server';
import { asignarComunidades } from '@/lib/grafo-comunidades';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/grafo — nodos + aristas del ecosistema (anuncios, iniciativas, casos)
// Deriva conexiones de los atributos que ya existen en la base:
//   anuncio    -> dependencia, responsable
//   iniciativa -> cámara, temáticas
//   caso       -> tema de IA, materia
// Los conectores (dependencias, actores, temas, cámaras) sólo entran si conectan >= MIN_DEG items.
const MIN_DEG = 2;

type Node = {
  id: string;
  label: string;
  type: 'anuncio' | 'iniciativa' | 'caso' | 'actor' | 'tema' | 'camara';
  val: number;          // tamaño relativo
  href?: string;        // a dónde navegar al hacer clic
  status?: string;
  estado?: 'vigente' | 'tramite' | 'inactivo';  // bucket de segmentación
  nuevo?: boolean;      // detectado en los últimos 90 días
  community?: string;   // casa primaria para separar el mapa en archipiélagos
  communityLabel?: string;
};

const DIAS_NUEVO = 90;
function bucket(status: string): 'vigente' | 'tramite' | 'inactivo' {
  const s = status.toLowerCase();
  if (/(operando|publicada|vigente|aprobada|resuelto|sentencia)/.test(s)) return 'vigente';
  if (/(desechad|archivad|abandonad|incumplid|rechazad|desistid)/.test(s)) return 'inactivo';
  return 'tramite';
}
function esNuevo(fecha: unknown): boolean {
  const t = fecha ? new Date(String(fecha)).getTime() : NaN;
  return Number.isFinite(t) && Date.now() - t < DIAS_NUEVO * 24 * 3600 * 1000;
}
type Link = { source: string; target: string; kind?: 'rel' | 'mesh'; w?: number; prim?: boolean; cross?: boolean };

const CAMARA_LABEL: Record<string, string> = {
  diputados: 'Cámara de Diputados',
  senado: 'Senado',
  congreso_cdmx: 'Congreso CDMX',
  congreso_edomex: 'Congreso Edomex',
  congreso_local: 'Congreso local',
};

function norm(s: unknown): string {
  return String(s ?? '').trim();
}
function keyify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: Request) {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.observatorio-ia-mexico.com');

    const [anR, inR, caR] = await Promise.all([
      fetch(`${base}/api/anuncios?limit=500`, { next: { revalidate: 300 } }),
      fetch(`${base}/api/iniciativas`, { next: { revalidate: 300 } }),
      fetch(`${base}/api/casos-ia`, { next: { revalidate: 300 } }),
    ]);
    const pick = (j: any, ...keys: string[]): any[] => {
      if (Array.isArray(j)) return j;
      for (const k of keys) if (Array.isArray(j?.[k])) return j[k];
      return [];
    };
    const anuncios = pick(await anR.json(), 'anuncios', 'data');
    const iniciativas = pick(await inR.json(), 'iniciativas', 'data');
    const casos = pick(await caR.json(), 'casos', 'data');

    const nodes = new Map<string, Node>();
    const links: Link[] = [];
    // conectores candidatos: se materializan sólo si juntan >= MIN_DEG conexiones
    const pend = new Map<string, { node: Node; links: Link[] }>();

    const addItem = (n: Node) => nodes.set(n.id, n);
    const addConn = (id: string, node: Node, itemId: string, prim = false) => {
      const p = pend.get(id) ?? { node, links: [] };
      p.links.push({ source: itemId, target: id, prim });
      pend.set(id, p);
    };

    for (const a of anuncios) {
      const id = `a:${a.id}`;
      const st = norm(a.status);
      addItem({ id, label: norm(a.titulo), type: 'anuncio', val: 2, href: `/anuncio/${a.id}`, status: st, estado: bucket(st), nuevo: esNuevo(a.fechaAnuncio ?? a.createdAt) });
      const dep = norm(a.dependencia);
      if (dep) addConn(`d:${keyify(dep)}`, { id: `d:${keyify(dep)}`, label: dep, type: 'actor', val: 3 }, id, true);
      const resp = norm(a.responsable);
      if (resp) addConn(`r:${keyify(resp)}`, { id: `r:${keyify(resp)}`, label: resp, type: 'actor', val: 3 }, id);
    }

    for (const i of iniciativas) {
      const id = `i:${i.id}`;
      const st = norm(i.status ?? i.estatus);
      addItem({ id, label: norm(i.titulo), type: 'iniciativa', val: 2, href: '/legislacion', status: st, estado: bucket(st), nuevo: esNuevo(i.fecha) });
      const temas: string[] = Array.isArray(i.tematicas) ? i.tematicas : [];
      const hayTema = temas.some((t) => norm(t));
      const cam = norm(i.camara);
      if (cam) {
        const label = CAMARA_LABEL[cam.toLowerCase()] ?? cam.replace(/_/g, ' ');
        addConn(`c:${keyify(cam)}`, { id: `c:${keyify(cam)}`, label, type: 'camara', val: 4 }, id, !hayTema);
      }
      temas.slice(0, 3).forEach((t, k) => {
        const tt = norm(t);
        if (tt) addConn(`t:${keyify(tt)}`, { id: `t:${keyify(tt)}`, label: tt.replace(/_/g, ' '), type: 'tema', val: 3 }, id, k === 0);
      });
    }

    for (const c of casos) {
      const id = `j:${c.id}`;
      const st = norm(c.estado);
      addItem({ id, label: norm(c.nombre ?? c.titulo), type: 'caso', val: 3, href: `/casos-ia/${c.id}`, status: st, estado: bucket(st), nuevo: esNuevo(c.fechaActualizacion ?? c.fechaCreacion) });
      const tema = norm(c.temaIA);
      if (tema) addConn(`t:${keyify(tema)}`, { id: `t:${keyify(tema)}`, label: tema.replace(/_/g, ' '), type: 'tema', val: 3 }, id, true);
      const mat = norm(c.materia);
      if (mat) addConn(`t:${keyify(mat)}`, { id: `t:${keyify(mat)}`, label: mat.replace(/_/g, ' '), type: 'tema', val: 3 }, id);
    }

    // materializar conectores con grado suficiente
    const hubItems = new Map<string, Set<string>>(); // hub -> items que conecta
    for (const { node, links: ls } of pend.values()) {
      if (ls.length >= MIN_DEG) {
        node.val = Math.min(3 + ls.length * 1.15, 42); // tamaño según cuántos conecta (jerarquía fuerte)
        nodes.set(node.id, node);
        links.push(...ls.map((l) => ({ ...l, kind: 'rel' as const })));
        hubItems.set(node.id, new Set(ls.map((l) => l.source)));
      }
    }

    // MALLA hub↔hub por co-ocurrencia: cose las islas en un solo organismo.
    // Dos conectores se enlazan si comparten >= 2 items; el peso es cuántos comparten.
    const hubIds = [...hubItems.keys()];
    const mesh: Link[] = [];
    for (let i = 0; i < hubIds.length; i++) {
      for (let j = i + 1; j < hubIds.length; j++) {
        const A = hubItems.get(hubIds[i])!;
        const B = hubItems.get(hubIds[j])!;
        let shared = 0;
        for (const x of A) if (B.has(x)) shared++;
        if (shared >= 2) mesh.push({ source: hubIds[i], target: hubIds[j], kind: 'mesh', w: shared });
      }
    }
    // esqueleto disperso (no todos-con-todos): cada hub conserva sólo sus 3
    // co-ocurrencias más fuertes; una malla completa colapsa el layout en bola
    mesh.sort((a, b) => (b.w ?? 0) - (a.w ?? 0));
    const perHub = new Map<string, number>();
    const backbone: Link[] = [];
    for (const m of mesh) {
      const cs = perHub.get(m.source) ?? 0;
      const ct = perHub.get(m.target) ?? 0;
      if (cs >= 3 || ct >= 3) continue;
      perHub.set(m.source, cs + 1);
      perHub.set(m.target, ct + 1);
      backbone.push(m);
    }
    links.push(...backbone);

    // tamaño de items según a cuántos hubs tocan (jerarquía visual)
    const deg = new Map<string, number>();
    for (const l of links) {
      deg.set(l.source, (deg.get(l.source) ?? 0) + 1);
      deg.set(l.target, (deg.get(l.target) ?? 0) + 1);
    }
    for (const n of nodes.values()) {
      if (n.type === 'anuncio' || n.type === 'iniciativa' || n.type === 'caso') {
        n.val = Math.min(2 + (deg.get(n.id) ?? 0) * 0.7, 7);
      }
    }

    // quitar huérfanos: un nodo sin aristas se dispersa y encoge el núcleo del grafo
    const linked = new Set<string>();
    for (const l of links) {
      linked.add(l.source);
      linked.add(l.target);
    }
    const nodeList = asignarComunidades(
      [...nodes.values()].filter((n) => linked.has(n.id)),
      links,
    );
    const communityByNode = new Map(nodeList.map((node) => [node.id, node.community]));
    const finalLinks = links.map((link) => ({
      ...link,
      cross: communityByNode.get(link.source) !== communityByNode.get(link.target),
    }));

    return NextResponse.json({
      nodes: nodeList,
      links: finalLinks,
      stats: { anuncios: anuncios.length, iniciativas: iniciativas.length, casos: casos.length },
      generado: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[grafo] error:', e);
    return NextResponse.json({ error: 'No se pudo construir el grafo' }, { status: 500 });
  }
}
