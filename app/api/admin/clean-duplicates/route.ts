import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    const snapshot = await db.collection('iniciativas').get();
    
    console.log('[CLEAN] Total documentos:', snapshot.size);
    
    // Agrupar por título normalizado
    const groups: Record<string, Array<{ id: string; data: any }>> = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const titulo = (data.titulo || '').toLowerCase().trim();
      
      if (!groups[titulo]) {
        groups[titulo] = [];
      }
      groups[titulo].push({ id: doc.id, data: { ...data, id: doc.id } });
    });
    
    // Encontrar duplicados
    const duplicates: Array<{ titulo: string; count: number; items: any[] }> = [];
    
    for (const [titulo, items] of Object.entries(groups)) {
      if (items.length > 1) {
        duplicates.push({
          titulo: titulo.substring(0, 80),
          count: items.length,
          items: items.map(item => ({
            id: item.id,
            estadoVerificacion: item.data.estadoVerificacion || null,
            createdAt: item.data.createdAt?.toDate?.() || item.data.createdAt || null
          }))
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      totalDocuments: snapshot.size,
      duplicateGroups: duplicates.length,
      duplicates
    });
    
  } catch (error: any) {
    console.error('[CLEAN] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const db = getAdminDb();
    const docRef = db.collection('iniciativas').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }
    
    await docRef.delete();
    
    console.log('[CLEAN] Documento eliminado:', id);
    
    return NextResponse.json({
      success: true,
      deletedId: id
    });
    
  } catch (error: any) {
    console.error('[CLEAN] Error eliminando:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
