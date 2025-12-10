import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { crearEventoInicial } from '@/lib/timeline';

export const maxDuration = 300; // 5 minutos

export async function POST(request: Request) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // Verificar autenticación
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    let procesados = 0;
    let creados = 0;
    const errores: string[] = [];

    // Obtener todos los anuncios
    const anunciosSnapshot = await db.collection('anuncios').get();

    for (const doc of anunciosSnapshot.docs) {
      const anuncio = doc.data();
      procesados++;

      try {
        // Verificar si ya tiene eventos de timeline
        const eventosSnapshot = await db
          .collection('eventos_timeline')
          .where('anuncioId', '==', doc.id)
          .where('tipo', '==', 'anuncio_inicial')
          .limit(1)
          .get();

        if (!eventosSnapshot.empty) {
          continue; // Ya tiene evento inicial
        }

        // Crear evento inicial
        const fechaAnuncio = anuncio.fechaAnuncio.toDate();
        
        await crearEventoInicial({
          anuncioId: doc.id,
          titulo: anuncio.titulo,
          fechaAnuncio,
          responsable: anuncio.responsable,
          citaPromesa: anuncio.citaPromesa || '',
          fuenteOriginal: anuncio.fuenteOriginal || '',
          fuentesAdicionales: [],
        });

        creados++;

      } catch (error) {
        errores.push(`Error en "${anuncio.titulo}": ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Timeline poblado. ${creados} evento(s) creado(s) de ${procesados} anuncio(s).`,
      procesados,
      creados,
      errores,
    });

  } catch (error) {
    console.error('Error al poblar timeline:', error);
    return NextResponse.json(
      { 
        error: 'Error al poblar timeline',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
