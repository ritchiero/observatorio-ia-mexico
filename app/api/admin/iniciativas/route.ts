import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// POST - Crear nueva iniciativa
export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    const data = await request.json();

    const iniciativaData = {
      ...data,
      creadoManualmente: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('iniciativas').add(iniciativaData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Iniciativa creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating iniciativa:', error);
    return NextResponse.json(
      { error: 'Error al crear iniciativa' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar iniciativa existente
export async function PUT(request: NextRequest) {
  console.log('[API PUT] Iniciando actualización de iniciativa');
  
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) {
    console.log('[API PUT] Error de autenticación');
    return authError;
  }
  
  console.log('[API PUT] Autenticación exitosa');

  try {
    const db = getAdminDb();
    const data = await request.json();
    const { id, ...updateData } = data;

    console.log('[API PUT] ID:', id);
    console.log('[API PUT] Campos a actualizar:', Object.keys(updateData));

    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    // Limpiar campos undefined
    const cleanData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    }

    await db.collection('iniciativas').doc(id).update({
      ...cleanData,
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log('[API PUT] Actualización exitosa');

    return NextResponse.json({
      success: true,
      message: 'Iniciativa actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('[API PUT] Error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar iniciativa' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar iniciativa
export async function DELETE(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    await db.collection('iniciativas').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Iniciativa eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting iniciativa:', error);
    return NextResponse.json(
      { error: 'Error al eliminar iniciativa' },
      { status: 500 }
    );
  }
}
