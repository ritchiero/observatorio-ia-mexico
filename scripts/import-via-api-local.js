/**
 * Script para importar iniciativas vía API usando ADMIN_KEY local
 * Este script se ejecuta localmente y usa el servidor de desarrollo
 * 
 * Uso: 
 * 1. npm run dev (en otra terminal)
 * 2. node scripts/import-via-api-local.js
 */

const fs = require('fs');
const path = require('path');

async function importIniciativas() {
  const jsonPath = path.join(__dirname, '../iniciativas-final.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Archivo iniciativas-final.json no encontrado');
    return;
  }
  
  const iniciativas = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  console.log(`📊 Importando ${iniciativas.length} iniciativas...`);
  console.log('⚠️  Asegúrate de que el servidor de desarrollo esté corriendo (npm run dev)\n');
  
  const ADMIN_KEY = 'observatorio2025'; // ADMIN_KEY local
  const API_URL = 'http://localhost:3000';
  
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
        console.log(`✅ [${successCount}/${iniciativas.length}] Iniciativa #${iniciativa.numero} - ${iniciativa.titulo.substring(0, 50)}...`);
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
    
    // Pequeña pausa
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
}

importIniciativas().catch(console.error);
