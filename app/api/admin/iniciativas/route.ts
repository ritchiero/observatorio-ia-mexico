import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Verificar admin key
function verifyAdminKey(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === process.env.ADMIN_KEY;
}

// POST - Crear nueva iniciativa
export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Convertir fecha string a Timestamp si es necesario
    if (typeof data.fecha === 'string') {
      data.fecha = Timestamp.fromDate(new Date(data.fecha));
    }

    // Convertir eventos si existen
    if (data.eventos && Array.isArray(data.eventos)) {
      data.eventos = data.eventos.map((evento: any) => ({
        ...evento,
        fecha: typeof evento.fecha === 'string' 
          ? Timestamp.fromDate(new Date(evento.fecha))
          : evento.fecha
      }));
    }

    const iniciativaData = {
      ...data,
      creadoManualmente: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'iniciativas'), iniciativaData);

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
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    // Convertir fecha string a Timestamp si es necesario
    if (typeof updateData.fecha === 'string') {
      updateData.fecha = Timestamp.fromDate(new Date(updateData.fecha));
    }

    // Convertir eventos si existen
    if (updateData.eventos && Array.isArray(updateData.eventos)) {
      updateData.eventos = updateData.eventos.map((evento: any) => ({
        ...evento,
        fecha: typeof evento.fecha === 'string' 
          ? Timestamp.fromDate(new Date(evento.fecha))
          : evento.fecha
      }));
    }

    const docRef = doc(db, 'iniciativas', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
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
  if (!verifyAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de iniciativa requerido' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'iniciativas', id);
    await deleteDoc(docRef);

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
