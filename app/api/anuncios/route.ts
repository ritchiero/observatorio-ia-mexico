import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper para convertir Timestamp a ISO string
function convertTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

// GET /api/anuncios - Obtener todos los anuncios
export async function GET() {
  try {
    const db = getAdminDb();
    // No usamos orderBy de Firestore: si algún documento guardó `fechaAnuncio` como
    // string en vez de Timestamp, Firestore ordena por tipo (los strings van antes
    // que los timestamps en orden desc) y descoloca el resultado — eso hacía que un
    // anuncio de feb apareciera por encima de los de may. Normalizamos a ISO y
    // ordenamos en JS: robusto ante cualquier inconsistencia de tipo.
    const snapshot = await db.collection('anuncios').get();

    const anuncios = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convertir fechas de fuentes
      const fuentes = data.fuentes?.map((f: Record<string, unknown>) => ({
        ...f,
        fecha: convertTimestamp(f.fecha) || f.fecha
      })) || [];

      return {
        id: doc.id,
        ...data,
        fechaAnuncio: convertTimestamp(data.fechaAnuncio),
        fechaPrometida: convertTimestamp(data.fechaPrometida),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        fuentes,
        actualizaciones: data.actualizaciones?.map((act: { fecha?: unknown; [key: string]: unknown }) => ({
          ...act,
          fecha: convertTimestamp(act.fecha),
        })) || [],
      };
    });

    // Orden por fecha de anuncio, más reciente primero (fechas ya normalizadas a ISO).
    anuncios.sort((a, b) => {
      const ta = a.fechaAnuncio ? new Date(a.fechaAnuncio).getTime() : 0;
      const tb = b.fechaAnuncio ? new Date(b.fechaAnuncio).getTime() : 0;
      return tb - ta;
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
      imagen,
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
      imagen: imagen || '',
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
