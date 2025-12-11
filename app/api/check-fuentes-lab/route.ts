import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    
    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    const anuncioDoc = await anuncioRef.get();
    
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio not found' }, { status: 404 });
    }

    const data = anuncioDoc.data();
    
    return NextResponse.json({ 
      titulo: data?.titulo,
      totalFuentes: data?.fuentes?.length || 0,
      fuentes: data?.fuentes?.map((f: any) => ({
        titulo: f.titulo,
        medio: f.medio,
        url: f.url,
        tipo: f.tipo
      })) || [],
      fuenteOriginal: data?.fuenteOriginal || null
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
