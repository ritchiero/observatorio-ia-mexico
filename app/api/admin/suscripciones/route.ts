import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('suscripciones')
      .orderBy('fechaRegistro', 'desc')
      .get();

    const suscripciones = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        fechaRegistro: data.fechaRegistro?.toDate?.()?.toISOString() || data.fechaRegistro,
        activo: data.activo ?? true,
      };
    });

    return NextResponse.json({ suscripciones });
  } catch (error) {
    console.error('Error fetching suscripciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las suscripciones' },
      { status: 500 }
    );
  }
}
