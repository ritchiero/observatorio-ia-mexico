import { NextResponse } from 'next/server';
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin';

/**
 * Descarga un archivo desde una URL
 */
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ObservatorioIA/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Sube un archivo a Firebase Storage
 */
async function uploadToStorage(
  buffer: Buffer,
  iniciativaId: string
): Promise<string> {
  const storage = getAdminStorage();
  const bucket = storage.bucket();
  
  const filePath = `pdfs/iniciativas/${iniciativaId}.pdf`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        iniciativaId,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

export async function GET() {
  try {
    const db = getAdminDb();
    
    const snapshot = await db.collection('iniciativas')
      .where('urlPDF', '!=', null)
      .get();

    const results = {
      total: snapshot.size,
      success: 0,
      failed: 0,
      skipped: 0,
      processed: [] as Array<{ id: string; status: string; url?: string; error?: string }>,
    };

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const id = doc.id;

      // Saltar si ya tiene backup
      if (data.urlPDFBackup) {
        results.skipped++;
        results.processed.push({ id, status: 'skipped', url: data.urlPDFBackup });
        continue;
      }

      try {
        // Descargar PDF
        const buffer = await downloadFile(data.urlPDF);
        
        // Subir a Storage
        const newUrl = await uploadToStorage(buffer, id);
        
        // Actualizar Firestore
        await doc.ref.update({
          urlPDFBackup: newUrl,
          urlPDFOriginal: data.urlPDF,
          urlPDF: newUrl,
          pdfBackedUpAt: new Date(),
        });

        results.success++;
        results.processed.push({ id, status: 'success', url: newUrl });
      } catch (error: any) {
        results.failed++;
        results.processed.push({ id, status: 'failed', error: error.message });
      }

      // Pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      message: 'Backup de PDFs completado',
      results,
    });
  } catch (error: any) {
    console.error('Error en backup de PDFs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
