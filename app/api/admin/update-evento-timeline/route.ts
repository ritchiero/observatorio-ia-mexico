import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Actualizar un evento del timeline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventoId, evento } = body;

    if (!eventoId || !evento) {
      return NextResponse.json(
        { error: 'eventoId y evento son requeridos' },
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
    
    // Preparar datos para actualizar
    const dataToUpdate: Record<string, unknown> = {
      updatedAt: Timestamp.now()
    };

    if (evento.titulo !== undefined) dataToUpdate.titulo = evento.titulo;
    if (evento.descripcion !== undefined) dataToUpdate.descripcion = evento.descripcion;
    if (evento.tipo !== undefined) dataToUpdate.tipo = evento.tipo;
    if (evento.impacto !== undefined) dataToUpdate.impacto = evento.impacto;
    if (evento.citaTextual !== undefined) dataToUpdate.citaTextual = evento.citaTextual;
    if (evento.responsable !== undefined) dataToUpdate.responsable = evento.responsable;
    
    if (evento.fecha) {
      dataToUpdate.fecha = Timestamp.fromDate(new Date(evento.fecha));
    }
    
    if (evento.fuentes !== undefined) {
      dataToUpdate.fuentes = evento.fuentes.map((f: { url: string; titulo: string; fecha?: string; tipo?: string; medio?: string }) => ({
        url: f.url,
        titulo: f.titulo,
        fecha: f.fecha || new Date().toISOString().split('T')[0],
        tipo: f.tipo || 'nota_prensa',
        medio: f.medio || ''
      }));
    }

    await eventoRef.update(dataToUpdate);

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'evento_timeline_actualizado',
      anuncioId: eventoData?.anuncioId || '',
      descripcion: `Evento actualizado: ${evento.titulo || eventoData?.titulo}`
    });

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json({
      error: 'Error al actualizar evento',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
