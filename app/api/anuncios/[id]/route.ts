import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET /api/anuncios/[id] - Obtener un anuncio específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const doc = await db.collection('anuncios').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    const anuncio = {
      id: doc.id,
      ...data,
      fechaAnuncio: data.fechaAnuncio?.toDate().toISOString(),
      fechaPrometida: data.fechaPrometida?.toDate().toISOString() || null,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
      actualizaciones: data.actualizaciones?.map((act: { fecha?: { toDate: () => Date }; [key: string]: unknown }) => ({
        ...act,
        fecha: act.fecha?.toDate().toISOString(),
      })) || [],
    };

    return NextResponse.json({ anuncio });
  } catch (error) {
    console.error('Error al obtener anuncio:', error);
    return NextResponse.json(
      { error: 'Error al obtener anuncio' },
      { status: 500 }
    );
  }
}

// PUT /api/anuncios/[id] - Actualizar un anuncio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getAdminDb();

    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    // Actualizar solo los campos proporcionados
    if (body.titulo) updateData.titulo = body.titulo;
    if (body.descripcion) updateData.descripcion = body.descripcion;
    if (body.fechaAnuncio) updateData.fechaAnuncio = Timestamp.fromDate(new Date(body.fechaAnuncio));
    if (body.fechaPrometida !== undefined) {
      updateData.fechaPrometida = body.fechaPrometida 
        ? Timestamp.fromDate(new Date(body.fechaPrometida))
        : null;
    }
    if (body.responsable) updateData.responsable = body.responsable;
    if (body.dependencia) updateData.dependencia = body.dependencia;
    if (body.fuenteOriginal !== undefined) updateData.fuenteOriginal = body.fuenteOriginal;
    if (body.citaPromesa !== undefined) updateData.citaPromesa = body.citaPromesa;
    if (body.status) updateData.status = body.status;

    await db.collection('anuncios').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    return NextResponse.json(
      { error: 'Error al actualizar anuncio' },
      { status: 500 }
    );
  }
}

// DELETE /api/anuncios/[id] - Eliminar un anuncio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();

    await db.collection('anuncios').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar anuncio:', error);
    return NextResponse.json(
      { error: 'Error al eliminar anuncio' },
      { status: 500 }
    );
  }
}
