import { NextResponse } from 'next/server';
import { ejecutarAgenteProblematicas } from '@/lib/agents-ia-pi';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const resultados = await ejecutarAgenteProblematicas();
    
    return NextResponse.json({
      success: true,
      agente: 'problematicas_ia',
      ...resultados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en agente de problemáticas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
