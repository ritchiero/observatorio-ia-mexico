import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// GET /api/actividad - Obtener actividad reciente
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('actividad')
      .orderBy('fecha', 'desc')
      .limit(50)
      .get();

    const actividad = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate().toISOString(),
      };
    });

    return NextResponse.json({ actividad });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividad' },
      { status: 500 }
    );
  }
}
