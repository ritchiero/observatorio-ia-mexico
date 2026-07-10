/**
 * Agente de Monitoreo Legislativo
 * 
 * Funciones:
 * 1. Detectar nuevas iniciativas en Gaceta Parlamentaria
 * 2. Monitorear cambios de status en iniciativas existentes
 * 3. Actualizar eventos legislativos (dictámenes, votaciones)
 * 
 * Ejecución: Semanal (cron)
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { IniciativaLegislativa } from '@/types';

type InitiativeChange = {
  iniciativaId: string;
  cambios: Record<string, unknown>;
};

interface DeteccionResult {
  nuevasIniciativas: number;
  actualizaciones: number;
  errores: string[];
}

/**
 * Buscar nuevas iniciativas en fuentes oficiales
 * 
 * TODO: Implementar scraping de:
 * - Gaceta Parlamentaria (http://gaceta.diputados.gob.mx/)
 * - SIL (http://sil.gobernacion.gob.mx/portal/)
 * - Senado (https://infosen.senado.gob.mx/)
 */
async function buscarNuevasIniciativas(): Promise<Partial<IniciativaLegislativa>[]> {
  // Por ahora retorna array vacío
  // En producción, aquí iría el scraping de las gacetas
  
  console.log('🔍 Buscando nuevas iniciativas en Gaceta Parlamentaria...');
  
  // Ejemplo de estructura que debería retornar el scraper:
  /*
  return [
    {
      numero: 70,
      titulo: "Nueva iniciativa detectada",
      proponente: "Dip. Juan Pérez",
      partido: "Morena",
      fecha: Timestamp.now(),
      legislatura: "LXVI",
      camara: "diputados",
      descripcion: "Descripción de la iniciativa",
      status: "en_comisiones",
      tipo: "reforma_otra",
      tematicas: ["ia"],
      urlGaceta: "http://...",
      eventos: [...]
    }
  ];
  */
  
  return [];
}

/**
 * Monitorear cambios en iniciativas existentes
 */
async function monitorearCambios(): Promise<InitiativeChange[]> {
  console.log('📡 Monitoreando cambios en iniciativas existentes...');
  
  try {
    const db = getAdminDb();
    // Obtener todas las iniciativas activas
    const snapshot = await db
      .collection('iniciativas')
      .where('status', '==', 'en_comisiones')
      .get();
    const iniciativasActivas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IniciativaLegislativa[];
    
    console.log(`   Encontradas ${iniciativasActivas.length} iniciativas activas`);
    
    const cambios: InitiativeChange[] = [];

    // TODO: Verificar cada URL oficial y poblar cambios sólo con evidencia.
    // Mientras el scraper no exista, la consulta es estrictamente de lectura y
    // no fabrica actualizaciones.
    
    return cambios;
  } catch (error) {
    console.error('Error monitoreando cambios:', error);
    return [];
  }
}

/**
 * Aplicar cambios detectados a Firestore
 */
async function aplicarCambios(cambios: InitiativeChange[]): Promise<number> {
  let actualizaciones = 0;
  const db = getAdminDb();
  
  for (const { iniciativaId, cambios: cambiosData } of cambios) {
    try {
      const docRef = db.collection('iniciativas').doc(iniciativaId);
      await docRef.update({
        ...cambiosData,
        updatedAt: FieldValue.serverTimestamp()
      });
      actualizaciones++;
      console.log(`✅ Iniciativa ${iniciativaId} actualizada`);
    } catch (error) {
      console.error(`❌ Error actualizando iniciativa ${iniciativaId}:`, error);
    }
  }
  
  return actualizaciones;
}

/**
 * Registrar actividad en log
 */
async function registrarActividad(tipo: string, descripcion: string) {
  try {
    const db = getAdminDb();
    await db.collection('actividad_legislativa').add({
      fecha: FieldValue.serverTimestamp(),
      tipo,
      descripcion
    });
  } catch (error) {
    console.error('Error registrando actividad:', error);
  }
}

/**
 * Función principal del agente
 */
export async function ejecutarAgenteLegislativo(): Promise<DeteccionResult> {
  console.log('🤖 Agente Legislativo iniciado');
  console.log(`   Fecha: ${new Date().toISOString()}`);
  
  const result: DeteccionResult = {
    nuevasIniciativas: 0,
    actualizaciones: 0,
    errores: []
  };
  
  try {
    const db = getAdminDb();
    // 1. Buscar nuevas iniciativas
    const nuevas = await buscarNuevasIniciativas();
    
    for (const iniciativa of nuevas) {
      try {
        await db.collection('iniciativas').add({
          ...iniciativa,
          creadoManualmente: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
        result.nuevasIniciativas++;
        console.log(`✅ Nueva iniciativa agregada: ${iniciativa.titulo}`);
      } catch (error) {
        result.errores.push(`Error agregando iniciativa: ${error}`);
      }
    }
    
    // 2. Monitorear cambios en existentes
    const cambios = await monitorearCambios();
    result.actualizaciones = await aplicarCambios(cambios);
    
    // 3. Registrar actividad
    await registrarActividad(
      'agente_ejecutado',
      `Agente ejecutado: ${result.nuevasIniciativas} nuevas, ${result.actualizaciones} actualizadas`
    );
    
    console.log('✅ Agente Legislativo completado');
    console.log(`   Nuevas: ${result.nuevasIniciativas}`);
    console.log(`   Actualizadas: ${result.actualizaciones}`);
    console.log(`   Errores: ${result.errores.length}`);
    
  } catch (error) {
    result.errores.push(`Error general: ${error}`);
    console.error('❌ Error en agente legislativo:', error);
  }
  
  return result;
}
