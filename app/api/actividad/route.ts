import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  loadPublicReadFallback,
  PublicReadFallbackError,
} from '@/lib/public-read-fallback';

// GET /api/actividad?limit=N - Obtener actividad reciente (orden descendente por fecha)
// Default 200, max 500. Antes había un limit(50) hardcoded que cortaba el feed
// cuando la colección creció — ahora se puede pedir más sin reabrir el código.
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const fallback = await loadPublicReadFallback(
      `/api/actividad?limit=${limit}`,
      (payload): payload is { actividad: unknown[]; count: number; limit: number } =>
        Boolean(
          payload &&
          typeof payload === 'object' &&
          'actividad' in payload &&
          Array.isArray(payload.actividad)
        )
    );
    if (fallback.used) {
      console.info('[api/actividad] Usando actividad pública para la vista local');
      return NextResponse.json(fallback.data);
    }

    const db = getAdminDb();
    const snapshot = await db
      .collection('actividad')
      .orderBy('fecha', 'desc')
      .limit(limit)
      .get();

    const actividad = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate().toISOString(),
      };
    });

    return NextResponse.json({ actividad, count: actividad.length, limit });
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividad' },
      { status: error instanceof PublicReadFallbackError ? error.status : 500 }
    );
  }
}
