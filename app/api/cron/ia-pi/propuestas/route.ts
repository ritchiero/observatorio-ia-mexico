import { NextResponse } from 'next/server';
import { ejecutarAgentePropuestas } from '@/lib/agents-ia-pi';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    console.log('🤖 Ejecutando cron job: Agente de Propuestas Legislativas');
    
    const resultados = await ejecutarAgentePropuestas();
    
    return NextResponse.json({
      agente: 'propuestas_legislativas',
      schedule: 'Día 10 de cada mes a las 9:00 AM',
      ...resultados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en cron job de propuestas:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
