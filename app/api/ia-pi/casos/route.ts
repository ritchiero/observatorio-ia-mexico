import { NextResponse } from 'next/server';
import { obtenerCasosJudiciales } from '@/lib/firestore-ia-pi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const casos = await obtenerCasosJudiciales();
    return NextResponse.json(casos);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    return NextResponse.json({ error: 'Error al obtener casos' }, { status: 500 });
  }
}
