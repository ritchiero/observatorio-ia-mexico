import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireCron } from '@/lib/auth';
import {
  getCurrentDeploymentOrigin,
  runConsolidatedAgents,
} from '@/lib/agents/run-consolidated-cron';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// Cron CONSOLIDADO (modo slow-season). Dispara todos los agentes de descubrimiento
// en una sola invocación para caber en el límite de ~2 cron jobs del plan Hobby de
// Vercel. Se ejecutan EN PARALELO: cada sub-endpoint corre en su propia función
// serverless, así el tiempo total ≈ el agente más lento, no la suma.
//
// CONTRATO (corregido 1-sep-2026): el veredicto sale del CUERPO de cada respuesta,
// no del HTTP. Los agentes no lanzan cuando fallan — devuelven `success:false` con
// HTTP 200 —, así que la versión anterior, que sólo miraba `r.ok` y devolvía
// `ok:true` incondicionalmente, reportó verde durante 20 corridas muertas.
const AGENTES = ['deteccion', 'legislacion', 'casos', 'monitoreo'] as const;

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  // Mantener todas las subejecuciones en el mismo deployment que recibió la
  // llamada. Esto permite probar un preview sin terminar ejecutando el código
  // de producción por culpa de NEXT_PUBLIC_SITE_URL.
  const base = getCurrentDeploymentOrigin(request.url);
  const secret = process.env.CRON_SECRET;

  // requireCron ya falla cerrado si el secreto no existe.
  const result = await runConsolidatedAgents(base, secret!);

  // SIEMPRE registrar evidencia de la corrida consolidada, incluso si alguna sub-ruta falló
  try {
    const db = await import('@/lib/firebase-admin').then(m => m.getAdminDb());
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: result.ok ? 'agente_ejecutado' : 'agente_parcial',
      descripcion: result.ok
        ? `Corrida consolidada ejecutada exitosamente. Agentes: ${result.agentes.join(', ')}.`
        : `Corrida consolidada completada con fallos. Resultados: ${result.resultados.map(r => `${r.agente}=${r.ok ? 'OK' : r.error || 'FAIL'}`).join(', ')}.`,
    });
  } catch (activityError) {
    console.error('[CRON todo] No se pudo registrar la corrida consolidada en actividad:', activityError);
  }

  return NextResponse.json(
    result,
    { status: result.ok ? 200 : 502 },
  );
}
