import { NextResponse } from 'next/server';
import { ejecutarAgenteRecapMensual } from '@/lib/agents';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authError = requireCron(request);
    if (authError) return authError;

    try {
      console.log('[CRON] Iniciando agente de recap mensual...');
          const resultado = await ejecutarAgenteRecapMensual('cron');
          console.log('[CRON] Recap mensual completado:', resultado);

      return NextResponse.json({
              mensaje: resultado.success
                ? `Recap generado: ${resultado.titulo}`
                        : 'Error al generar recap',
              ...resultado,
      });
    } catch (error) {
          console.error('[CRON] Error en recap mensual:', error);
          return NextResponse.json(
            {
                      error: 'Error al ejecutar recap mensual',
                      detalle: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
                );
    }
}
