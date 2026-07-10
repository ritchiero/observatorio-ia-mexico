import { NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  try {
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
