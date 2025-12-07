import { NextResponse } from 'next/server';
import { ejecutarAgenteMonitoreo } from '@/lib/agents';

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

    console.log('[CRON] Iniciando agente de monitoreo...');
    const resultado = await ejecutarAgenteMonitoreo('cron');

    console.log('[CRON] Agente de monitoreo completado:', resultado);
    
    return NextResponse.json({
      mensaje: `Monitoreo completado. ${resultado.actualizacionesDetectadas} actualización(es) detectada(s).`,
      ...resultado,
    });
  } catch (error) {
    console.error('[CRON] Error en agente de monitoreo:', error);
    return NextResponse.json(
      { 
        error: 'Error al ejecutar agente de monitoreo',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
