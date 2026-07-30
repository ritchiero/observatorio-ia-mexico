import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/grafo/buscar — buscador inteligente del mapa.
// Le da a Grok (vía OpenRouter) el catálogo compacto de nodos del grafo y la
// pregunta del usuario; devuelve una respuesta breve + los ids de nodos
// relevantes para iluminarlos/enfocarlos en el mapa. La llave vive en
// OPENROUTER_API_KEY (env), jamás en el repo.
const MODEL = 'x-ai/grok-4.5';
const MAX_NODOS = 8;

type GNode = {
  id: string; label: string; type: string;
  estado?: string; status?: string; fecha?: string;
  desc?: string; community?: string; communityLabel?: string;
};

// ---- FAST-PATH determinista (OIA-009) ----
// Las preguntas sobre estados/conteos NO se resuelven con el modelo NI contra el
// subconjunto visible del grafo (que descarta huérfanos por MIN_DEG — de ahí venía
// el "4 incumplidos" cuando hay 8): se consultan las COLECCIONES completas y la
// cifra declarada SIEMPRE es el conteo autoritativo.
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
type ItemAut = { gid: string; tipo: 'anuncio' | 'iniciativa' | 'caso'; label: string; status: string; fecha: string };

function bucketDe(status: string): 'vigente' | 'tramite' | 'inactivo' {
  const s = status.toLowerCase();
  if (/(operando|publicada|vigente|aprobada|resuelto|sentencia)/.test(s)) return 'vigente';
  if (/(desechad|archivad|abandonad|incumplid|rechazad|desistid)/.test(s)) return 'inactivo';
  return 'tramite';
}

const ESTADO_QUERIES: Array<{ re: RegExp; match: (it: ItemAut) => boolean; label: string }> = [
  { re: /incumplid/, match: (it) => norm(it.status).includes('incumplid'), label: 'incumplidos' },
  { re: /\boperando\b/, match: (it) => norm(it.status) === 'operando', label: 'operando' },
  { re: /en desarrollo/, match: (it) => norm(it.status) === 'en_desarrollo', label: 'en desarrollo' },
  { re: /prometid/, match: (it) => norm(it.status) === 'prometido', label: 'prometidos' },
  { re: /concluid/, match: (it) => norm(it.status) === 'concluido', label: 'concluidos' },
  { re: /abandonad/, match: (it) => norm(it.status).includes('abandonad'), label: 'abandonados' },
  { re: /vigente/, match: (it) => bucketDe(it.status) === 'vigente', label: 'vigentes' },
  { re: /inactiv/, match: (it) => bucketDe(it.status) === 'inactivo', label: 'inactivos' },
  { re: /en tramite|tramite/, match: (it) => bucketDe(it.status) === 'tramite', label: 'en trámite' },
];

async function catalogoAutoritativo(base: string): Promise<ItemAut[]> {
  const [aR, iR, cR] = await Promise.all([
    fetch(`${base}/api/anuncios?limit=500`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/iniciativas`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/casos-ia`, { cache: 'no-store' }).then((r) => r.json()),
  ]);
  const arr = (j: unknown, ...keys: string[]): Record<string, unknown>[] => {
    if (Array.isArray(j)) return j as Record<string, unknown>[];
    for (const k of keys) {
      const v = (j as Record<string, unknown>)?.[k];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
    return [];
  };
  const s = (v: unknown) => String(v ?? '').trim();
  return [
    ...arr(aR, 'data', 'anuncios').map((a): ItemAut => ({
      gid: `a:${s(a.id)}`, tipo: 'anuncio', label: s(a.titulo), status: s(a.status), fecha: s(a.fechaAnuncio),
    })),
    ...arr(iR, 'data', 'iniciativas').map((i): ItemAut => ({
      gid: `i:${s(i.id)}`, tipo: 'iniciativa', label: s(i.titulo), status: s(i.status ?? i.estatus), fecha: s(i.fecha),
    })),
    ...arr(cR, 'casos', 'data').map((c): ItemAut => ({
      gid: `j:${s(c.id)}`, tipo: 'caso', label: s(c.nombre ?? c.titulo), status: s(c.estado), fecha: s(c.fechaActualizacion ?? c.fechaCreacion),
    })),
  ];
}

async function fastPathEstados(
  pregunta: string,
  base: string,
  byId: Map<string, GNode>,
): Promise<{ respuesta: string; nodos: GNode[] } | null> {
  const q = norm(pregunta);
  const query = ESTADO_QUERIES.find((e) => e.re.test(q));
  if (!query) return null;
  const items = await catalogoAutoritativo(base);
  // alcance opcional por tipo ("anuncios incumplidos" vs "iniciativas vigentes")
  const tipos = (['anuncio', 'iniciativa', 'caso'] as const).filter((t) => q.includes(t));
  const hits = items
    .filter((it) => (tipos.length === 0 || tipos.includes(it.tipo)) && query.match(it))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const alcance = tipos.length === 1 ? `${tipos[0]}s` : 'registros';
  if (!hits.length) {
    return { respuesta: `No hay ${alcance} ${query.label} (conteo directo de la base, no estimación).`, nodos: [] };
  }
  const lista = hits.slice(0, MAX_NODOS).map((it) => `«${it.label.slice(0, 65)}»`).join(' · ');
  const extraCount = hits.length > MAX_NODOS ? ` …y ${hits.length - MAX_NODOS} más.` : '';
  // para iluminar: sólo los que existen como nodo en el mapa (el conteo NO depende de esto)
  const enMapa = hits.filter((it) => byId.has(it.gid)).slice(0, MAX_NODOS).map((it) => byId.get(it.gid)!);
  const notaMapa = enMapa.length < Math.min(hits.length, MAX_NODOS)
    ? ` (${enMapa.length} de ${hits.length} se pintan en el mapa; el resto no tiene conexiones suficientes para aparecer como nodo).`
    : '';
  return {
    respuesta: `Hay ${hits.length} ${alcance} ${query.label} — conteo directo de la base. ${lista}${extraCount}${notaMapa}`.slice(0, 600),
    nodos: enMapa,
  };
}

export async function POST(request: NextRequest) {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: 'Buscador IA no configurado (falta OPENROUTER_API_KEY en el entorno)' },
        { status: 503 },
      );
    }

    const { q } = await request.json();
    const pregunta = String(q ?? '').trim().slice(0, 300);
    if (pregunta.length < 3) {
      return NextResponse.json({ error: 'Pregunta demasiado corta' }, { status: 400 });
    }

    // catálogo del grafo (mismos nodos que ve el usuario)
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.observatorio-ia-mexico.com');
    const g = await fetch(`${base}/api/grafo`, { cache: 'no-store' }).then((r) => r.json());
    const nodes: GNode[] = g?.nodes ?? [];
    if (!nodes.length) {
      return NextResponse.json({ error: 'El grafo no tiene datos' }, { status: 502 });
    }
    const byId = new Map(nodes.map((n) => [n.id, n]));

    // 1) conteos/estados: respuesta determinista desde las colecciones, sin modelo (OIA-009)
    const fp = await fastPathEstados(pregunta, base, byId);
    if (fp) {
      return NextResponse.json({
        respuesta: fp.respuesta,
        nodos: fp.nodos.map((n) => ({ id: n.id, label: n.label, type: n.type, communityLabel: n.communityLabel })),
        determinista: true,
      });
    }

    // 2) todo lo demás: el modelo redacta sobre el catálogo
    const catalogo = nodes
      .map((n) =>
        [
          n.id,
          n.type,
          n.estado ?? '',
          (n as { fecha?: string }).fecha?.slice(0, 10) ?? '',
          n.label.slice(0, 90),
          (n.desc ?? '').replace(/\s+/g, ' ').slice(0, 110),
        ].join('|'),
      )
      .join('\n');

    const system = `Eres el buscador del Observatorio IA México: un mapa (grafo) de cómo el Estado mexicano usa la inteligencia artificial. Recibes el catálogo completo de nodos (formato: id|tipo|estado|fecha_ultimo_movimiento|título|memoria) y una consulta del usuario en lenguaje natural.
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra, con esta forma exacta:
{"respuesta":"1 a 3 frases en español que respondan la consulta con base SOLO en el catálogo","nodos":["id1","id2"]}
Reglas:
1. PRIORIZA EL ESTADO ACTUAL: responde primero qué está pasando HOY —lo vigente/operando y lo en trámite, con su último movimiento y fecha—. Lo histórico o inactivo (desechado, archivado, abandonado) menciónalo solo al final y en una frase, como contexto.
2. Ordena "nodos" igual: primero vigentes/en trámite (lo más reciente primero), al final los inactivos relevantes.
3. Máximo ${MAX_NODOS} nodos; usa exclusivamente ids que existan en el catálogo.
4. Si nada es relevante devuelve nodos:[] y dilo con honestidad.
5. Nunca inventes hechos que no estén en el catálogo; cita fechas cuando existan.`;

    const or = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.observatorio-ia-mexico.com',
        'X-Title': 'Observatorio IA Mexico - buscador del grafo',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 700,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `CATÁLOGO:\n${catalogo}\n\nCONSULTA: ${pregunta}` },
        ],
      }),
    });
    if (!or.ok) {
      const detail = await or.text().catch(() => '');
      console.error('[buscar] OpenRouter', or.status, detail.slice(0, 300));
      return NextResponse.json({ error: `El modelo no respondió (HTTP ${or.status})` }, { status: 502 });
    }
    const data = await or.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? '';
    const jsonTxt = raw.replace(/```json|```/g, '').trim();
    let parsed: { respuesta?: string; nodos?: string[] } = {};
    try {
      parsed = JSON.parse(jsonTxt);
    } catch {
      const m = jsonTxt.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* cae al error de abajo */ } }
    }
    if (typeof parsed.respuesta !== 'string') {
      return NextResponse.json({ error: 'Respuesta ilegible del modelo' }, { status: 502 });
    }

    const nodos = (parsed.nodos ?? [])
      .filter((id) => byId.has(id))
      .slice(0, MAX_NODOS)
      .map((id) => {
        const n = byId.get(id)!;
        return { id: n.id, label: n.label, type: n.type, communityLabel: n.communityLabel };
      });

    return NextResponse.json({ respuesta: parsed.respuesta.slice(0, 600), nodos });
  } catch (e) {
    console.error('[buscar] error:', e);
    const detalle = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Error del buscador', detalle }, { status: 500 });
  }
}
