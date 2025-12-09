import { getAdminDb } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

async function updatePDFUrls() {
  const updates = [
    {
      id: 'iniciativa-7',
      urlPDF: 'http://sil.gobernacion.gob.mx/Archivos/Documentos/2023/01/asun_4478222_20230105_1675096502.pdf',
      urlGaceta: 'http://sil.gobernacion.gob.mx/Archivos/Documentos/2023/01/asun_4478222_20230105_1675096502.pdf'
    },
    {
      id: 'iniciativa-59',
      urlPDF: 'https://infosen.senado.gob.mx/sgsp/gaceta/66/1/2024-12-13-1/assets/documentos/Ini_PVEM_Sen_Juanita_Guerra_Ley_Nacional_que_regula_el_uso_de_la_IA.pdf',
      urlGaceta: 'https://infosen.senado.gob.mx/sgsp/gaceta/66/1/2024-12-13-1/assets/documentos/Ini_PVEM_Sen_Juanita_Guerra_Ley_Nacional_que_regula_el_uso_de_la_IA.pdf'
    },
    {
      id: 'iniciativa-61',
      urlPDF: 'https://sil.gobernacion.gob.mx/Archivos/Documentos/2025/04/asun_4896460_20250430_1747757009.pdf',
      urlGaceta: 'https://sil.gobernacion.gob.mx/Archivos/Documentos/2025/04/asun_4896460_20250430_1747757009.pdf'
    }
  ];

  console.log('Actualizando URLs de PDFs en Firestore...\n');

  const db = getAdminDb();

  for (const update of updates) {
    try {
      await db.collection('iniciativas').doc(update.id).update({
        urlPDF: update.urlPDF,
        urlGaceta: update.urlGaceta,
        updatedAt: FieldValue.serverTimestamp()
      });
      console.log(`✅ ${update.id}: URL actualizada`);
      console.log(`   Nueva URL: ${update.urlPDF}\n`);
    } catch (error: any) {
      console.error(`❌ ${update.id}: Error - ${error.message}\n`);
    }
  }

  console.log('Actualización completada.');
  process.exit(0);
}

updatePDFUrls();
