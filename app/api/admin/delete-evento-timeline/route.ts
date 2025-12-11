import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Eliminar un evento del timeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventoId } = body;

    if (!eventoId) {
      return NextResponse.json(
        { error: 'eventoId es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const eventoRef = db.collection('eventos_timeline').doc(eventoId);
    
    const eventoDoc = await eventoRef.get();
    if (!eventoDoc.exists) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const eventoData = eventoDoc.data();
    
    // Eliminar el evento
    await eventoRef.delete();

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'evento_timeline_eliminado',
      anuncioId: eventoData?.anuncioId || '',
      descripcion: `Evento eliminado: ${eventoData?.titulo || eventoId}`
    });

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json({
      error: 'Error al eliminar evento',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
