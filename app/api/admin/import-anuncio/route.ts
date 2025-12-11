import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Importar o actualizar un anuncio (upsert)
export async function POST(request: NextRequest) {
  try {
    const anuncio = await request.json();

    if (!anuncio.titulo || !anuncio.descripcion) {
      return NextResponse.json(
        { error: 'titulo y descripcion son requeridos' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Si tiene ID, actualizar; si no, crear nuevo
    let anuncioRef;
    let isUpdate = false;
    
    if (anuncio.id) {
      anuncioRef = db.collection('anuncios').doc(anuncio.id);
      const existing = await anuncioRef.get();
      isUpdate = existing.exists;
    } else {
      anuncioRef = db.collection('anuncios').doc();
    }

    const dataToSave = {
      id: anuncioRef.id,
      titulo: anuncio.titulo,
      descripcion: anuncio.descripcion,
      responsable: anuncio.responsable || '',
      dependencia: anuncio.dependencia || '',
      status: anuncio.status || 'prometido',
      citaPromesa: anuncio.citaPromesa || '',
      fuenteOriginal: anuncio.fuenteOriginal || '',
      resumenAgente: anuncio.resumenAgente || '',
      fuentes: anuncio.fuentes || [],
      fechaAnuncio: anuncio.fechaAnuncio 
        ? Timestamp.fromDate(new Date(anuncio.fechaAnuncio)) 
        : Timestamp.now(),
      fechaPrometida: anuncio.fechaPrometida 
        ? Timestamp.fromDate(new Date(anuncio.fechaPrometida)) 
        : null,
      updatedAt: Timestamp.now(),
      ...(isUpdate ? {} : { 
        createdAt: Timestamp.now(),
        importado: true 
      })
    };

    if (isUpdate) {
      await anuncioRef.update(dataToSave);
    } else {
      await anuncioRef.set(dataToSave);
    }

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: isUpdate ? 'anuncio_actualizado_import' : 'anuncio_importado',
      anuncioId: anuncioRef.id,
      anuncioTitulo: anuncio.titulo,
      descripcion: `Anuncio ${isUpdate ? 'actualizado' : 'importado'}: ${anuncio.titulo}`
    });

    return NextResponse.json({
      success: true,
      id: anuncioRef.id,
      isUpdate
    });

  } catch (error) {
    console.error('Error importando anuncio:', error);
    return NextResponse.json({
      error: 'Error al importar anuncio',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
