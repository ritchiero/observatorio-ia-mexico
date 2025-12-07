import { NextResponse } from 'next/server';
import { ejecutarAgentePropuestas } from '@/lib/agents-ia-pi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const resultados = await ejecutarAgentePropuestas();
    
    return NextResponse.json({
      success: true,
      agente: 'propuestas_legislativas',
      ...resultados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en agente de propuestas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
