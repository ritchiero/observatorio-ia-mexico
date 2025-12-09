import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getAdminDb();
    
    // Fecha correcta: 30 de abril de 2025
    const correctDate = new Date('2025-04-30T04:00:00.000Z');
    
    await db.collection('iniciativas').doc('iniciativa-61').update({
      fecha: Timestamp.fromDate(correctDate),
      updatedAt: Timestamp.now()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Fecha de iniciativa-61 corregida',
      previousDate: '2024-04-22',
      newDate: '2025-04-30'
    }, { status: 200 });
  } catch (error: any) {
    console.error('[FIX_DATE] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
