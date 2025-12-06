import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// GET /api/anuncios - Obtener todos los anuncios
export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('anuncios').orderBy('fechaAnuncio', 'desc').get();
    
    const anuncios = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaAnuncio: data.fechaAnuncio?.toDate().toISOString(),
        fechaPrometida: data.fechaPrometida?.toDate().toISOString() || null,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        actualizaciones: data.actualizaciones?.map((act: { fecha?: { toDate: () => Date }; [key: string]: unknown }) => ({
          ...act,
          fecha: act.fecha?.toDate().toISOString(),
        })) || [],
      };
    });

    return NextResponse.json({ anuncios });
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    return NextResponse.json(
      { error: 'Error al obtener anuncios' },
      { status: 500 }
    );
  }
}

// POST /api/anuncios - Crear un anuncio manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titulo,
      descripcion,
      fechaAnuncio,
      fechaPrometida,
      responsable,
      dependencia,
      fuenteOriginal,
      citaPromesa,
      status,
    } = body;

    // Validación básica
    if (!titulo || !descripcion || !fechaAnuncio || !responsable || !dependencia) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc();

    await anuncioRef.set({
      id: anuncioRef.id,
      titulo,
      descripcion,
      fechaAnuncio: Timestamp.fromDate(new Date(fechaAnuncio)),
      fechaPrometida: fechaPrometida ? Timestamp.fromDate(new Date(fechaPrometida)) : null,
      responsable,
      dependencia,
      fuenteOriginal: fuenteOriginal || '',
      citaPromesa: citaPromesa || '',
      status: status || 'prometido',
      actualizaciones: [],
      creadoManualmente: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'anuncio_manual',
      anuncioId: anuncioRef.id,
      anuncioTitulo: titulo,
      descripcion: `Anuncio agregado manualmente: ${titulo}`,
    });

    return NextResponse.json({
      success: true,
      id: anuncioRef.id,
    });
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    return NextResponse.json(
      { error: 'Error al crear anuncio' },
      { status: 500 }
    );
  }
}
