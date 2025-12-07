import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();
    
    // Verificar admin key
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    
    // Nuevas fuentes verificables
    const nuevasFuentes = [
      'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
      'https://infochannel.info/sheinbaum_creara_laboratorio_nacional_ia/',
      'https://www.infobae.com/mexico/2025/09/05/sheinbaum-revela-que-proyecto-de-laboratorio-nacional-de-inteligencia-artificial-sera-lanzado-en-octubre/'
    ];
    
    // Actualizar el anuncio con las nuevas fuentes
    await db
      .collection('anuncios')
      .doc(anuncioId)
      .update({
        fuenteOriginal: nuevasFuentes.join(' | '),
        updatedAt: new Date()
      });
    
    return NextResponse.json({ 
      success: true,
      message: 'Fuentes actualizadas correctamente',
      fuentes: nuevasFuentes
    });
    
  } catch (error) {
    console.error('Error al actualizar fuentes:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar fuentes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
