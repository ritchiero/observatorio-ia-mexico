import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT - Actualizar un anuncio
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(id);
    
    const anuncioDoc = await anuncioRef.get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Preparar datos para actualizar
    const dataToUpdate: Record<string, unknown> = {
      updatedAt: Timestamp.now()
    };

    // Campos de texto
    if (updateData.titulo !== undefined) dataToUpdate.titulo = updateData.titulo;
    if (updateData.descripcion !== undefined) dataToUpdate.descripcion = updateData.descripcion;
    if (updateData.responsable !== undefined) dataToUpdate.responsable = updateData.responsable;
    if (updateData.dependencia !== undefined) dataToUpdate.dependencia = updateData.dependencia;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.citaPromesa !== undefined) dataToUpdate.citaPromesa = updateData.citaPromesa;
    if (updateData.resumenAgente !== undefined) dataToUpdate.resumenAgente = updateData.resumenAgente;
    if (updateData.fuenteOriginal !== undefined) dataToUpdate.fuenteOriginal = updateData.fuenteOriginal;

    // Campos de fecha
    if (updateData.fechaAnuncio) {
      dataToUpdate.fechaAnuncio = Timestamp.fromDate(new Date(updateData.fechaAnuncio));
    }
    if (updateData.fechaPrometida) {
      dataToUpdate.fechaPrometida = Timestamp.fromDate(new Date(updateData.fechaPrometida));
    }

    await anuncioRef.update(dataToUpdate);

    return NextResponse.json({
      success: true,
      message: 'Anuncio actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando anuncio:', error);
    return NextResponse.json({
      error: 'Error al actualizar anuncio',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}

// DELETE - Eliminar un anuncio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const db = getAdminDb();
    
    // Eliminar eventos del timeline asociados
    const eventosSnapshot = await db.collection('eventos_timeline')
      .where('anuncioId', '==', id)
      .get();
    
    const deletePromises = eventosSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Eliminar el anuncio
    await db.collection('anuncios').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Anuncio y eventos eliminados correctamente'
    });

  } catch (error) {
    console.error('Error eliminando anuncio:', error);
    return NextResponse.json({
      error: 'Error al eliminar anuncio',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
