import { NextResponse } from 'next/server';
import { ejecutarAgenteMonitoreo, ejecutarAgenteRecapMensual } from '@/lib/agents';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Umbrella cron: runs monitoreo + recap mensual sequentially
export async function GET(request: Request) {
    try {
          const authHeader = request.headers.get('authorization');
          if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

      const resultados: Record<string, unknown> = {};
          const erroresGlobales: string[] = [];

      // 1. Monitoreo de anuncios existentes
      console.log('[CRON-MENSUAL] Ejecutando monitoreo...');
          try {
                  const monitoreo = await ejecutarAgenteMonitoreo('cron');
                  resultados.monitoreo = monitoreo;
          } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error);
                  erroresGlobales.push(`Monitoreo fallo: ${msg}`);
                  resultados.monitoreo = { success: false, error: msg };
          }

      // 2. Recap mensual
      console.log('[CRON-MENSUAL] Ejecutando recap mensual...');
          try {
                  const recap = await ejecutarAgenteRecapMensual('cron');
                  resultados.recap = recap;
          } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error);
                  erroresGlobales.push(`Recap fallo: ${msg}`);
                  resultados.recap = { success: false, error: msg };
          }

      console.log('[CRON-MENSUAL] Completado:', JSON.stringify(resultados, null, 2));

      return NextResponse.json({
              mensaje: 'Cron mensual completado (monitoreo + recap)',
              resultados,
              erroresGlobales,
      });
    } catch (error) {
          console.error('[CRON-MENSUAL] Error general:', error);
          return NextResponse.json(
            {
                      error: 'Error en cron mensual',
                      detalle: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
                );
    }
}
