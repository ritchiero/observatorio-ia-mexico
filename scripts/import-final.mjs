/**
 * Script para importar iniciativas usando Firebase Admin SDK
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer credenciales del archivo
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../firebase-service-account.json'), 'utf-8')
);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin inicializado');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function importIniciativas() {
  const jsonPath = join(__dirname, '../iniciativas-final.json');
  
  try {
    const iniciativas = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`\n📊 Importando ${iniciativas.length} iniciativas...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const iniciativa of iniciativas) {
      try {
        // Generar ID único basado en el número de iniciativa
        const docId = `iniciativa-${iniciativa.numero}`;
        
        await db.collection('iniciativas').doc(docId).set(iniciativa);
        
        successCount++;
        console.log(`✅ [${successCount}/${iniciativas.length}] #${iniciativa.numero} - ${iniciativa.titulo.substring(0, 50)}...`);
      } catch (error) {
        errorCount++;
        errors.push({ numero: iniciativa.numero, error: error.message });
        console.error(`❌ Error en iniciativa #${iniciativa.numero}:`, error.message);
      }
      
      // Pequeña pausa para no saturar Firestore
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n📈 Resumen:`);
    console.log(`   ✅ Exitosas: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errores detallados:`);
      errors.slice(0, 10).forEach(e => console.log(`   #${e.numero}: ${e.error}`));
      if (errors.length > 10) {
        console.log(`   ... y ${errors.length - 10} errores más`);
      }
    }
    
    console.log('\n✅ Importación completada!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

importIniciativas();
