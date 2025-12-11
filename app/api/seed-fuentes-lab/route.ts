import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Endpoint temporal para agregar fuentes al Laboratorio de IA
// ELIMINAR DESPUÉS DE USAR
export async function GET() {
  try {
    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    
    const nuevasFuentes = [
      {
        url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-15-de-abril-de-2025',
        titulo: 'Versión estenográfica: Conferencia de prensa de la Presidenta Claudia Sheinbaum Pardo',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'anuncio_original',
        medio: 'Gobierno de México',
        accesible: true
      },
      {
        url: 'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
        titulo: 'Sheinbaum anuncia Laboratorio Nacional de Inteligencia Artificial',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'nota_prensa',
        medio: 'Infobae',
        accesible: true
      },
      {
        url: 'https://www.eluniversal.com.mx/nacion/sheinbaum-alista-laboratorio-nacional-de-inteligencia-artificial-gabinete-va-por-incorporacion-de-la-ia/',
        titulo: 'Sheinbaum alista Laboratorio Nacional de Inteligencia Artificial; gabinete va por incorporación de la IA',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'nota_prensa',
        medio: 'El Universal',
        accesible: true
      }
    ];

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    
    const anuncioDoc = await anuncioRef.get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio not found' }, { status: 404 });
    }

    const anuncioData = anuncioDoc.data();
    const fuentesExistentes = anuncioData?.fuentes || [];

    // Filtrar duplicados por URL
    const urlsExistentes = new Set(fuentesExistentes.map((f: { url: string }) => f.url));
    const fuentesSinDuplicar = nuevasFuentes.filter(f => !urlsExistentes.has(f.url));

    // Si todas ya existen, retornar info
    if (fuentesSinDuplicar.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Todas las fuentes ya existían',
        fuentesExistentes: fuentesExistentes.length,
        urls: fuentesExistentes.map((f: { url: string }) => f.url)
      });
    }

    // Combinar y actualizar (nuevas al inicio para que aparezcan primero)
    const todasLasFuentes = [...fuentesSinDuplicar, ...fuentesExistentes];

    await anuncioRef.update({
      fuentes: todasLasFuentes,
      updatedAt: Timestamp.now()
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Se agregaron ${fuentesSinDuplicar.length} fuentes al Laboratorio de IA`,
      agregadas: fuentesSinDuplicar.length,
      total: todasLasFuentes.length,
      fuentes: fuentesSinDuplicar.map(f => f.titulo)
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error al agregar fuentes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
