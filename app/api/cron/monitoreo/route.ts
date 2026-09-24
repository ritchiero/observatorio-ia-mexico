import { NextResponse } from 'next/server';
import { ejecutarAgenteMonitoreo } from '@/lib/agents';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  try {
    console.log('[CRON] Iniciando agente de monitoreo...');
    const resultado = await ejecutarAgenteMonitoreo('cron');

    console.log('[CRON] Agente de monitoreo completado:', resultado);
    
    return NextResponse.json(
      {
        mensaje: resultado.success
          ? `Monitoreo completado. ${resultado.actualizacionesDetectadas} actualización(es) detectada(s).`
          : 'El monitoreo no pudo completar ninguna revisión válida.',
        ...resultado,
      },
      { status: resultado.success ? 200 : 502 },
    );
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
