import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();
    
    // Verificar admin key
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    
    // Obtener el timeline actual
    const timelineSnapshot = await db
      .collection('anuncios')
      .doc(anuncioId)
      .collection('timeline')
      .orderBy('fecha', 'asc')
      .limit(1)
      .get();
    
    if (timelineSnapshot.empty) {
      return NextResponse.json({ error: 'No se encontró el evento en el timeline' }, { status: 404 });
    }
    
    const timelineDoc = timelineSnapshot.docs[0];
    
    // Nuevas fuentes verificables
    const nuevasFuentes = [
      {
        url: 'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
        titulo: 'Sheinbaum anuncia laboratorio nacional de Inteligencia Artificial',
        medio: 'Infobae',
        fecha: '15 de abril de 2025'
      },
      {
        url: 'https://www.infobae.com/mexico/2025/09/05/sheinbaum-revela-que-proyecto-de-laboratorio-nacional-de-inteligencia-artificial-sera-lanzado-en-octubre/',
        titulo: 'Sheinbaum revela que proyecto de Laboratorio Nacional de IA será lanzado en octubre',
        medio: 'Infobae',
        fecha: '5 de septiembre de 2025'
      },
      {
        url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-centro-publico-de-formacion-en-inteligencia-artificial',
        titulo: 'Versión estenográfica. Centro Público de Formación en Inteligencia Artificial',
        medio: 'Presidencia de México',
        fecha: 'Noviembre 2025'
      }
    ];
    
    // Actualizar el documento del timeline con las nuevas fuentes
    await timelineDoc.ref.update({
      fuentes: nuevasFuentes
    });
    
    return NextResponse.json({
      success: true,
      message: 'Fuentes actualizadas exitosamente',
      totalFuentes: nuevasFuentes.length
    });
    
  } catch (error: any) {
    console.error('Error actualizando fuentes:', error);
    return NextResponse.json(
      { error: 'Error actualizando fuentes', details: error.message },
      { status: 500 }
    );
  }
}
