import { NextResponse } from 'next/server';
import { obtenerCasosJudiciales } from '@/lib/firestore-ia-pi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const casos = await obtenerCasosJudiciales();
    
    // Serializar Timestamps de Firestore a strings ISO
    const casosSerializados = casos.map(caso => ({
      ...caso,
      fecha: caso.fecha?.toDate ? caso.fecha.toDate().toISOString() : caso.fecha,
      createdAt: caso.createdAt?.toDate ? caso.createdAt.toDate().toISOString() : caso.createdAt,
      updatedAt: caso.updatedAt?.toDate ? caso.updatedAt.toDate().toISOString() : caso.updatedAt
    }));
    
    return NextResponse.json(casosSerializados);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    return NextResponse.json({ error: 'Error al obtener casos' }, { status: 500 });
  }
}
