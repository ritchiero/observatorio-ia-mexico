import { NextRequest, NextResponse } from 'next/server';

// Sirve los overlays de traducción EN a los client components de /en/*.
// Los JSON viven versionados en data/i18n/en/ (generados por el backfill IA);
// importarlos aquí los empaqueta en el bundle del server — sin fs en runtime.
import anuncios from '@/data/i18n/en/anuncios.json';
import iniciativas from '@/data/i18n/en/iniciativas.json';
import hemeroteca from '@/data/i18n/en/hemeroteca.json';
import casos from '@/data/i18n/en/casos.json';
import eventos from '@/data/i18n/en/eventos.json';
import recaps from '@/data/i18n/en/recaps.json';
import eventosIniciativa from '@/data/i18n/en/eventos-iniciativa.json';
import casosExt from '@/data/i18n/en/casos-ext.json';

const COLECCIONES: Record<string, unknown> = {
  anuncios, iniciativas, hemeroteca, casos, eventos, recaps,
  'eventos-iniciativa': eventosIniciativa,
  'casos-ext': casosExt,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ coleccion: string }> },
) {
  const { coleccion } = await params;
  const data = COLECCIONES[coleccion];
  if (!data) {
    return NextResponse.json(
      { error: 'coleccion inválida', validas: Object.keys(COLECCIONES) },
      { status: 400 },
    );
  }
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  });
}
