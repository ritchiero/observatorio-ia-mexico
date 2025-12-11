import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[API] Fetching iniciativas from Firestore...');
    const db = getAdminDb();
    const snapshot = await db.collection('iniciativas').get();
    
    console.log('[API] Snapshot size:', snapshot.size);
    
    const iniciativas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Normalizar: Firestore usa "estatus", frontend espera "status"
        // Priorizar "estatus" si existe, sino usar "status"
        status: data.estatus || data.status || 'en_comisiones',
        // Convertir Timestamps a strings para JSON
        fecha: data.fecha?.toDate ? data.fecha.toDate().toISOString() : data.fecha,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        eventos: data.eventos?.map((e: any) => ({
          ...e,
          fecha: e.fecha?.toDate ? e.fecha.toDate().toISOString() : e.fecha
        })) || []
      };
    });
    
    // Ordenar por fecha descendente
    iniciativas.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA;
    });
    
    console.log('[API] Iniciativas fetched:', iniciativas.length);
    
    return NextResponse.json({
      success: true,
      count: iniciativas.length,
      data: iniciativas
    });
    
  } catch (error: any) {
    console.error('[API] Error fetching iniciativas:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
