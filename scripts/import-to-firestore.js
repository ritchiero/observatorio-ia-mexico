/**
 * Script para importar las 69 iniciativas a Firestore vía API
 * 
 * Uso: node scripts/import-to-firestore.js
 */

const fs = require('fs');
const path = require('path');

async function importToFirestore() {
  // Leer el JSON parseado
  const jsonPath = path.join(__dirname, '../iniciativas-parsed.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Archivo iniciativas-parsed.json no encontrado');
    console.log('   Ejecuta primero: node scripts/parse-informe.js');
    return;
  }
  
  const iniciativas = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  console.log(`📊 Importando ${iniciativas.length} iniciativas a Firestore...`);
  
  const ADMIN_KEY = process.env.ADMIN_KEY;
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://observatorio-ia-mexico.vercel.app';
  
  if (!ADMIN_KEY) {
    console.error('❌ ADMIN_KEY no configurada');
    console.log('   Configura ADMIN_KEY en .env.local o como variable de entorno');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const iniciativa of iniciativas) {
    try {
      const response = await fetch(`${API_URL}/api/admin/iniciativas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY
        },
        body: JSON.stringify(iniciativa)
      });
      
      if (response.ok) {
        successCount++;
        console.log(`✅ [${successCount}/${iniciativas.length}] Iniciativa #${iniciativa.numero} importada`);
      } else {
        errorCount++;
        const error = await response.text();
        errors.push({ numero: iniciativa.numero, error });
        console.error(`❌ Error en iniciativa #${iniciativa.numero}: ${error}`);
      }
    } catch (error) {
      errorCount++;
      errors.push({ numero: iniciativa.numero, error: error.message });
      console.error(`❌ Error en iniciativa #${iniciativa.numero}:`, error.message);
    }
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📈 Resumen:`);
  console.log(`   ✅ Exitosas: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errores detallados:`);
    errors.forEach(e => console.log(`   #${e.numero}: ${e.error}`));
  }
}

importToFirestore().catch(console.error);
