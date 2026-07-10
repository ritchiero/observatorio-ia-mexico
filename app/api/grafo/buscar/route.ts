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
  estado?: string; desc?: string; community?: string; communityLabel?: string;
};

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
