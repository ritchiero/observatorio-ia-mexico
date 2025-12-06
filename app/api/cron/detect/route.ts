import { NextRequest, NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';

// GET /api/cron/detect - Endpoint para Vercel Cron (detección)
export async function GET(request: NextRequest) {
  // Verificar que la petición viene de Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    const resultado = await ejecutarAgenteDeteccion('cron');
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error en cron de detección:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar agente de detección' },
      { status: 500 }
    );
  }
}
