import { NextResponse } from 'next/server';
import { obtenerEventosTimeline } from '@/lib/timeline';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventos = await obtenerEventosTimeline(params.id);
    
    return NextResponse.json({
      eventos,
      total: eventos.length,
    });
  } catch (error) {
    console.error('Error al obtener eventos de timeline:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos de timeline' },
      { status: 500 }
    );
  }
}
