import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  loadPublicReadFallback,
  PublicReadFallbackError,
} from '@/lib/public-read-fallback';
import { sanitizePublicRecord } from '@/lib/public-record-sanitizer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function serializeDate(value: unknown): unknown {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const timestamp = value as { toDate?: () => Date };
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
  }
  return value;
}

export async function GET() {
  try {
    const fallback = await loadPublicReadFallback(
      '/api/iniciativas',
      (payload): payload is { success: boolean; count?: number; data: unknown[] } =>
        Boolean(
          payload &&
          typeof payload === 'object' &&
          'success' in payload &&
          payload.success === true &&
          'data' in payload &&
          Array.isArray(payload.data)
        )
    );
    if (fallback.used) {
      console.info('[api/iniciativas] Usando datos públicos para la vista local');
      return NextResponse.json(fallback.data);
    }

    console.log('[API] Fetching iniciativas from Firestore...');
    const db = getAdminDb();
    const snapshot = await db.collection('iniciativas').get();
    
    console.log('[API] Snapshot size:', snapshot.size);
    
    const iniciativas = snapshot.docs
      // Excluir duplicados marcados (consolidación)
      .filter(doc => !doc.data().oculto)
      .map(doc => {
      const data = doc.data();
      const publicData = sanitizePublicRecord(data);
      return {
        id: doc.id,
        ...publicData,
        // Normalizar: Firestore usa "estatus", frontend espera "status"
        // Priorizar "estatus" si existe, sino usar "status"
        status: data.estatus || data.status || 'en_comisiones',
        // Convertir Timestamps a strings para JSON
        fecha: data.fecha?.toDate ? data.fecha.toDate().toISOString() : data.fecha,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        eventos: data.eventos?.map((e: Record<string, unknown>) => ({
          ...e,
          fecha: serializeDate(e.fecha)
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
    
  } catch (error: unknown) {
    console.error('[API] Error fetching iniciativas:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: error instanceof PublicReadFallbackError ? error.status : 500 }
    );
  }
}
