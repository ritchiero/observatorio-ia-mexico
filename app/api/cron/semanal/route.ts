import { NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Umbrella cron: runs deteccion, then calls legislacion and casos endpoints internally
export async function GET(request: Request) {
    const authError = requireCron(request);
    if (authError) return authError;
    const cronBearer = `Bearer ${process.env.CRON_SECRET}`;

    try {
      const resultados: Record<string, unknown> = {};
          const erroresGlobales: string[] = [];

      // 1. Deteccion de anuncios
      console.log('[CRON-SEMANAL] Ejecutando deteccion...');
          try {
                  const deteccion = await ejecutarAgenteDeteccion('cron');
                  resultados.deteccion = deteccion;
          } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error);
                  erroresGlobales.push(`Deteccion fallo: ${msg}`);
                  resultados.deteccion = { success: false, error: msg };
          }

      // 2. Legislacion - call internal endpoint
      console.log('[CRON-SEMANAL] Ejecutando legislacion...');
          try {
                  const baseUrl = process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                            : 'http://localhost:3000';
                  const legRes = await fetch(`${baseUrl}/api/cron/legislacion`, {
                            headers: { Authorization: cronBearer },
                  });
                  const legData = await legRes.json();
                  resultados.legislacion = legData;
          } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error);
                  erroresGlobales.push(`Legislacion fallo: ${msg}`);
                  resultados.legislacion = { success: false, error: msg };
          }

      // 3. Casos judiciales - call internal endpoint
      console.log('[CRON-SEMANAL] Ejecutando casos...');
          try {
                  const baseUrl = process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                            : 'http://localhost:3000';
                  const casosRes = await fetch(`${baseUrl}/api/cron/casos`, {
                            headers: { Authorization: cronBearer },
                  });
                  const casosData = await casosRes.json();
                  resultados.casos = casosData;
          } catch (error) {
                  const msg = error instanceof Error ? error.message : String(error);
                  erroresGlobales.push(`Casos fallo: ${msg}`);
                  resultados.casos = { success: false, error: msg };
          }

      console.log('[CRON-SEMANAL] Completado:', JSON.stringify(resultados, null, 2));

      return NextResponse.json({
              mensaje: 'Cron semanal completado (deteccion + legislacion + casos)',
              resultados,
              erroresGlobales,
      });
    } catch (error) {
          console.error('[CRON-SEMANAL] Error general:', error);
          return NextResponse.json(
            {
                      error: 'Error en cron semanal',
                      detalle: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
                );
    }
}
