import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/export?coleccion=anuncios|iniciativas|casos — datos abiertos en CSV (OIA-013).
// El público del observatorio (periodistas, investigadores, ONGs) necesita citar y
// reutilizar los datos sin scrapear; este endpoint sirve el catálogo público tal cual.
type Spec = { api: string; keys: string[]; campos: string[] };
const COLECCIONES: Record<string, Spec> = {
  anuncios: {
    api: '/api/anuncios?limit=500',
    keys: ['data', 'anuncios'],
    campos: ['id', 'titulo', 'status', 'dependencia', 'responsable', 'fechaAnuncio', 'fechaPrometida', 'fuenteOriginal'],
  },
  iniciativas: {
    api: '/api/iniciativas',
    keys: ['data', 'iniciativas'],
    campos: ['id', 'numero', 'titulo', 'estatus', 'status', 'camara', 'proponente', 'partido', 'fecha', 'urlGaceta', 'urlPDFBackup'],
  },
  casos: {
    api: '/api/casos-ia',
    keys: ['casos', 'data'],
    campos: ['id', 'folio', 'nombre', 'estado', 'temaIA', 'materia', 'tribunalActual', 'fechaCreacion'],
  },
};

const celda = (v: unknown): string => {
  const s = v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(request: NextRequest) {
  const nombre = request.nextUrl.searchParams.get('coleccion') ?? '';
  const spec = COLECCIONES[nombre];
  if (!spec) {
    return NextResponse.json(
      { error: 'coleccion inválida', validas: Object.keys(COLECCIONES) },
      { status: 400 },
    );
  }
  try {
    const r = await fetch(`${request.nextUrl.origin}${spec.api}`, { cache: 'no-store' });
    const j = (await r.json()) as Record<string, unknown>;
    let arr: Record<string, unknown>[] = [];
    for (const k of spec.keys) {
      if (Array.isArray(j[k])) { arr = j[k] as Record<string, unknown>[]; break; }
    }
    if (!arr.length && Array.isArray(j)) arr = j as unknown as Record<string, unknown>[];
    const filas = [
      spec.campos.join(','),
      ...arr.map((row) => spec.campos.map((c) => celda(row[c])).join(',')),
    ];
    // BOM para que Excel abra el UTF-8 con acentos correctos
    const csv = '﻿' + filas.join('\n');
    const hoy = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="observatorio-ia-mexico-${nombre}-${hoy}.csv"`,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    console.error('[export] error:', e);
    return NextResponse.json({ error: 'No se pudo generar el CSV' }, { status: 500 });
  }
}
