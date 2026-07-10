import { NextResponse } from 'next/server';

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
};
type Link = { source: string; target: string };

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
    const addConn = (id: string, node: Node, itemId: string) => {
      const p = pend.get(id) ?? { node, links: [] };
      p.links.push({ source: itemId, target: id });
      pend.set(id, p);
    };

    for (const a of anuncios) {
      const id = `a:${a.id}`;
      addItem({ id, label: norm(a.titulo), type: 'anuncio', val: 2, href: `/anuncio/${a.id}`, status: norm(a.status) });
      const dep = norm(a.dependencia);
      if (dep) addConn(`d:${keyify(dep)}`, { id: `d:${keyify(dep)}`, label: dep, type: 'actor', val: 3 }, id);
      const resp = norm(a.responsable);
      if (resp) addConn(`r:${keyify(resp)}`, { id: `r:${keyify(resp)}`, label: resp, type: 'actor', val: 3 }, id);
    }

    for (const i of iniciativas) {
      const id = `i:${i.id}`;
      addItem({ id, label: norm(i.titulo), type: 'iniciativa', val: 2, href: '/legislacion', status: norm(i.status ?? i.estatus) });
      const cam = norm(i.camara);
      if (cam) {
        const label = CAMARA_LABEL[cam.toLowerCase()] ?? cam.replace(/_/g, ' ');
        addConn(`c:${keyify(cam)}`, { id: `c:${keyify(cam)}`, label, type: 'camara', val: 4 }, id);
      }
      const temas: string[] = Array.isArray(i.tematicas) ? i.tematicas : [];
      for (const t of temas.slice(0, 3)) {
        const tt = norm(t);
        if (tt) addConn(`t:${keyify(tt)}`, { id: `t:${keyify(tt)}`, label: tt.replace(/_/g, ' '), type: 'tema', val: 3 }, id);
      }
    }

    for (const c of casos) {
      const id = `j:${c.id}`;
      addItem({ id, label: norm(c.nombre ?? c.titulo), type: 'caso', val: 3, href: `/casos-ia/${c.id}`, status: norm(c.estado) });
      const tema = norm(c.temaIA);
      if (tema) addConn(`t:${keyify(tema)}`, { id: `t:${keyify(tema)}`, label: tema.replace(/_/g, ' '), type: 'tema', val: 3 }, id);
      const mat = norm(c.materia);
      if (mat) addConn(`t:${keyify(mat)}`, { id: `t:${keyify(mat)}`, label: mat.replace(/_/g, ' '), type: 'tema', val: 3 }, id);
    }

    // materializar conectores con grado suficiente
    for (const { node, links: ls } of pend.values()) {
      if (ls.length >= MIN_DEG) {
        node.val = Math.min(3 + ls.length * 0.6, 16); // tamaño según cuántos conecta
        nodes.set(node.id, node);
        links.push(...ls);
      }
    }

    // quitar huérfanos: un nodo sin aristas se dispersa y encoge el núcleo del grafo
    const linked = new Set<string>();
    for (const l of links) {
      linked.add(l.source);
      linked.add(l.target);
    }
    const nodeList = [...nodes.values()].filter((n) => linked.has(n.id));

    return NextResponse.json({
      nodes: nodeList,
      links,
      stats: { anuncios: anuncios.length, iniciativas: iniciativas.length, casos: casos.length },
      generado: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[grafo] error:', e);
    return NextResponse.json({ error: 'No se pudo construir el grafo' }, { status: 500 });
  }
}
