/**
 * Script para poblar el timeline histórico de anuncios existentes
 * 
 * Este script crea eventos iniciales de timeline para todos los anuncios
 * que no tienen eventos aún.
 * 
 * Uso: npx tsx scripts/poblar-timeline.ts
 */

import { getAdminDb } from '../lib/firebase-admin';
import { crearEventoInicial } from '../lib/timeline';

async function poblarTimeline() {
  console.log('🚀 Iniciando población de timeline histórico...\n');
  
  const db = getAdminDb();
  let procesados = 0;
  let creados = 0;
  let errores = 0;

  try {
    // Obtener todos los anuncios
    const anunciosSnapshot = await db.collection('anuncios').get();
    console.log(`📊 Total de anuncios encontrados: ${anunciosSnapshot.size}\n`);

    for (const doc of anunciosSnapshot.docs) {
      const anuncio = doc.data();
      procesados++;

      console.log(`[${procesados}/${anunciosSnapshot.size}] Procesando: ${anuncio.titulo}`);

      try {
        // Verificar si ya tiene eventos de timeline
        const eventosSnapshot = await db
          .collection('eventos_timeline')
          .where('anuncioId', '==', doc.id)
          .where('tipo', '==', 'anuncio_inicial')
          .limit(1)
          .get();

        if (!eventosSnapshot.empty) {
          console.log('  ⏭️  Ya tiene evento inicial, saltando...\n');
          continue;
        }

        // Crear evento inicial
        const fechaAnuncio = anuncio.fechaAnuncio.toDate();
        
        await crearEventoInicial({
          anuncioId: doc.id,
          titulo: anuncio.titulo,
          fechaAnuncio,
          responsable: anuncio.responsable,
          citaPromesa: anuncio.citaPromesa || '',
          fuenteOriginal: anuncio.fuenteOriginal || '',
          fuentesAdicionales: [],
        });

        creados++;
        console.log('  ✅ Evento inicial creado\n');

      } catch (error) {
        errores++;
        console.error(`  ❌ Error al procesar: ${error}\n`);
      }
    }

    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE POBLACIÓN DE TIMELINE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total procesados: ${procesados}`);
    console.log(`Eventos creados: ${creados}`);
    console.log(`Errores: ${errores}`);
    console.log(`Ya existentes: ${procesados - creados - errores}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (errores === 0) {
      console.log('✅ Población de timeline completada exitosamente!');
    } else {
      console.log('⚠️  Población completada con algunos errores.');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar script
poblarTimeline()
  .then(() => {
    console.log('\n👋 Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error inesperado:', error);
    process.exit(1);
  });
