import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// Cron CONSOLIDADO (modo slow-season). Dispara todos los agentes de descubrimiento
// en una sola invocación para caber en el límite de ~2 cron jobs del plan Hobby de Vercel.
// Se ejecutan EN PARALELO: cada sub-endpoint corre en su propia función serverless
// (con su propio maxDuration), así el tiempo total ≈ el agente más lento, no la suma.
export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  const host = request.headers.get('host');
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (host ? `https://${host}` : 'https://www.observatorio-ia-mexico.com');
  const secret = process.env.CRON_SECRET;

  // Orden solo cosmético; corren en paralelo. Primero los que descubren contenido nuevo.
  const agentes = ['deteccion', 'legislacion', 'casos', 'monitoreo'];

  const settled = await Promise.allSettled(
    agentes.map((a) =>
      fetch(`${base}/api/cron/${a}`, {
        headers: { Authorization: `Bearer ${secret}` },
      }).then(async (r) => {
        const body = await r.json().catch(() => null) as {
          success?: boolean;
          partial?: boolean;
        } | null;

        // Un subagente puede responder HTTP 200 con success:false. Esa era la
        // causa de que Vercel marcara verde una corrida que no revisó nada.
        return {
          agente: a,
          ok: r.ok && body?.success !== false,
          partial: body?.partial === true,
          status: r.status,
        };
      })
    )
  );

  const resultados = settled.map((s, i) =>
    s.status === 'fulfilled'
      ? s.value
      : { agente: agentes[i], error: s.reason instanceof Error ? s.reason.message : String(s.reason) }
  );
  const ok = resultados.every((resultado) => 'ok' in resultado && resultado.ok === true);

  console.log('[CRON todo] corrida consolidada:', JSON.stringify(resultados));

  return NextResponse.json(
    {
      ok,
      corridaConsolidada: true,
      agentes,
      resultados,
    },
    { status: ok ? 200 : 502 },
  );
}
