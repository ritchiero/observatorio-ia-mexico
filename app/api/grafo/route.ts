import { NextResponse } from 'next/server';
import { asignarComunidades } from '@/lib/grafo-comunidades';
import { anioAparicionItem, anioHub, anioMesh } from '@/lib/grafo-tiempo';

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
  type: 'anuncio' | 'iniciativa' | 'caso' | 'actor' | 'tema' | 'camara' | 'persona';
  val: number;          // tamaño relativo
  href?: string;        // a dónde navegar al hacer clic
  status?: string;
  estado?: 'vigente' | 'tramite' | 'inactivo';  // bucket de segmentación
  nuevo?: boolean;      // detectado en los últimos 90 días
  community?: string;   // casa primaria para separar el mapa en archipiélagos
  communityLabel?: string;
  desc?: string;        // memoria del nodo: qué es / qué pasa con el tema
  fecha?: string;       // último movimiento conocido (ISO)
  anio?: number | null; // año de APARICIÓN en el atlas (modo Historia)
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
type Link = { source: string; target: string; kind?: 'rel' | 'mesh'; w?: number; prim?: boolean; cross?: boolean; anio?: number | null };

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

// heurística: nombres de instituciones no son 'personas clave'
function esInstitucion(v: string): boolean {
  // Cargos jurisdiccionales sin nombre propio ("Juez de Distrito", "Magistrada de
  // Circuito") describen al órgano, no a una persona identificable.
  if (/^(juez|jueza|magistrad[oa]|ministr[oa])\s+(de|del|en)\b/i.test(v)) return true;
  return /(secretar|agencia|instituto|comisi[oó]n|consejo|poder|gobierno|congreso|c[aá]mara|senado|fiscal[ií]a|ministerio|universidad|tribunal|juzgado|sala|direcci[oó]n|coordinaci[oó]n|grupo|partido|s\.a\.|empresa)/i.test(v);
}

// Descriptores colectivos de un expediente ("diversas personas quejosas", "terceros
// interesados"): no son ni gente identificable ni instituciones, así que no merecen nodo.
function esColectivoGenerico(v: string): boolean {
  return /^(diversas |las |los )?(personas? (quejosas?|f[ií]sicas?)|quejosos?|terceros?|albaceas?|demandantes?|actores?|usuarios?)\b/i.test(v);
}

type RawRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export async function GET() {
  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.observatorio-ia-mexico.com');

    const [anR, inR, caR] = await Promise.all([
      fetch(`${base}/api/anuncios?limit=500`, { next: { revalidate: 300 } }),
      fetch(`${base}/api/iniciativas`, { next: { revalidate: 300 } }),
      fetch(`${base}/api/casos-ia`, { next: { revalidate: 300 } }),
    ]);
    const pick = (json: unknown, ...keys: string[]): RawRecord[] => {
      if (Array.isArray(json)) return json.filter(isRecord);
      if (!isRecord(json)) return [];
      for (const key of keys) {
        const value = json[key];
        if (Array.isArray(value)) return value.filter(isRecord);
      }
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
      addItem({ id, label: norm(a.titulo), type: 'anuncio', val: 2, href: `/anuncio/${a.id}`, status: st, estado: bucket(st), nuevo: esNuevo(a.fechaAnuncio ?? a.createdAt), desc: norm(a.resumenAgente || a.descripcion).slice(0, 460), fecha: norm(a.fechaAnuncio ?? a.createdAt) || undefined, anio: anioAparicionItem('anuncio', a) });
      const dep = norm(a.dependencia);
      if (dep) addConn(`d:${keyify(dep)}`, { id: `d:${keyify(dep)}`, label: dep, type: 'actor', val: 3 }, id, true);
      const resp = norm(a.responsable);
      if (resp && !esInstitucion(resp)) addConn(`r:${keyify(resp)}`, { id: `r:${keyify(resp)}`, label: resp, type: 'persona', val: 3 }, id);
      else if (resp) addConn(`r:${keyify(resp)}`, { id: `r:${keyify(resp)}`, label: resp, type: 'actor', val: 3 }, id);
    }

    for (const i of iniciativas) {
      const id = `i:${i.id}`;
      const st = norm(i.status ?? i.estatus);
      addItem({ id, label: norm(i.titulo), type: 'iniciativa', val: 2, href: '/legislacion', status: st, estado: bucket(st), nuevo: esNuevo(i.fecha), desc: norm(i.descripcion).slice(0, 460), fecha: norm(i.fecha) || undefined, anio: anioAparicionItem('iniciativa', i) });
      const temas = Array.isArray(i.tematicas)
        ? i.tematicas.filter((tema): tema is string => typeof tema === 'string')
        : [];
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
      // personas clave: quién propone (los recurrentes emergen con MIN_DEG)
      const prop = norm(i.proponente);
      if (prop && prop.length <= 60 && !esInstitucion(prop)) {
        addConn(`p:${keyify(prop)}`, { id: `p:${keyify(prop)}`, label: prop, type: 'persona', val: 3 }, id);
      }
    }

    for (const c of casos) {
      const id = `j:${c.id}`;
      const st = norm(c.estado);
      addItem({ id, label: norm(c.nombre ?? c.titulo), type: 'caso', val: 3, href: `/casos-ia/${c.id}`, status: st, estado: bucket(st), nuevo: esNuevo(c.fechaActualizacion ?? c.fechaCreacion), desc: norm(c.resumen ?? c.hechos).slice(0, 460), fecha: norm(c.fechaActualizacion ?? c.fechaCreacion) || undefined, anio: anioAparicionItem('caso', c) });
      const tema = norm(c.temaIA);
      if (tema) addConn(`t:${keyify(tema)}`, { id: `t:${keyify(tema)}`, label: tema.replace(/_/g, ' '), type: 'tema', val: 3 }, id, true);
      const mat = norm(c.materia);
      if (mat) addConn(`t:${keyify(mat)}`, { id: `t:${keyify(mat)}`, label: mat.replace(/_/g, ' '), type: 'tema', val: 3 }, id);
      // partes clave del litigio (quejosos, demandados, terceros, ponentes)
      // Las partes institucionales (juzgados, fiscalías, institutos) entran como 'actor',
      // no como 'persona': si no, la capa de personas se llena de organismos y se pierde
      // de vista quién es realmente la gente detrás de los casos.
      const partes = isRecord(c.partes) ? c.partes : {};
      for (const v of Object.values(partes)) {
        const parte = norm(v).slice(0, 70);
        if (!parte) continue;
        if (esColectivoGenerico(parte)) continue;
        const tipo = esInstitucion(parte) ? 'actor' : 'persona';
        addConn(`p:${keyify(parte)}`, { id: `p:${keyify(parte)}`, label: parte, type: tipo, val: 3 }, id);
      }
    }

    // === LABORATORIO DEL OBSERVATORIO: caso propio Rompehielos INDAUTOR ===
    // Experimento transparente del Legal-IA-Lab: registrar ante INDAUTOR dos obras
    // generadas con IA para forzar un pronunciamiento. Fuente: aldoricardo.com.
    {
      const labId = 'lab:rompehielos-indautor';
      addItem({
        id: labId,
        label: 'Rompehielos INDAUTOR — obras generadas con IA (Legal-IA-Lab)',
        type: 'caso',
        val: 3,
        href: 'https://aldoricardo.com/Legal-IA-Lab/Rompehielos-Indautor-Obras-generadas-con-IA',
        status: 'en_proceso',
        estado: 'tramite',
        nuevo: esNuevo('2026-05-29'),
        fecha: '2026-05-29',
        anio: 2025,
        desc:
          'Experimento del laboratorio del Observatorio: se solicitó a INDAUTOR el registro de dos obras visuales generadas con IA (GPT-4o, 1 prompt; Midjourney, 5 prompts) declarando el uso de IA, para forzar un pronunciamiento sobre la autoría humana asistida. INDAUTOR desechó ambos registros (jun-2025) y el TFJA (Sala de Propiedad Intelectual, exp. 1637/25-EPI-01-10) ratificó las negativas en mayo de 2026: “es la IA quien materializa la idea”. Próximo paso: amparo.',
      });
      addConn('t:derechos-autor', { id: 't:derechos-autor', label: 'derechos autor', type: 'tema', val: 3 }, labId, true);
      addConn('t:propiedad-intelectual', { id: 't:propiedad-intelectual', label: 'propiedad intelectual', type: 'tema', val: 3 }, labId);
      addConn('p:aldo-ricardo-rodriguez-cortes', { id: 'p:aldo-ricardo-rodriguez-cortes', label: 'Aldo Ricardo Rodríguez Cortés', type: 'persona', val: 3 }, labId);
    }

    // materializar conectores con grado suficiente
    // (excepción: las PERSONAS de un litigio —quejosos, demandados— importan aunque
    // aparezcan una sola vez: son la cara humana del precedente)
    const hubItems = new Map<string, Set<string>>(); // hub -> items que conecta
    for (const { node, links: ls } of pend.values()) {
      const esParteDeCaso =
        node.type === 'persona' && ls.some((l) => l.source.startsWith('j:') || l.source.startsWith('lab:'));
      if (ls.length >= MIN_DEG || esParteDeCaso) {
        node.val = Math.min(3 + ls.length * 1.15, 42); // tamaño según cuántos conecta (jerarquía fuerte)
        nodes.set(node.id, node);
        links.push(...ls.map((l) => ({ ...l, kind: 'rel' as const, anio: nodes.get(l.source)?.anio ?? null })));
        hubItems.set(node.id, new Set(ls.map((l) => l.source)));
      }
    }

    // memoria computada de cada hub: cuántos conecta, de qué poderes, en qué
    // estado están y cuál fue el último movimiento — TODO derivado de los datos
    const PODER_LABEL: Record<string, string> = { anuncio: 'Ejecutivo', iniciativa: 'Legislativo', caso: 'Judicial' };
    for (const [hubId, itemIds] of hubItems) {
      const hub = nodes.get(hubId);
      if (!hub) continue;
      const its = [...itemIds].map((iid) => nodes.get(iid)).filter(Boolean) as Node[];
      if (!its.length) continue;
      const porPoder = new Map<string, number>();
      const porEstado = { vigente: 0, tramite: 0, inactivo: 0 } as Record<string, number>;
      let last: Node | null = null;
      for (const it of its) {
        porPoder.set(it.type, (porPoder.get(it.type) ?? 0) + 1);
        if (it.estado) porEstado[it.estado] = (porEstado[it.estado] ?? 0) + 1;
        if (it.fecha && (!last || String(it.fecha) > String(last.fecha ?? ''))) last = it;
      }
      const poderTxt = [...porPoder.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => `${n} del ${PODER_LABEL[t] ?? t}`)
        .join(', ');
      const estadoTxt = [
        porEstado.vigente ? `${porEstado.vigente} vigentes` : '',
        porEstado.tramite ? `${porEstado.tramite} en trámite` : '',
        porEstado.inactivo ? `${porEstado.inactivo} inactivos` : '',
      ].filter(Boolean).join(', ');
      const lastTxt = last?.fecha
        ? ` Último movimiento: ${String(last.fecha).slice(0, 10)} — «${String(last.label).slice(0, 90)}».`
        : '';
      hub.desc = `Conecta ${its.length} registros (${poderTxt}). Estado: ${estadoTxt || 'sin clasificar'}.${lastTxt}`;
      hub.fecha = last?.fecha;
      hub.anio = anioHub(its.map((it) => it.anio ?? null));
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
        const aniosCompartidos: Array<number | null> = [];
        for (const x of A) if (B.has(x)) { shared++; aniosCompartidos.push(nodes.get(x)?.anio ?? null); }
        if (shared >= 2) mesh.push({ source: hubIds[i], target: hubIds[j], kind: 'mesh', w: shared, anio: anioMesh(aniosCompartidos) });
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
      stats: {
        anuncios: anuncios.length,
        iniciativas: iniciativas.length,
        casos: casos.length + 1, // + caso propio del laboratorio (Rompehielos INDAUTOR)
        comunidades: new Set(nodeList.map((n) => n.community).filter(Boolean)).size,
        // modo Historia: cuántos registros APARECEN cada año, por poder + sin fecha.
        // Se cuenta sobre el dataset COMPLETO (mismo universo que anuncios/iniciativas/casos
        // de arriba): así sum(porAnio) + sinFecha cuadra con los totales de "Hoy".
        anual: (() => {
          const porAnio: Record<string, { anuncios: number; iniciativas: number; casos: number }> = {};
          const sinFecha = { anuncios: 0, iniciativas: 0, casos: 0 };
          const cuenta = (t: 'anuncios' | 'iniciativas' | 'casos', y: number | null) => {
            if (y == null) { sinFecha[t] += 1; return; }
            const k = String(y);
            porAnio[k] = porAnio[k] ?? { anuncios: 0, iniciativas: 0, casos: 0 };
            porAnio[k][t] += 1;
          };
          for (const a of anuncios) cuenta('anuncios', anioAparicionItem('anuncio', a));
          for (const i of iniciativas) cuenta('iniciativas', anioAparicionItem('iniciativa', i));
          for (const c of casos) cuenta('casos', anioAparicionItem('caso', c));
          cuenta('casos', 2025); // caso propio del laboratorio (Rompehielos INDAUTOR)
          return { porAnio, sinFecha };
        })(),
      },
      generado: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[grafo] error:', e);
    return NextResponse.json({ error: 'No se pudo construir el grafo' }, { status: 500 });
  }
}
