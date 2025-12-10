import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos

export async function GET() {
  try {
    const db = getAdminDb();
    
    // Obtener todas las iniciativas
    const snapshot = await db.collection('iniciativas').get();
    
    const backup = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: backup.length,
      data: backup
    }, { status: 200 });
  } catch (error: any) {
    console.error('[BACKUP] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
