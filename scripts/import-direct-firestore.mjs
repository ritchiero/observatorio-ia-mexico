/**
 * Script para importar las 69 iniciativas directamente a Firestore
 * usando Firebase Admin SDK
 * 
 * Uso: node scripts/import-direct-firestore.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../firebase-service-account.json'), 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function importIniciativas() {
  // Leer el JSON parseado
  const jsonPath = path.join(__dirname, '../iniciativas-parsed.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Archivo iniciativas-parsed.json no encontrado');
    return;
  }
  
  const iniciativas = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  console.log(`📊 Importando ${iniciativas.length} iniciativas a Firestore...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const iniciativa of iniciativas) {
    try {
      // Convertir fecha ISO string a Timestamp
      const fecha = Timestamp.fromDate(new Date(iniciativa.fecha));
      
      // Convertir eventos
      const eventos = iniciativa.eventos.map(evento => ({
        ...evento,
        fecha: Timestamp.fromDate(new Date(evento.fecha))
      }));
      
      // Preparar documento
      const docData = {
        ...iniciativa,
        fecha,
        eventos,
        creadoManualmente: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Agregar a Firestore
      await db.collection('iniciativas').add(docData);
      
      successCount++;
      console.log(`✅ [${successCount}/${iniciativas.length}] Iniciativa #${iniciativa.numero} importada`);
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error en iniciativa #${iniciativa.numero}:`, error.message);
    }
  }
  
  console.log(`\n📈 Resumen:`);
  console.log(`   ✅ Exitosas: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
}

importIniciativas()
  .then(() => {
    console.log('\n✅ Importación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
