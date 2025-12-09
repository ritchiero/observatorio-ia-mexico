import { getAdminDb } from '../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

async function fixDate() {
  const db = getAdminDb();
  
  // Fecha correcta: 30 de abril de 2025
  const correctDate = new Date('2025-04-30T04:00:00.000Z');
  
  try {
    await db.collection('iniciativas').doc('iniciativa-61').update({
      fecha: Timestamp.fromDate(correctDate),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Fecha de iniciativa-61 corregida:');
    console.log(`   Fecha anterior: 2024-04-22`);
    console.log(`   Fecha correcta: 2025-04-30`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixDate();
