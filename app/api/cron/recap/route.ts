import { NextResponse } from 'next/server';
import { ejecutarAgenteRecapMensual } from '@/lib/agents';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
          const authHeader = request.headers.get('authorization');
          if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

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
