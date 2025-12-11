import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db: Firestore = getAdminDb();
    const { id } = await params;
    const doc = await db.collection('casos_ia').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    const data = doc.data();
    const caso = {
      id: doc.id,
      nombre: data?.nombre || '',
      tribunal: data?.tribunal || '',
      materia: data?.materia || '',
      temaIA: data?.temaIA || '',
      partes: data?.partes || {},
      resumen: data?.resumen || '',
      fechaInicio: data?.fechaInicio?.toDate?.()?.toISOString() || data?.fechaInicio || '',
      fechaResolucion: data?.fechaResolucion?.toDate?.()?.toISOString() || data?.fechaResolucion || null,
      estado: data?.estado || 'en_proceso',
      resolucion: data?.resolucion || null,
      relevancia: data?.relevancia || '',
      antecedentes: data?.antecedentes || null,
      hechos: data?.hechos || null,
      argumentos: data?.argumentos || null,
      impacto: data?.impacto || null,
      documentos: data?.documentos || [],
      fuentes: data?.fuentes || [],
    };

    return NextResponse.json({ success: true, caso });
  } catch (error) {
    console.error('[API] Error fetching caso:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching caso' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db: Firestore = getAdminDb();
    const { id } = await params;
    const body = await request.json();
    const { caso } = body;

    if (!caso) {
      return NextResponse.json(
        { success: false, error: 'Datos del caso requeridos' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...caso,
      updatedAt: new Date(),
    };

    if (caso.fechaInicio) {
      updateData.fechaInicio = new Date(caso.fechaInicio);
    }
    if (caso.fechaResolucion) {
      updateData.fechaResolucion = new Date(caso.fechaResolucion);
    }

    await db.collection('casos_ia').doc(id).update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: 'Caso actualizado exitosamente' 
    });
  } catch (error) {
    console.error('[API] Error updating caso:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating caso' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db: Firestore = getAdminDb();
    const { id } = await params;
    await db.collection('casos_ia').doc(id).delete();

    return NextResponse.json({ 
      success: true, 
      message: 'Caso eliminado exitosamente' 
    });
  } catch (error) {
    console.error('[API] Error deleting caso:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting caso' },
      { status: 500 }
    );
  }
}
