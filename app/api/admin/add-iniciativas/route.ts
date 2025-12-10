import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { iniciativas } = body;

    if (!Array.isArray(iniciativas)) {
      return NextResponse.json({ error: 'Se esperaba un array de iniciativas' }, { status: 400 });
    }

    const results = [];
    
    for (const iniciativa of iniciativas) {
      try {
        const { id, ...data } = iniciativa;
        
        // Agregar la iniciativa con el ID especificado
        await adminDb.collection('iniciativas').doc(id).set({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        results.push({ id, status: 'success' });
      } catch (error: any) {
        results.push({ id: iniciativa.id, status: 'error', message: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      total: iniciativas.length,
      imported: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
