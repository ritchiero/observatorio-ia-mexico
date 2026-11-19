import { NextResponse } from 'next/server';
import { ejecutarAgenteRecapMensual } from '@/lib/agents';
import { requireCron } from '@/lib/auth';

// El recap hace búsqueda web con Claude y tarda más de un minuto. Con el
// maxDuration anterior (60 s) Vercel mataba la función antes de escribir nada,
// así que desde junio de 2026 ningún recap se generó solo.
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Cron mensual: genera el recap del mes anterior. El monitoreo ya corre cada
// 3 días dentro de /api/cron/todo, así que aquí no se vuelve a disparar.
export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  try {
    console.log('[CRON-MENSUAL] Ejecutando recap mensual...');
    const recap = await ejecutarAgenteRecapMensual('cron');
    console.log('[CRON-MENSUAL] Completado:', recap.mensaje ?? recap.success);

    return NextResponse.json(
      { mensaje: 'Cron mensual completado', resultados: { recap } },
      { status: recap.success ? 200 : 502 },
    );
  } catch (error) {
    console.error('[CRON-MENSUAL] Error general:', error);
    return NextResponse.json(
      {
        error: 'Error en cron mensual',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
