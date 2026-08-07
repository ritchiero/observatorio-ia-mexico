// Builder de datos del mapa vivo — construye el campo de puntos a partir de
// los objetos públicos REALES del Observatorio: cada registro de las
// colecciones (autoridad de conteo, OIA-009), cada fuente citada, cada
// documento oficial y cada evento de la bitácora. 1 punto = 1 objeto público.

export interface PuntoVivo {
  k: string;            // clúster: ejecutivo|legislativo|judicial|academia|privado|temas|personas|bitacora
  s?: string;           // sub-clúster real (cámara, dependencia) — produce las etiquetas finas
  c: 'registro' | 'fuente' | 'evento' | 'puente' | 'ancla';
  id: string;           // id determinista (posicionamiento por hash)
  l?: string;           // label para hover (solo registros/puentes)
  h?: string;           // href de la ficha
  v?: number;           // peso visual
  n?: boolean;          // reciente
  p?: number;           // índice del punto padre (satélites orbitan)
}

export interface DatosMapaVivo {
  puntos: PuntoVivo[];
  enlaces: [number, number][];
  stats: { anuncios: number; iniciativas: number; casos: number; fuentes: number; eventos: number; personas: number; temas: number };
}

const BASE = 'https://www.observatorio-ia-mexico.com';

export async function datosMapaVivo(base: string = BASE): Promise<DatosMapaVivo> {
  const vacio: DatosMapaVivo = { puntos: [], enlaces: [], stats: { anuncios: 0, iniciativas: 0, casos: 0, fuentes: 0, eventos: 0, personas: 0, temas: 0 } };
  try {
    // allSettled: si una API falla, el mapa se dibuja con lo demás (no se vacía)
    const pide = (ruta: string) =>
      fetch(`${base}${ruta}`, { next: { revalidate: 300 } }).then((r) => (r.ok ? r.json() : {}));
    const [g, a, i, c, act] = (
      await Promise.allSettled([
        pide('/api/grafo'), pide('/api/anuncios'), pide('/api/iniciativas'),
        pide('/api/casos-ia'), pide('/api/actividad?limit=500'),
      ])
    ).map((r) => (r.status === 'fulfilled' ? r.value : {})) as Array<Record<string, unknown>>;
    const arr = (v: unknown) => (Array.isArray(v) ? (v as Array<Record<string, unknown>>) : undefined);
    const anuncios = arr(a.data) ?? arr(a.anuncios) ?? [];
    const iniciativas = arr(i.data) ?? arr(i.iniciativas) ?? [];
    const casos = arr(c.casos) ?? arr(c.data) ?? [];
    const actividad = arr(act.actividad) ?? arr(act.data) ?? arr(act.logs) ?? [];
    const gnodes = arr(g.nodes) ?? [];

    const puntos: PuntoVivo[] = [];
    const idx = new Map<string, number>();
    const push = (p: PuntoVivo) => { idx.set(p.id, puntos.length); puntos.push(p); };
    let fuentes = 0;

    // Ente real por anuncio, del grafo (los anuncios de UNAM son academia,
    // los de las cámaras legislativo…); huérfanos del grafo → ejecutivo.
    const enteDeAnuncio = new Map<string, string>();
    for (const n of gnodes) {
      if (String(n.type) === 'anuncio' && typeof n.ente === 'string') {
        enteDeAnuncio.set(String(n.id).replace(/^a:/, ''), n.ente);
      }
    }

    // Normalización canónica de instituciones — la MISMA para los registros
    // (sub-clúster) y para los nodos actor/cámara del grafo (soles): así cada
    // sol aterriza exactamente sobre el enjambre de sus fichas y los
    // duplicados del grafo ("ATDT" vs nombre largo) se fusionan en un cuerpo.
    const INSTITUCIONES: Array<[RegExp, string]> = [
      [/diputad/i, 'Diputados'],
      [/senad/i, 'Senado'],
      [/congreso/i, 'Congresos locales'],
      [/atdt|transformaci[oó]n digital/i, 'ATDT'],
      [/presidencia|sheinbaum/i, 'Presidencia'],
      [/econom[ií]a/i, 'Economía'],
      [/educaci[oó]n p[uú]blica|\bsep\b/i, 'SEP'],
      [/cultura/i, 'Cultura'],
      [/unam|ccoia/i, 'UNAM · CCOIA'],
      [/buap/i, 'BUAP'],
      [/tecnm/i, 'TecNM'],
      [/nuevo le[oó]n/i, 'Gob. Nuevo León'],
    ];
    const normInstitucion = (raw: string): string | null => {
      for (const [re, key] of INSTITUCIONES) if (re.test(raw)) return key;
      return null;
    };
    const camaraDe = (c: unknown): string => {
      const v = String(c ?? '');
      return normInstitucion(v) && /diputad|senad/i.test(v) ? (normInstitucion(v) as string) : 'Congresos locales';
    };
    const depDe = (x: Record<string, unknown>): string => {
      const raw = String(x.dependencia ?? x.responsable ?? '').trim();
      if (!raw) return 'Otras dependencias';
      const canon = normInstitucion(raw);
      if (canon) return canon;
      const sigla = raw.match(/\(([A-ZÁÉÍÓÚ]{2,12})\)/);
      if (sigla) return sigla[1];
      const corto = raw.split(/[,—-]/)[0].trim();
      return corto.length > 26 ? corto.slice(0, 24) + '…' : corto;
    };

    // Registros de las colecciones (la autoridad) + sus fuentes como satélites
    for (const x of anuncios) {
      const id = `a:${x.id}`;
      const sub = depDe(x);
      const kA = enteDeAnuncio.get(String(x.id)) ?? 'ejecutivo';
      push({ k: kA, s: sub, c: 'registro', id, l: String(x.titulo ?? ''), h: `/anuncio/${x.id}`, v: 2 });
      const fs = Array.isArray(x.fuentes) ? x.fuentes.length : 0;
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: kA, s: sub, c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }
    for (const x of iniciativas) {
      const id = `i:${x.id}`;
      const sub = camaraDe(x.camara);
      push({ k: 'legislativo', s: sub, c: 'registro', id, l: String(x.titulo ?? ''), h: `/legislacion/${x.id}`, v: 1.6 });
      let fs = Array.isArray(x.fuentes) ? x.fuentes.length : 0;
      if (x.urlGaceta) fs++;
      if (x.urlPDFBackup) fs++;
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: 'legislativo', s: sub, c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }
    for (const x of casos) {
      const id = `j:${x.id}`;
      push({ k: 'judicial', c: 'registro', id, l: String(x.nombre ?? ''), h: `/casos-ia/${x.id}`, v: 2.4 });
      const fs = (Array.isArray(x.fuentes) ? x.fuentes.length : 0) + (Array.isArray(x.documentos) ? x.documentos.length : 0);
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: 'judicial', c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }

    // Personas y temas del grafo (puentes) + actores/cámaras como SOLES:
    // la jerarquía gravitacional — instituciones grandes, fichas orbitando.
    let personas = 0, temas = 0;
    const soles = new Map<string, { k: string; s: string; v: number; ids: string[] }>();
    for (const n of gnodes) {
      const t = String(n.type);
      if (t === 'persona' || t === 'tema') {
        const k = t === 'persona' ? 'personas' : 'temas';
        if (t === 'persona') personas++; else temas++;
        push({ k, c: 'puente', id: String(n.id), l: String(n.label ?? ''), h: typeof n.href === 'string' ? n.href : undefined, v: Math.min(Number(n.val) || 1, 4) });
      } else if (t === 'actor' || t === 'camara') {
        const label = String(n.label ?? '');
        const canon = normInstitucion(label) ?? (label.length > 24 ? label.slice(0, 22) + '…' : label);
        const ente = (typeof n.ente === 'string' && n.ente) || (t === 'camara' ? 'legislativo' : 'temas');
        const key = `${ente}|${canon}`;
        const e = soles.get(key) ?? { k: ente, s: canon, v: 0, ids: [] };
        e.v = Math.max(e.v, Number(n.val) || 1);
        e.ids.push(String(n.id));
        soles.set(key, e);
      }
    }
    for (const e of soles.values()) {
      // un solo cuerpo por institución; conserva el primer id del grafo para
      // que las relaciones (links) sigan conectando con él
      push({ k: e.k, s: e.s, c: 'ancla', id: e.ids[0], l: e.s, v: e.v });
      for (let j = 1; j < e.ids.length; j++) idx.set(e.ids[j], idx.get(e.ids[0])!);
    }
    // El Poder Judicial no trae nodo institucional en el grafo → sol sintético
    if (![...soles.values()].some((e) => e.k === 'judicial')) {
      push({ k: 'judicial', c: 'ancla', id: 'ancla:judicial', l: 'SCJN · Tribunales', v: 4 + casos.length });
    }

    // Bitácora: cada entrada del monitoreo es un objeto público (el polvo del disco)
    actividad.forEach((e, j) => push({ k: 'bitacora', c: 'evento', id: `e:${e.id ?? j}` }));

    // Relaciones documentadas del grafo, mapeadas a nuestros puntos
    const enlaces: [number, number][] = [];
    for (const l of (arr(g.links) ?? []) as unknown as Array<{ source: string; target: string }>) {
      const s1 = idx.get(String(l.source)), t1 = idx.get(String(l.target));
      if (s1 != null && t1 != null) enlaces.push([s1, t1]);
    }

    return {
      puntos, enlaces,
      stats: { anuncios: anuncios.length, iniciativas: iniciativas.length, casos: casos.length, fuentes, eventos: actividad.length, personas, temas },
    };
  } catch (err) {
    console.error('[mapa-vivo] no se pudieron construir los datos', err);
    return vacio;
  }
}
