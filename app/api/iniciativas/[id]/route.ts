import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sanitizePublicRecord } from '@/lib/public-record-sanitizer';

// Asegura que se ejecute en runtime de Node (necesario para Admin SDK)
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    const db = await getAdminDb();
    const doc = await db.collection('iniciativas').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Iniciativa no encontrada' },
        { status: 404 }
      );
    }

    const data = doc.data() || {};
    const publicData = sanitizePublicRecord(data);
    // Convertir Timestamps a strings
    const iniciativa = {
      id: doc.id,
      ...publicData,
      fecha: data?.fecha?.toDate?.()?.toISOString() || data?.fecha,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt,
      eventos: data?.eventos?.map((evento: Record<string, unknown>) => ({
        ...evento,
        fecha:
          evento.fecha &&
          typeof evento.fecha === 'object' &&
          'toDate' in evento.fecha &&
          typeof evento.fecha.toDate === 'function'
            ? evento.fecha.toDate().toISOString()
            : evento.fecha,
      })) || [],
    };

    return NextResponse.json({ iniciativa }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener iniciativa:', error);
    return NextResponse.json(
      { error: 'Error al obtener iniciativa' },
      { status: 500 }
    );
  }
}
