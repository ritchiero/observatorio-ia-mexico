import { NextResponse } from 'next/server';
import { ejecutarAgenteCasos } from '@/lib/agents-ia-pi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Verificar autenticación (opcional: agregar ADMIN_KEY)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const resultados = await ejecutarAgenteCasos();
    
    return NextResponse.json({
      success: true,
      agente: 'casos_judiciales',
      ...resultados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en agente de casos:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
