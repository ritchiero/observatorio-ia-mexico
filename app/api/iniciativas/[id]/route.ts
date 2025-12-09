import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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

    const data = doc.data();
    
    // Convertir Timestamps a strings
    const iniciativa = {
      id: doc.id,
      ...data,
      fecha: data?.fecha?.toDate?.()?.toISOString() || data?.fecha,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt,
      pdfBackedUpAt: data?.pdfBackedUpAt?.toDate?.()?.toISOString() || data?.pdfBackedUpAt,
      eventos: data?.eventos?.map((evento: any) => ({
        ...evento,
        fecha: evento?.fecha?.toDate?.()?.toISOString() || evento?.fecha,
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
