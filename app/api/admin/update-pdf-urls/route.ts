import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates must be an array' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const results: Record<string, string> = {};

    for (const update of updates) {
      const { id, urlPDF, urlGaceta } = update;

      if (!id || !urlPDF) {
        results[id || 'unknown'] = 'error: missing id or urlPDF';
        continue;
      }

      try {
        const updateData: any = {
          urlPDF,
          updatedAt: FieldValue.serverTimestamp()
        };

        if (urlGaceta) {
          updateData.urlGaceta = urlGaceta;
        }

        await db.collection('iniciativas').doc(id).update(updateData);
        results[id] = 'success';
      } catch (error: any) {
        results[id] = `error: ${error.message}`;
      }
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error: any) {
    console.error('[UPDATE_PDF_URLS] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
