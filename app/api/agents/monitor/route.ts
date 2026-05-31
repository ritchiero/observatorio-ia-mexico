import { NextResponse } from 'next/server';
import { ejecutarAgenteMonitoreo } from '@/lib/agents';
import { requireAdmin } from '@/lib/auth';

// POST /api/agents/monitor - Ejecutar agente de monitoreo manualmente (solo admin)
export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const resultado = await ejecutarAgenteMonitoreo('manual');
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al ejecutar agente de monitoreo:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar agente de monitoreo' },
      { status: 500 }
    );
  }
}
