/**
 * Script para importar iniciativas usando Firebase Admin SDK
 * Este script tiene permisos totales y no requiere cambiar las reglas de Firestore
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin con variables de entorno
const serviceAccount = {
  type: "service_account",
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
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
