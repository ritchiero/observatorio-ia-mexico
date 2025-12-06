import { NextResponse } from 'next/server';
import { ejecutarAgenteDeteccion } from '@/lib/agents';

// POST /api/agents/detect - Ejecutar agente de detección manualmente
export async function POST() {
  try {
    const resultado = await ejecutarAgenteDeteccion('manual');
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al ejecutar agente de detección:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar agente de detección' },
      { status: 500 }
    );
  }
}
