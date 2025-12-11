import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { CasoIA } from '@/types/casos-ia';

// Helper para convertir Timestamps a strings
function convertTimestamps(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestamps(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => 
        item && typeof item === 'object' 
          ? convertTimestamps(item as Record<string, unknown>) 
          : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    
    const doc = await db.collection('casos_ia').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }
    
    const data = doc.data();
    const converted = convertTimestamps(data as Record<string, unknown>);
    const caso = {
      id: doc.id,
      ...converted,
    } as CasoIA;
    
    return NextResponse.json({ caso });
  } catch (error) {
    console.error('Error fetching caso:', error);
    return NextResponse.json(
      { error: 'Error al obtener el caso' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const body = await request.json();
    
    const docRef = db.collection('casos_ia').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }
    
    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {
      fechaActualizacion: new Date(),
    };
    
    // Campos actualizables
    const camposPermitidos = [
      'nombre', 'expedienteActual', 'tribunalActual', 'estado',
      'materia', 'temaIA', 'subtema',
      'partes', 'resumen', 'hechos', 'elementoIA',
      'trayectoria', 'criterio',
      'documentos', 'fuentes'
    ];
    
    for (const campo of camposPermitidos) {
      if (body[campo] !== undefined) {
        updateData[campo] = body[campo];
      }
    }
    
    await docRef.update(updateData);
    
    return NextResponse.json({ 
      message: 'Caso actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error updating caso:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el caso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    
    const docRef = db.collection('casos_ia').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }
    
    await docRef.delete();
    
    return NextResponse.json({ 
      message: 'Caso eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error deleting caso:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el caso' },
      { status: 500 }
    );
  }
}
