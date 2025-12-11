import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// IDs de duplicados conocidos a eliminar
const DUPLICATES_TO_DELETE = [
  'iniciativa-80',  // Monreal Art. 73 duplicado
  'iniciativa-91',  // Monreal Art. 73 duplicado
];

export async function POST() {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  const db = getAdminDb();
  const results: Array<{ id: string; status: string; titulo?: string }> = [];

  for (const id of DUPLICATES_TO_DELETE) {
    try {
      const docRef = db.collection('iniciativas').doc(id);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        await docRef.delete();
        results.push({
          id,
          status: 'deleted',
          titulo: data?.titulo?.substring(0, 60)
        });
        console.log(`[DELETE] ✓ Eliminado: ${id}`);
      } else {
        results.push({ id, status: 'not_found' });
        console.log(`[DELETE] ⚠️ No existe: ${id}`);
      }
    } catch (error: any) {
      results.push({ id, status: 'error', titulo: error.message });
      console.error(`[DELETE] ✗ Error en ${id}:`, error.message);
    }
  }

  const deleted = results.filter(r => r.status === 'deleted').length;

  return NextResponse.json({
    success: true,
    message: `${deleted} duplicados eliminados`,
    results
  });
}

export async function GET() {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  // Solo mostrar qué se va a eliminar
  return NextResponse.json({
    message: 'Duplicados a eliminar',
    duplicates: DUPLICATES_TO_DELETE,
    instructions: 'Haz POST a este endpoint para eliminarlos'
  });
}
