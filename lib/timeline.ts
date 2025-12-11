import { getAdminDb } from './firebase-admin';
import { EventoTimeline, Fuente, TipoEvento, ImpactoEvento } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Crear un nuevo evento en el timeline de un anuncio
 */
type FuenteInput = Omit<Fuente, 'id' | 'fechaPublicacion'> & { fechaPublicacion: Date | Timestamp };

export async function crearEventoTimeline(params: {
  anuncioId: string;
  fecha: Date;
  tipo: TipoEvento;
  titulo: string;
  descripcion: string;
  fuentes: FuenteInput[];
  citaTextual?: string;
  responsable?: string;
  impacto: ImpactoEvento;
}): Promise<string> {
  const db = getAdminDb();
  
  // Crear fuentes con IDs y convertir Date a Timestamp
  const fuentesConId = params.fuentes.map(fuente => ({
    ...fuente,
    id: db.collection('_temp').doc().id, // Generar ID único
    fechaPublicacion: fuente.fechaPublicacion instanceof Date 
      ? Timestamp.fromDate(fuente.fechaPublicacion)
      : fuente.fechaPublicacion,
  })) as any as Fuente[];

  const eventoRef = db.collection('eventos_timeline').doc();
  const evento = {
    id: eventoRef.id,
    anuncioId: params.anuncioId,
    fecha: Timestamp.fromDate(params.fecha),
    tipo: params.tipo,
    titulo: params.titulo,
    descripcion: params.descripcion,
    fuentes: fuentesConId,
    citaTextual: params.citaTextual,
    responsable: params.responsable,
    impacto: params.impacto,
    createdAt: Timestamp.now(),
  } as any as EventoTimeline;

  await eventoRef.set(evento);
  return eventoRef.id;
}

// Helper para convertir Timestamp a ISO string
function convertTimestamp(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

// Interfaz para eventos devueltos por la API
interface EventoTimelineResponse {
  id: string;
  anuncioId: string;
  fecha: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  impacto: 'positivo' | 'neutral' | 'negativo';
  fuentes: Array<{ url: string; titulo: string; fecha?: string }>;
  citaTextual?: string;
  responsable?: string;
  createdAt?: string;
}

/**
 * Obtener todos los eventos de timeline de un anuncio
 */
export async function obtenerEventosTimeline(anuncioId: string): Promise<EventoTimelineResponse[]> {
  const db = getAdminDb();
  
  const snapshot = await db
    .collection('eventos_timeline')
    .where('anuncioId', '==', anuncioId)
    .orderBy('fecha', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    
    // Convertir fechas de fuentes
    const fuentes = (data.fuentes || []).map((f: Record<string, unknown>) => ({
      url: f.url as string,
      titulo: f.titulo as string,
      fecha: (convertTimestamp(f.fecha) || f.fecha) as string,
    }));

    return {
      id: doc.id,
      anuncioId: data.anuncioId,
      fecha: (convertTimestamp(data.fecha) || data.fecha) as string,
      tipo: data.tipo,
      titulo: data.titulo,
      descripcion: data.descripcion,
      impacto: data.impacto,
      fuentes,
      citaTextual: data.citaTextual,
      responsable: data.responsable,
      createdAt: convertTimestamp(data.createdAt) || undefined,
    };
  });
}

/**
 * Verificar si ya existe un evento similar (para evitar duplicados)
 */
export async function existeEventoSimilar(
  anuncioId: string,
  tipo: TipoEvento,
  fecha: Date,
  margenDias: number = 1
): Promise<boolean> {
  const db = getAdminDb();
  
  const fechaInicio = new Date(fecha);
  fechaInicio.setDate(fechaInicio.getDate() - margenDias);
  
  const fechaFin = new Date(fecha);
  fechaFin.setDate(fechaFin.getDate() + margenDias);

  const snapshot = await db
    .collection('eventos_timeline')
    .where('anuncioId', '==', anuncioId)
    .where('tipo', '==', tipo)
    .where('fecha', '>=', Timestamp.fromDate(fechaInicio))
    .where('fecha', '<=', Timestamp.fromDate(fechaFin))
    .limit(1)
    .get();

  return !snapshot.empty;
}

/**
 * Crear evento inicial cuando se detecta un nuevo anuncio
 */
export async function crearEventoInicial(params: {
  anuncioId: string;
  titulo: string;
  fechaAnuncio: Date;
  responsable: string;
  citaPromesa: string;
  fuenteOriginal: string;
  fuentesAdicionales?: FuenteInput[];
}): Promise<string> {
  // Preparar fuentes
  const fuentes: FuenteInput[] = [
    {
      tipo: 'nota_prensa',
      url: params.fuenteOriginal,
      titulo: `Anuncio de ${params.titulo}`,
      fecha: Timestamp.fromDate(params.fechaAnuncio) as any,
      fechaPublicacion: params.fechaAnuncio,
    },
    ...(params.fuentesAdicionales || []),
  ];

  return crearEventoTimeline({
    anuncioId: params.anuncioId,
    fecha: params.fechaAnuncio,
    tipo: 'anuncio_inicial',
    titulo: `${params.responsable} anuncia: ${params.titulo}`,
    descripcion: `Anuncio oficial del proyecto por parte de ${params.responsable}.`,
    fuentes,
    citaTextual: params.citaPromesa,
    responsable: params.responsable,
    impacto: 'neutral',
  });
}

/**
 * Verificar y crear evento de incumplimiento si pasó la fecha prometida
 */
export async function verificarIncumplimientoFecha(
  anuncioId: string,
  fechaPrometida: Date,
  tituloAnuncio: string
): Promise<string | null> {
  const ahora = new Date();
  
  // Solo verificar si ya pasó la fecha
  if (fechaPrometida >= ahora) {
    return null;
  }

  // Verificar si ya existe evento de incumplimiento
  const yaExiste = await existeEventoSimilar(anuncioId, 'incumplimiento', fechaPrometida, 30);
  if (yaExiste) {
    return null;
  }

  // Crear evento de incumplimiento
  return crearEventoTimeline({
    anuncioId,
    fecha: fechaPrometida,
    tipo: 'incumplimiento',
    titulo: 'Fecha prometida pasó sin cumplimiento',
    descripcion: `La fecha límite para ${tituloAnuncio} pasó sin evidencia de cumplimiento.`,
    fuentes: [],
    impacto: 'negativo',
  });
}

/**
 * Obtener estadísticas del timeline de un anuncio
 */
export async function obtenerEstadisticasTimeline(anuncioId: string) {
  const eventos = await obtenerEventosTimeline(anuncioId);
  
  return {
    totalEventos: eventos.length,
    eventosPositivos: eventos.filter(e => e.impacto === 'positivo').length,
    eventosNegativos: eventos.filter(e => e.impacto === 'negativo').length,
    totalFuentes: eventos.reduce((sum, e) => sum + e.fuentes.length, 0),
    ultimaActualizacion: eventos[0]?.fecha,
  };
}
