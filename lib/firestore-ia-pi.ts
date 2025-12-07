import { getAdminDb } from './firebase-admin';
import type { 
  CasoJudicial, 
  CriterioJuridico, 
  PropuestaLegislativa, 
  Problematica 
} from '@/types';

/**
 * Funciones de Firestore para categorías de IA y Propiedad Intelectual
 */

// ============= CASOS JUDICIALES =============

export async function crearCasoJudicial(caso: Omit<CasoJudicial, 'id'>) {
  const db = getAdminDb();
  const docRef = await db.collection('casos_judiciales').add({
    ...caso,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function obtenerCasosJudiciales() {
  const db = getAdminDb();
  const snapshot = await db.collection('casos_judiciales')
    .orderBy('fechaPresentacion', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CasoJudicial[];
}

export async function obtenerCasoPorId(id: string) {
  const db = getAdminDb();
  const doc = await db.collection('casos_judiciales').doc(id).get();
  
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data()
  } as CasoJudicial;
}

// ============= CRITERIOS Y PRECEDENTES =============

export async function crearCriterioJuridico(criterio: Omit<CriterioJuridico, 'id'>) {
  const db = getAdminDb();
  const docRef = await db.collection('criterios_precedentes').add({
    ...criterio,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function obtenerCriteriosJuridicos() {
  const db = getAdminDb();
  const snapshot = await db.collection('criterios_precedentes')
    .orderBy('fechaPublicacion', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CriterioJuridico[];
}

export async function obtenerCriterioPorId(id: string) {
  const db = getAdminDb();
  const doc = await db.collection('criterios_precedentes').doc(id).get();
  
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data()
  } as CriterioJuridico;
}

// ============= PROPUESTAS LEGISLATIVAS =============

export async function crearPropuestaLegislativa(propuesta: Omit<PropuestaLegislativa, 'id'>) {
  const db = getAdminDb();
  const docRef = await db.collection('propuestas_legislativas').add({
    ...propuesta,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function obtenerPropuestasLegislativas() {
  const db = getAdminDb();
  const snapshot = await db.collection('propuestas_legislativas')
    .orderBy('fechaPresentacion', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PropuestaLegislativa[];
}

export async function obtenerPropuestaPorId(id: string) {
  const db = getAdminDb();
  const doc = await db.collection('propuestas_legislativas').doc(id).get();
  
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data()
  } as PropuestaLegislativa;
}

// ============= PROBLEMÁTICAS =============

export async function crearProblematica(problematica: Omit<Problematica, 'id'>) {
  const db = getAdminDb();
  const docRef = await db.collection('problematicas_ia').add({
    ...problematica,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function obtenerProblematicas() {
  const db = getAdminDb();
  const snapshot = await db.collection('problematicas_ia')
    .orderBy('fechaIncidente', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Problematica[];
}

export async function obtenerProblematicaPorId(id: string) {
  const db = getAdminDb();
  const doc = await db.collection('problematicas_ia').doc(id).get();
  
  if (!doc.exists) return null;
  
  return {
    id: doc.id,
    ...doc.data()
  } as Problematica;
}

export async function obtenerProblematicasPorCategoria(categoria: string) {
  const db = getAdminDb();
  const snapshot = await db.collection('problematicas_ia')
    .where('categoria', '==', categoria)
    .orderBy('fechaIncidente', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Problematica[];
}

// ============= ESTADÍSTICAS =============

export async function obtenerEstadisticasIAPI() {
  const db = getAdminDb();
  
  const [casos, criterios, propuestas, problematicas] = await Promise.all([
    db.collection('casos_judiciales').count().get(),
    db.collection('criterios_precedentes').count().get(),
    db.collection('propuestas_legislativas').count().get(),
    db.collection('problematicas_ia').count().get()
  ]);
  
  return {
    casos: casos.data().count,
    criterios: criterios.data().count,
    propuestas: propuestas.data().count,
    problematicas: problematicas.data().count,
    total: casos.data().count + criterios.data().count + propuestas.data().count + problematicas.data().count
  };
}
