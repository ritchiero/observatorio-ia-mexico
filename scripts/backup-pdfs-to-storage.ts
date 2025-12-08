import { getAdminDb, getAdminStorage } from '../lib/firebase-admin';
import * as https from 'https';
import * as http from 'http';
import { Readable } from 'stream';

interface IniciativaData {
  id: string;
  titulo: string;
  urlPDF?: string;
  urlPDFOriginal?: string;
  urlPDFBackup?: string;
}

/**
 * Descarga un archivo desde una URL y retorna un buffer
 */
async function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Seguir redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`  → Siguiendo redirección a: ${redirectUrl}`);
          return downloadFile(redirectUrl).then(resolve).catch(reject);
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Error al descargar: HTTP ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Sube un archivo a Firebase Storage
 */
async function uploadToStorage(
  buffer: Buffer,
  iniciativaId: string,
  filename: string
): Promise<string> {
  const storage = getAdminStorage();
  const bucket = storage.bucket();
  
  // Ruta en Storage: pdfs/iniciativas/{id}/{filename}
  const filePath = `pdfs/iniciativas/${iniciativaId}/${filename}`;
  const file = bucket.file(filePath);

  // Subir el archivo
  await file.save(buffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        iniciativaId,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Hacer el archivo público
  await file.makePublic();

  // Obtener URL pública
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  
  return publicUrl;
}

/**
 * Procesa una iniciativa: descarga el PDF y lo sube a Storage
 */
async function processIniciativa(iniciativa: IniciativaData): Promise<{
  success: boolean;
  iniciativaId: string;
  newUrl?: string;
  error?: string;
}> {
  const { id, titulo, urlPDF } = iniciativa;

  console.log(`\n📄 Procesando: ${titulo}`);
  console.log(`   ID: ${id}`);

  if (!urlPDF) {
    console.log('   ⚠️  Sin URL de PDF');
    return { success: false, iniciativaId: id, error: 'Sin URL de PDF' };
  }

  console.log(`   📥 Descargando desde: ${urlPDF}`);

  try {
    // Descargar PDF
    const buffer = await downloadFile(urlPDF);
    console.log(`   ✓ Descargado: ${(buffer.length / 1024).toFixed(2)} KB`);

    // Generar nombre de archivo
    const filename = `${id}.pdf`;

    // Subir a Storage
    console.log(`   📤 Subiendo a Firebase Storage...`);
    const newUrl = await uploadToStorage(buffer, id, filename);
    console.log(`   ✓ Subido exitosamente`);
    console.log(`   🔗 Nueva URL: ${newUrl}`);

    return { success: true, iniciativaId: id, newUrl };
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, iniciativaId: id, error: error.message };
  }
}

/**
 * Actualiza Firestore con las nuevas URLs
 */
async function updateFirestore(
  iniciativaId: string,
  newUrl: string,
  originalUrl: string
) {
  const db = getAdminDb();
  const docRef = db.collection('iniciativas').doc(iniciativaId);

  await docRef.update({
    urlPDFBackup: newUrl,           // Nueva URL de Firebase Storage
    urlPDFOriginal: originalUrl,    // URL original como respaldo
    urlPDF: newUrl,                 // Actualizar URL principal
    pdfBackedUpAt: new Date(),      // Timestamp del backup
  });

  console.log(`   ✓ Firestore actualizado`);
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Iniciando backup de PDFs a Firebase Storage\n');

  const db = getAdminDb();
  
  // Obtener todas las iniciativas con URL de PDF
  const snapshot = await db.collection('iniciativas')
    .where('urlPDF', '!=', null)
    .get();

  console.log(`📊 Encontradas ${snapshot.size} iniciativas con PDF\n`);

  const results = {
    total: snapshot.size,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  // Procesar cada iniciativa
  for (const doc of snapshot.docs) {
    const iniciativa = {
      id: doc.id,
      ...doc.data(),
    } as IniciativaData;

    // Saltar si ya tiene backup
    if (iniciativa.urlPDFBackup) {
      console.log(`\n⏭️  Saltando ${iniciativa.id}: Ya tiene backup`);
      results.skipped++;
      continue;
    }

    const result = await processIniciativa(iniciativa);

    if (result.success && result.newUrl) {
      // Actualizar Firestore
      await updateFirestore(
        result.iniciativaId,
        result.newUrl,
        iniciativa.urlPDF!
      );
      results.success++;
    } else {
      results.failed++;
      if (result.error) {
        results.errors.push({ id: result.iniciativaId, error: result.error });
      }
    }

    // Pequeña pausa entre requests para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`Total iniciativas:    ${results.total}`);
  console.log(`✓ Exitosas:           ${results.success}`);
  console.log(`⏭️  Saltadas:          ${results.skipped}`);
  console.log(`❌ Fallidas:          ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORES:');
    results.errors.forEach(({ id, error }) => {
      console.log(`   - ${id}: ${error}`);
    });
  }

  console.log('\n✅ Proceso completado\n');
}

// Ejecutar
main().catch(console.error);
