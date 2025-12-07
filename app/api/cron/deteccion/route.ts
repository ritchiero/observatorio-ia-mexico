import { NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verificar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Iniciando agente de detección...');
    const resultado = await ejecutarAgenteDeteccion('cron');

    console.log('[CRON] Agente de detección completado:', resultado);
    
    return NextResponse.json({
      mensaje: `Detección completada. ${resultado.anunciosEncontrados} nuevo(s) anuncio(s) encontrado(s).`,
      ...resultado,
    });
  } catch (error) {
    console.error('[CRON] Error en agente de detección:', error);
    return NextResponse.json(
      { 
        error: 'Error al ejecutar agente de detección',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
