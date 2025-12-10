import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    
    // Actualizar iniciativa-70 con los datos correctos
    await db.collection('iniciativas').doc('iniciativa-70').update({
      camara: 'Local',
      temas: ['Deepfakes y Contenido', 'Seguridad y Delitos'],
      estatus: 'Aprobada',
      urlPDF: 'http://congresosanluis.gob.mx/sites/default/files/unpload/legislacion/codigos/2025/11/Codigo_Penal_Estado%20%28al%2025%20de%20noviembre%20de%20%202025%29..pdf',
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Ley de SLP corregida exitosamente'
    });
    
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
