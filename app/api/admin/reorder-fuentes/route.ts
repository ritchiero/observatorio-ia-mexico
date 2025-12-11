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

// POST - Reordenar fuentes de un anuncio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncioId, fromIndex, toIndex } = body;

    if (!anuncioId || fromIndex === undefined || toIndex === undefined) {
      return NextResponse.json(
        { error: 'anuncioId, fromIndex y toIndex son requeridos' },
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
    const fuentes: Fuente[] = [...(data?.fuentes || [])];
    
    if (fromIndex < 0 || fromIndex >= fuentes.length || toIndex < 0 || toIndex >= fuentes.length) {
      return NextResponse.json({ error: 'Índices de fuente inválidos' }, { status: 400 });
    }

    // Reordenar: remover del índice original e insertar en el nuevo
    const [movedFuente] = fuentes.splice(fromIndex, 1);
    fuentes.splice(toIndex, 0, movedFuente);

    await anuncioRef.update({
      fuentes,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Fuentes reordenadas correctamente'
    });

  } catch (error) {
    console.error('Error reordenando fuentes:', error);
    return NextResponse.json({
      error: 'Error al reordenar fuentes',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
