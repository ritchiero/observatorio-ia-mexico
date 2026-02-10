import { NextResponse } from 'next/server';
import { ejecutarAgenteRecapMensual } from '@/lib/agents';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Monthly cron: runs recap first (fast ~30s), then dispatches monitoreo separately
export async function GET(request: Request) {
      try {
              const authHeader = request.headers.get('authorization');
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
              }

        const resultados: Record<string, unknown> = {};
              const erroresGlobales: string[] = [];

        // 1. Recap mensual FIRST (fast, single Claude call ~30s)
        console.log('[CRON-MENSUAL] Ejecutando recap mensual...');
              try {
                        const recap = await ejecutarAgenteRecapMensual('cron');
                        resultados.recap = recap;
              } catch (error) {
                        const msg = error instanceof Error ? error.message : String(error);
                        erroresGlobales.push(`Recap fallo: ${msg}`);
                        resultados.recap = { success: false, error: msg };
              }

        // 2. Monitoreo - dispatch as separate request (fire and forget)
        console.log('[CRON-MENSUAL] Disparando monitoreo...');
              try {
                        const baseUrl = process.env.VERCEL_URL
                          ? `https://${process.env.VERCEL_URL}`
                                    : 'http://localhost:3000';
                        fetch(`${baseUrl}/api/cron/monitoreo`, {
                                    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
                        }).catch(() => {});
                        resultados.monitoreo = { status: 'dispatched' };
              } catch (error) {
                        const msg = error instanceof Error ? error.message : String(error);
                                  erroresGlobales.push(`Monitoreo dispatch fallo: ${msg}`);
              }

        console.log('[CRON-MENSUAL] Completado');

        return NextResponse.json({
                  mensaje: 'Cron mensual completado (recap done + monitoreo dispatched)',
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
