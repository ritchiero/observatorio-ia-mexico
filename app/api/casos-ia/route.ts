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

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('casos_ia').orderBy('fechaCreacion', 'desc').get();
    
    const casos = snapshot.docs.map((doc) => {
      const data = doc.data();
      const converted = convertTimestamps(data);
      return {
        id: doc.id,
        ...converted,
      } as CasoIA;
    });
    
    return NextResponse.json({ casos });
  } catch (error) {
    console.error('Error fetching casos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los casos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    
    // Validaciones mínimas
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }
    
    // Estructura del caso con valores por defecto
    const nuevoCaso = {
      // Identificación
      nombre: body.nombre,
      expedienteActual: body.expedienteActual || '',
      tribunalActual: body.tribunalActual || '',
      estado: body.estado || 'en_proceso',
      
      // Clasificación
      materia: body.materia || 'amparo',
      temaIA: body.temaIA || 'otro',
      subtema: body.subtema || null,
      
      // Partes
      partes: body.partes || {
        actor: '',
        demandado: '',
        terceros: null,
      },
      
      // Contexto
      resumen: body.resumen || '',
      hechos: body.hechos || null,
      elementoIA: body.elementoIA || '',
      
      // Trayectoria
      trayectoria: body.trayectoria || [],
      
      // Criterio
      criterio: body.criterio || null,
      
      // Documentos y fuentes
      documentos: body.documentos || [],
      fuentes: body.fuentes || [],
      
      // Meta
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };
    
    const docRef = await db.collection('casos_ia').add(nuevoCaso);
    
    return NextResponse.json({ 
      id: docRef.id,
      message: 'Caso creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating caso:', error);
    return NextResponse.json(
      { error: 'Error al crear el caso' },
      { status: 500 }
    );
  }
}
