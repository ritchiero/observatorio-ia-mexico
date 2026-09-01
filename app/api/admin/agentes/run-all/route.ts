import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  getCurrentDeploymentOrigin,
  runConsolidatedAgents,
} from '@/lib/agents/run-consolidated-cron';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * Ejecuta el cron consolidado desde una sesión administrativa. El secreto se
 * usa únicamente entre funciones del servidor y nunca se entrega al cliente.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'El cron no está configurado en este entorno.' },
      { status: 503 },
    );
  }

  try {
    const base = getCurrentDeploymentOrigin(request.url);
    const result = await runConsolidatedAgents(base, secret);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error('[admin/agentes/run-all] No se pudo ejecutar el cron:', error);
    return NextResponse.json(
      { ok: false, error: 'No se pudo iniciar la ejecución completa.' },
      { status: 502 },
    );
  }
}
