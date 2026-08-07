// Builder de datos del mapa vivo — construye el campo de puntos a partir de
// los objetos públicos REALES del Observatorio: cada registro de las
// colecciones (autoridad de conteo, OIA-009), cada fuente citada, cada
// documento oficial y cada evento de la bitácora. 1 punto = 1 objeto público.

export interface PuntoVivo {
  k: string;            // clúster: ejecutivo|legislativo|judicial|academia|privado|temas|personas|bitacora
  c: 'registro' | 'fuente' | 'evento' | 'puente';
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

export async function datosMapaVivo(): Promise<DatosMapaVivo> {
  const vacio: DatosMapaVivo = { puntos: [], enlaces: [], stats: { anuncios: 0, iniciativas: 0, casos: 0, fuentes: 0, eventos: 0, personas: 0, temas: 0 } };
  try {
    // allSettled: si una API falla, el mapa se dibuja con lo demás (no se vacía)
    const pide = (ruta: string) =>
      fetch(`${BASE}${ruta}`, { next: { revalidate: 300 } }).then((r) => (r.ok ? r.json() : {}));
    const [g, a, i, c, act] = (
      await Promise.allSettled([
        pide('/api/grafo'), pide('/api/anuncios'), pide('/api/iniciativas'),
        pide('/api/casos-ia'), pide('/api/actividad?limit=500'),
      ])
    ).map((r) => (r.status === 'fulfilled' ? r.value : {}));
    const anuncios = (a.data ?? a.anuncios ?? []) as Array<Record<string, unknown>>;
    const iniciativas = (i.data ?? i.iniciativas ?? []) as Array<Record<string, unknown>>;
    const casos = (c.casos ?? c.data ?? []) as Array<Record<string, unknown>>;
    const actividad = (act.actividad ?? act.data ?? act.logs ?? []) as Array<Record<string, unknown>>;
    const gnodes = (g.nodes ?? []) as Array<Record<string, unknown>>;

    const puntos: PuntoVivo[] = [];
    const idx = new Map<string, number>();
    const push = (p: PuntoVivo) => { idx.set(p.id, puntos.length); puntos.push(p); };
    let fuentes = 0;

    // Registros de las colecciones (la autoridad) + sus fuentes como satélites
    for (const x of anuncios) {
      const id = `a:${x.id}`;
      push({ k: 'ejecutivo', c: 'registro', id, l: String(x.titulo ?? ''), h: `/anuncio/${x.id}`, v: 2 });
      const fs = Array.isArray(x.fuentes) ? x.fuentes.length : 0;
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: 'ejecutivo', c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }
    for (const x of iniciativas) {
      const id = `i:${x.id}`;
      push({ k: 'legislativo', c: 'registro', id, l: String(x.titulo ?? ''), h: `/legislacion/${x.id}`, v: 1.6 });
      let fs = Array.isArray(x.fuentes) ? x.fuentes.length : 0;
      if (x.urlGaceta) fs++;
      if (x.urlPDFBackup) fs++;
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: 'legislativo', c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }
    for (const x of casos) {
      const id = `j:${x.id}`;
      push({ k: 'judicial', c: 'registro', id, l: String(x.nombre ?? ''), h: `/casos-ia/${x.id}`, v: 2.4 });
      const fs = (Array.isArray(x.fuentes) ? x.fuentes.length : 0) + (Array.isArray(x.documentos) ? x.documentos.length : 0);
      for (let j = 0; j < fs; j++) { fuentes++; push({ k: 'judicial', c: 'fuente', id: `${id}·f${j}`, p: idx.get(id) }); }
    }

    // Entidades del grafo que no viven en colecciones: personas, temas, actores, cámaras
    let personas = 0, temas = 0;
    for (const n of gnodes) {
      const t = String(n.type);
      if (t === 'persona' || t === 'tema' || t === 'actor' || t === 'camara') {
        const k = t === 'persona' ? 'personas' : t === 'tema' ? 'temas' : (typeof n.ente === 'string' && n.ente) || (t === 'camara' ? 'legislativo' : 'temas');
        if (t === 'persona') personas++;
        if (t === 'tema') temas++;
        push({ k, c: 'puente', id: String(n.id), l: String(n.label ?? ''), h: typeof n.href === 'string' ? n.href : undefined, v: Math.min(Number(n.val) || 1, 3) });
      }
    }

    // Bitácora: cada entrada del monitoreo es un objeto público (el polvo del disco)
    actividad.forEach((e, j) => push({ k: 'bitacora', c: 'evento', id: `e:${e.id ?? j}` }));

    // Relaciones documentadas del grafo, mapeadas a nuestros puntos
    const enlaces: [number, number][] = [];
    for (const l of (g.links ?? []) as Array<{ source: string; target: string }>) {
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
