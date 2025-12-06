import { NextResponse } from 'next/server';
import { ejecutarAgenteMonitoreo } from '@/lib/agents';

// POST /api/agents/monitor - Ejecutar agente de monitoreo manualmente
export async function POST() {
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
