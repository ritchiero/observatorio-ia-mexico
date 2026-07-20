import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// POST /api/hemeroteca/buscar — buscador inteligente de la hemeroteca.
// Le da a Grok (vía OpenRouter) el catálogo compacto de fichas y la pregunta del
// usuario; devuelve una respuesta breve + los slugs de las fichas relevantes.
// La llave vive en OPENROUTER_API_KEY (env), jamás en el repo. Mismo patrón que /api/grafo/buscar.
const MODEL = 'x-ai/grok-4.5';
const MAX_FICHAS = 10;

interface Rec {
  articuloSlug?: string; articuloMD?: string; titulo?: string; articuloResumen?: string;
  proponente?: string; partido?: string; camara?: string; estatus?: string; status?: string;
  fecha?: string; tematicas?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return NextResponse.json({ error: 'Buscador IA no configurado (falta OPENROUTER_API_KEY)' }, { status: 503 });

    const { q } = await request.json();
    const pregunta = String(q ?? '').trim().slice(0, 300);
    if (pregunta.length < 3) return NextResponse.json({ error: 'Pregunta demasiado corta' }, { status: 400 });

    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.observatorio-ia-mexico.com');
    const d = await fetch(`${base}/api/iniciativas`, { cache: 'no-store' }).then((r) => r.json());
    const recs: Rec[] = (d?.data ?? []).filter((i: Rec) => i.articuloMD && i.articuloSlug);
    if (!recs.length) return NextResponse.json({ error: 'La hemeroteca no tiene fichas' }, { status: 502 });

    const slugsValidos = new Set(recs.map((r) => r.articuloSlug));
    const catalogo = recs
      .map((r) =>
        [
          r.articuloSlug,
          (r.estatus ?? r.status ?? '').replace(/_/g, ' '),
          (r.fecha ?? '').slice(0, 10),
          (r.camara ?? ''),
          (r.proponente ?? '').slice(0, 40),
          (r.titulo ?? '').slice(0, 100),
          (r.articuloResumen ?? '').replace(/\s+/g, ' ').slice(0, 120),
        ].join('|'),
      )
      .join('\n');

    const system = `Eres el buscador de la Hemeroteca del Observatorio IA México: un archivo de iniciativas legislativas y documentos sobre cómo el Estado mexicano usa y regula la inteligencia artificial. Recibes el catálogo completo de fichas (formato: slug|estatus|fecha|camara|proponente|titulo|resumen) y una consulta del usuario en lenguaje natural.
Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra, con esta forma exacta:
{"respuesta":"1 a 3 frases en español que respondan la consulta con base SOLO en el catálogo","slugs":["slug1","slug2"]}
Reglas:
1. PRIORIZA LO VIGENTE: primero lo que está en trámite/aprobado y más reciente; lo desechado o archivado va al final y solo como contexto.
2. Ordena "slugs" igual: primero lo vigente y reciente.
3. Máximo ${MAX_FICHAS} slugs; usa exclusivamente slugs que existan en el catálogo.
4. Si nada es relevante devuelve slugs:[] y dilo con honestidad.
5. Nunca inventes hechos que no estén en el catálogo; cita fechas y proponentes cuando existan.`;

    const or = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Catálogo (${recs.length} fichas):\n${catalogo}\n\nConsulta: ${pregunta}` },
        ],
      }),
    });
    if (!or.ok) return NextResponse.json({ error: `El modelo no respondió (HTTP ${or.status})` }, { status: 502 });

    const j = await or.json();
    let parsed: { respuesta?: string; slugs?: string[] };
    try { parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? '{}'); }
    catch { return NextResponse.json({ error: 'Respuesta ilegible del modelo' }, { status: 502 }); }

    const slugs = (parsed.slugs ?? []).filter((s) => slugsValidos.has(s)).slice(0, MAX_FICHAS);
    return NextResponse.json({ respuesta: String(parsed.respuesta ?? '').slice(0, 500), slugs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error en el buscador' }, { status: 500 });
  }
}
