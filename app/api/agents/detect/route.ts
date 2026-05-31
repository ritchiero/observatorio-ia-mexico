import { NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';

// POST /api/agents/detect - Ejecutar agente de detección manualmente.
// ?dryRun=1 → calcula y devuelve decisiones (dedup/folio/verificación) SIN escribir.
export async function POST(request: Request) {
  try {
    const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';
    const resultado = await ejecutarAgenteDeteccion('manual', { dryRun });
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al ejecutar agente de detección:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar agente de detección' },
      { status: 500 }
    );
  }
}
