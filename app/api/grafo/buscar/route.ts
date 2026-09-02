import { NextRequest, NextResponse } from 'next/server';
import { bucketDe } from '@/lib/estados';
import { buscarPorTerminos, respuestaRespaldo } from '@/lib/grafo-busqueda-fallback';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/grafo/buscar — buscador inteligente del mapa.
// Le da a Grok (vía OpenRouter) el catálogo compacto de nodos del grafo y la
// pregunta del usuario; devuelve una respuesta breve + los ids de nodos
// relevantes para iluminarlos/enfocarlos en el mapa. La llave vive en
// OPENROUTER_API_KEY (env), jamás en el repo.
// Configurable sin redeploy de código: GRAFO_MODEL en el entorno.
const MODEL = process.env.GRAFO_MODEL || 'x-ai/grok-4.5';
// Tope para el modelo. La función tiene 60 s; sin este tope, una respuesta lenta
// de OpenRouter colgaba al usuario hasta el maxDuration (auditoría 1-sep-2026: 25 s+).
const TIMEOUT_MODELO_MS = Number(process.env.GRAFO_TIMEOUT_MS || 20_000);
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

const ESTADO_QUERIES: Array<{ re: RegExp; reEn: RegExp; match: (it: ItemAut) => boolean; label: string; labelEn: string }> = [
  { re: /incumplid/, reEn: /\bbroken\b|not (?:kept|met)|unfulfilled/, match: (it) => norm(it.status).includes('incumplid'), label: 'incumplidos', labelEn: 'broken' },
  { re: /\boperando\b/, reEn: /\boperating\b|\blive\b/, match: (it) => norm(it.status) === 'operando', label: 'operando', labelEn: 'operating' },
  { re: /en desarrollo/, reEn: /in development/, match: (it) => norm(it.status) === 'en_desarrollo', label: 'en desarrollo', labelEn: 'in development' },
  { re: /prometid/, reEn: /\bpromised\b/, match: (it) => norm(it.status) === 'prometido', label: 'prometidos', labelEn: 'promised' },
  { re: /concluid/, reEn: /\bconcluded\b|\bcompleted\b/, match: (it) => norm(it.status) === 'concluido', label: 'concluidos', labelEn: 'concluded' },
  { re: /abandonad/, reEn: /\babandoned\b/, match: (it) => norm(it.status).includes('abandonad'), label: 'abandonados', labelEn: 'abandoned' },
  { re: /vigente/, reEn: /\bactive\b|in force/, match: (it) => bucketDe(it.status) === 'vigente', label: 'vigentes', labelEn: 'active' },
  { re: /inactiv/, reEn: /\binactive\b/, match: (it) => bucketDe(it.status) === 'inactivo', label: 'inactivos', labelEn: 'inactive' },
  { re: /en tramite|tramite/, reEn: /in progress|pending/, match: (it) => bucketDe(it.status) === 'tramite', label: 'en trámite', labelEn: 'in progress' },
];

async function catalogoAutoritativo(base: string): Promise<ItemAut[]> {
  const [aR, iR, cR] = await Promise.all([
    fetch(`${base}/api/anuncios?limit=500`, { next: { revalidate: 60 } }).then((r) => r.json()),
    fetch(`${base}/api/iniciativas`, { next: { revalidate: 60 } }).then((r) => r.json()),
    fetch(`${base}/api/casos-ia`, { next: { revalidate: 60 } }).then((r) => r.json()),
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

const TIPO_EN: Record<'anuncio' | 'iniciativa' | 'caso', string> = { anuncio: 'announcement', iniciativa: 'bill', caso: 'case' };
const TIPO_QUERY_EN: Record<'anuncio' | 'iniciativa' | 'caso', RegExp> = {
  anuncio: /announcement|promise/,
  iniciativa: /\bbills?\b|legislat|initiative/,
  caso: /\bcases?\b|judicial/,
};

async function fastPathEstados(
  pregunta: string,
  base: string,
  lang: 'es' | 'en',
): Promise<{ respuesta: string; nodos: GNode[] } | null> {
  const q = norm(pregunta);
  const query = ESTADO_QUERIES.find((e) => (lang === 'en' ? e.reEn : e.re).test(q));
  if (!query) return null;
  const items = await catalogoAutoritativo(base);
  // el grafo SÓLO se usa para iluminar nodos; si falla, el conteo sale igual
  let byId = new Map<string, GNode>();
  try {
    const g = await fetch(`${base}/api/grafo`, { next: { revalidate: 300 } }).then((r) => r.json());
    byId = new Map(((g?.nodes ?? []) as GNode[]).map((n) => [n.id, n]));
  } catch { /* sin mapa no hay iluminación, pero la cifra es la misma */ }
  // alcance opcional por tipo ("anuncios incumplidos" vs "iniciativas vigentes" / "broken bills")
  const tipos = (['anuncio', 'iniciativa', 'caso'] as const).filter((t) =>
    lang === 'en' ? TIPO_QUERY_EN[t].test(q) : q.includes(t),
  );
  const hits = items
    .filter((it) => (tipos.length === 0 || tipos.includes(it.tipo)) && query.match(it))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (lang === 'en') {
    const alcanceEn = tipos.length === 1 ? `${TIPO_EN[tipos[0]]}s` : 'records';
    if (!hits.length) {
      return { respuesta: `There are no ${query.labelEn} ${alcanceEn} (direct count from the database, not an estimate).`, nodos: [] };
    }
    const lista = hits.slice(0, MAX_NODOS).map((it) => `«${it.label.slice(0, 65)}»`).join(' · ');
    const extraCount = hits.length > MAX_NODOS ? ` …and ${hits.length - MAX_NODOS} more.` : '';
    const enMapa = hits.filter((it) => byId.has(it.gid)).slice(0, MAX_NODOS).map((it) => byId.get(it.gid)!);
    const notaMapa = enMapa.length < Math.min(hits.length, MAX_NODOS)
      ? ` (${enMapa.length} of ${hits.length} are drawn on the map; the rest don't have enough connections to appear as a node).`
      : '';
    return {
      respuesta: `There are ${hits.length} ${query.labelEn} ${alcanceEn} — direct count from the database. ${lista}${extraCount}${notaMapa}`,
      nodos: enMapa,
    };
  }

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
    // sin truncar: la lista de títulos ya está acotada (MAX_NODOS × 65 chars)
    respuesta: `Hay ${hits.length} ${alcance} ${query.label} — conteo directo de la base. ${lista}${extraCount}${notaMapa}`,
    nodos: enMapa,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { q, lang: langRaw } = await request.json();
    const pregunta = String(q ?? '').trim().slice(0, 300);
    const lang: 'es' | 'en' = langRaw === 'en' ? 'en' : 'es';
    if (pregunta.length < 3) {
      return NextResponse.json({ error: lang === 'en' ? 'Question is too short' : 'Pregunta demasiado corta' }, { status: 400 });
    }

    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.observatorio-ia-mexico.com');

    // 1) conteos/estados: determinista desde las colecciones — ANTES de exigir la
    //    llave del modelo y sin depender del grafo (OIA-009: si falla OpenRouter o
    //    el grafo, el conteo sale igual).
    const fp = await fastPathEstados(pregunta, base, lang);
    if (fp) {
      return NextResponse.json({
        respuesta: fp.respuesta,
        nodos: fp.nodos.map((n) => ({ id: n.id, label: n.label, type: n.type, communityLabel: n.communityLabel })),
        determinista: true,
      });
    }

    // 2) todo lo demás: el modelo redacta sobre el catálogo del grafo
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: lang === 'en' ? 'AI search is not configured (missing OPENROUTER_API_KEY)' : 'Buscador IA no configurado (falta OPENROUTER_API_KEY en el entorno)' },
        { status: 503 },
      );
    }
    const g = await fetch(`${base}/api/grafo`, { next: { revalidate: 300 } }).then((r) => r.json());
    const nodes: GNode[] = g?.nodes ?? [];
    if (!nodes.length) {
      return NextResponse.json({ error: lang === 'en' ? 'The map has no data' : 'El grafo no tiene datos' }, { status: 502 });
    }
    const byId = new Map(nodes.map((n) => [n.id, n]));

    const catalogo = nodes
      .map((n) =>
        [
          n.id,
          n.type,
          n.estado ?? '',
          (n as { fecha?: string }).fecha?.slice(0, 10) ?? '',
          n.label.slice(0, 72),
          (n.desc ?? '').replace(/\s+/g, ' ').slice(0, 70),
        ].join('|'),
      )
      .join('\n');

    const system = lang === 'en'
      ? `You are the search assistant for Observatorio IA México: a map (graph) of how the Mexican state uses artificial intelligence. You receive the full catalog of nodes (format: id|type|status|last_movement_date|title|memory, all in Spanish — the underlying data is Spanish-language) and a user query in English.
Respond ONLY with valid JSON, no markdown, no extra text, in exactly this shape:
{"respuesta":"1 to 3 sentences in ENGLISH answering the query based ONLY on the catalog","nodos":["id1","id2"]}
Rules:
1. PRIORITIZE THE CURRENT STATE: answer first what is happening TODAY — what's active/operating and in progress, with its last movement and date. Mention historical or inactive items (discarded, archived, abandoned) only at the end, briefly, as context.
2. Order "nodos" the same way: active/in-progress first (most recent first), relevant inactive ones last.
3. Maximum ${MAX_NODOS} nodes; use only ids that exist in the catalog.
4. If nothing is relevant, return nodos:[] and say so honestly.
5. Never invent facts not in the catalog; cite dates when available.
6. Official names of laws, courts, and agencies stay in Spanish, with a brief English gloss in parentheses the first time. Mexican legal/procedural terms (amparo, tesis, jurisprudencia, SCJN...) stay in Spanish with a brief gloss too. Everything else: clear, natural English.`
      : `Eres el buscador del Observatorio IA México: un mapa (grafo) de cómo el Estado mexicano usa la inteligencia artificial. Recibes el catálogo completo de nodos (formato: id|tipo|estado|fecha_ultimo_movimiento|título|memoria) y una consulta del usuario en lenguaje natural.
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra, con esta forma exacta:
{"respuesta":"1 a 3 frases en español que respondan la consulta con base SOLO en el catálogo","nodos":["id1","id2"]}
Reglas:
1. PRIORIZA EL ESTADO ACTUAL: responde primero qué está pasando HOY —lo vigente/operando y lo en trámite, con su último movimiento y fecha—. Lo histórico o inactivo (desechado, archivado, abandonado) menciónalo solo al final y en una frase, como contexto.
2. Ordena "nodos" igual: primero vigentes/en trámite (lo más reciente primero), al final los inactivos relevantes.
3. Máximo ${MAX_NODOS} nodos; usa exclusivamente ids que existan en el catálogo.
4. Si nada es relevante devuelve nodos:[] y dilo con honestidad.
5. Nunca inventes hechos que no estén en el catálogo; cita fechas cuando existan.`;

    // Respaldo: si el modelo tarda o falla, se responde con coincidencia literal
    // sobre el catálogo y se dice explícitamente que es un respaldo.
    const respaldo = () => {
      const hits = buscarPorTerminos(nodes, pregunta, MAX_NODOS);
      return NextResponse.json({
        respuesta: respuestaRespaldo(hits, lang),
        nodos: hits.map((n) => ({ id: n.id, label: n.label, type: n.type, communityLabel: n.communityLabel })),
        respaldo: true,
      });
    };

    let or: Response;
    try {
      or = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: AbortSignal.timeout(TIMEOUT_MODELO_MS),
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
    } catch (e) {
      console.error('[buscar] OpenRouter no respondió a tiempo o falló:', e instanceof Error ? e.message : e);
      return respaldo();
    }
    if (!or.ok) {
      const detail = await or.text().catch(() => '');
      console.error('[buscar] OpenRouter', or.status, detail.slice(0, 300));
      return respaldo();
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
      console.error('[buscar] respuesta ilegible del modelo:', raw.slice(0, 200));
      return respaldo();
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
