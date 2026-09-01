import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireCron } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { evaluarCorrida, type RespuestaAgente } from '@/lib/cron-resultado';

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

  const host = request.headers.get('host');
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `https://${host}` : 'https://www.observatorio-ia-mexico.com');
  const secret = process.env.CRON_SECRET;

  const respuestas: RespuestaAgente[] = await Promise.all(
    AGENTES.map(async (agente): Promise<RespuestaAgente> => {
      try {
        const r = await fetch(`${base}/api/cron/${agente}`, {
          headers: { Authorization: `Bearer ${secret}` },
        });
        // Se LEE el cuerpo: es donde vive `success`, `errores` y el conteo real.
        let cuerpo: unknown = null;
        try {
          cuerpo = await r.json();
        } catch {
          cuerpo = null;
        }
        return { agente, alcanzado: true, httpOk: r.ok, status: r.status, cuerpo };
      } catch (error) {
        return {
          agente,
          alcanzado: false,
          errorRed: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );

  const evaluacion = evaluarCorrida(respuestas);
  console.log('[CRON todo]', evaluacion.ok ? 'OK' : 'CON FALLOS', evaluacion.resumen);

  // Evidencia PÚBLICA por agente: la bitácora debe poder distinguir una corrida
  // sana sin novedad de una corrida que no pudo revisar (ver PR #92).
  try {
    const db = getAdminDb();
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: evaluacion.ok ? 'agente_ejecutado' : 'agente_fallo',
      descripcion: evaluacion.ok
        ? `Corrida consolidada de agentes. ${evaluacion.resumen}.`
        : `Corrida consolidada con fallos en: ${evaluacion.fallidos.join(', ')}. ${evaluacion.resumen}.`,
    });
  } catch (error) {
    // Si ni siquiera se puede registrar, se dice en la respuesta; no se silencia.
    console.error('[CRON todo] no se pudo registrar la evidencia pública:', error);
  }

  return NextResponse.json(
    {
      ok: evaluacion.ok,
      corridaConsolidada: true,
      agentes: evaluacion.agentes,
      fallidos: evaluacion.fallidos,
      hallazgosTotales: evaluacion.hallazgosTotales,
      resumen: evaluacion.resumen,
    },
    { status: evaluacion.ok ? 200 : 500 },
  );
}
