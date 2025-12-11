import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Fuente {
  url: string;
  titulo: string;
  fecha: string;
  tipo: string;
  medio?: string;
  accesible?: boolean;
  extracto?: string;
}

// POST - Actualizar una fuente específica de un anuncio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncioId, fuenteIndex, fuente } = body;

    if (!anuncioId || fuenteIndex === undefined || !fuente) {
      return NextResponse.json(
        { error: 'anuncioId, fuenteIndex y fuente son requeridos' },
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
    const fuentes: Fuente[] = data?.fuentes || [];
    
    if (fuenteIndex < 0 || fuenteIndex >= fuentes.length) {
      return NextResponse.json({ error: 'Índice de fuente inválido' }, { status: 400 });
    }

    // Actualizar la fuente en el índice especificado
    fuentes[fuenteIndex] = {
      url: fuente.url,
      titulo: fuente.titulo,
      fecha: fuente.fecha,
      tipo: fuente.tipo || 'nota_prensa',
      medio: fuente.medio || '',
      accesible: fuente.accesible !== false,
      extracto: fuente.extracto || ''
    };

    await anuncioRef.update({
      fuentes,
      updatedAt: Timestamp.now()
    });

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'fuente_actualizada',
      anuncioId,
      anuncioTitulo: data?.titulo || '',
      descripcion: `Fuente actualizada: ${fuente.titulo}`
    });

    return NextResponse.json({
      success: true,
      message: 'Fuente actualizada correctamente'
    });

  } catch (error) {
    console.error('Error actualizando fuente:', error);
    return NextResponse.json({
      error: 'Error al actualizar fuente',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
