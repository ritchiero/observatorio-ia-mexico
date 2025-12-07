import { NextResponse } from 'next/server';
import { ejecutarAgenteCasos } from '@/lib/agents-ia-pi';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // Verificar CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    console.log('🤖 Ejecutando cron job: Agente de Casos Judiciales');
    
    const resultados = await ejecutarAgenteCasos();
    
    return NextResponse.json({
      agente: 'casos_judiciales',
      schedule: 'Día 1 de cada mes a las 9:00 AM',
      ...resultados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en cron job de casos:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
