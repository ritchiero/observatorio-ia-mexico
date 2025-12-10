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
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    await db.collection('iniciativas').doc(id).update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Iniciativa actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating iniciativa:', error);
    return NextResponse.json(
      { error: 'Error al actualizar iniciativa' },
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
