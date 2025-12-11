import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    const db = getAdminDb();
    
    // Verificar estado actual
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    const anuncioDoc = await anuncioRef.get();
    
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }
    
    const antes = anuncioDoc.data();
    
    // Forzar actualización del status
    await anuncioRef.update({
      status: 'en_desarrollo',
      updatedAt: Timestamp.now()
    });
    
    // Verificar después
    const despuesDoc = await anuncioRef.get();
    const despues = despuesDoc.data();
    
    return NextResponse.json({
      success: true,
      antes: {
        status: antes?.status,
        titulo: antes?.titulo
      },
      despues: {
        status: despues?.status,
        titulo: despues?.titulo
      },
      mensaje: 'Status actualizado a en_desarrollo'
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
