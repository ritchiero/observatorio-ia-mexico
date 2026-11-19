import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth';
import { ejecutarAgenteHemeroteca } from '@/lib/agente-hemeroteca';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// Escribe los artículos de la hemeroteca que faltan (lo dispara /api/cron/todo).
export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  const resultado = await ejecutarAgenteHemeroteca('cron');
  return NextResponse.json(resultado, { status: resultado.success ? 200 : 500 });
}
