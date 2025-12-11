import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Eliminar una fuente de un anuncio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncioId, fuenteUrl } = body;

    if (!anuncioId || !fuenteUrl) {
      return NextResponse.json(
        { error: 'anuncioId y fuenteUrl son requeridos' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    
    const anuncioDoc = await anuncioRef.get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    const data = anuncioDoc.data();
    const fuentes = data?.fuentes || [];
    
    // Filtrar la fuente a eliminar
    const fuentesActualizadas = fuentes.filter(
      (f: { url: string }) => f.url !== fuenteUrl
    );

    if (fuentes.length === fuentesActualizadas.length) {
      return NextResponse.json({ error: 'Fuente no encontrada' }, { status: 404 });
    }

    await anuncioRef.update({
      fuentes: fuentesActualizadas,
      updatedAt: Timestamp.now()
    });

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'fuente_eliminada',
      anuncioId,
      anuncioTitulo: data?.titulo || '',
      descripcion: `Fuente eliminada: ${fuenteUrl}`
    });

    return NextResponse.json({
      success: true,
      message: 'Fuente eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando fuente:', error);
    return NextResponse.json({
      error: 'Error al eliminar fuente',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
