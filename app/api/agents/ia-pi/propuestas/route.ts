import { NextResponse } from 'next/server';
import { ejecutarAgentePropuestas } from '@/lib/agents-ia-pi';
import { requireServiceToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authError = requireServiceToken(request, process.env.ADMIN_KEY);
  if (authError) return authError;

  try {
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
