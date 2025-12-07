import { Timestamp } from 'firebase/firestore';

export type StatusType = 'prometido' | 'en_desarrollo' | 'operando' | 'incumplido' | 'abandonado';

export interface Actualizacion {
  fecha: Timestamp;
  descripcion: string;
  fuente: string;
  cambioStatus: boolean;
  statusAnterior?: string;
  statusNuevo?: string;
}

export interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  fechaAnuncio: Timestamp;
  fechaPrometida: Timestamp | null;
  responsable: string;
  dependencia: string;
  fuenteOriginal: string;
  citaPromesa: string;
  status: StatusType;
  actualizaciones: Actualizacion[];
  creadoManualmente: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ActividadTipo = 'nuevo_anuncio' | 'cambio_status' | 'actualizacion' | 'agente_ejecutado' | 'anuncio_manual';

export interface ActividadLog {
  id: string;
  fecha: Timestamp;
  tipo: ActividadTipo;
  anuncioId?: string;
  anuncioTitulo?: string;
  descripcion: string;
}

export type AgenteTipo = 'deteccion' | 'monitoreo';
export type TriggerTipo = 'cron' | 'manual';

export interface AgenteLog {
  id: string;
  tipo: AgenteTipo;
  fecha: Timestamp;
  duracionMs: number;
  anunciosEncontrados: number;
  actualizacionesDetectadas: number;
  errores: string[];
  rawResponse: string;
  trigger: TriggerTipo;
}

// Tipos para respuestas de agentes
export interface DeteccionResponse {
  nuevos_anuncios: {
    titulo: string;
    descripcion: string;
    fecha_anuncio: string;
    fecha_prometida: string | null;
    responsable: string;
    dependencia: string;
    fuente_url: string;
    cita_promesa: string;
  }[];
}

export interface MonitoreoResponse {
  hay_actualizacion: boolean;
  actualizacion?: {
    descripcion: string;
    fuente_url: string;
  };
  cambio_status_recomendado: boolean;
  nuevo_status?: StatusType;
  justificacion?: string;
}

// Tipos para Timeline Interactivo
export type TipoEvento = 'anuncio_inicial' | 'actualizacion' | 'cambio_status' | 'cumplimiento' | 'incumplimiento' | 'retraso' | 'progreso';
export type ImpactoEvento = 'positivo' | 'neutral' | 'negativo';
export type TipoFuente = 'nota_prensa' | 'comunicado_oficial' | 'video' | 'documento' | 'tweet' | 'gaceta_oficial' | 'otro';

export interface Fuente {
  id: string;
  tipo: TipoFuente;
  url: string;
  titulo: string;
  medio?: string;
  fechaPublicacion: Timestamp;
  archivoUrl?: string; // Para preservar contenido
  descripcion?: string;
}

export interface EventoTimeline {
  id: string;
  anuncioId: string;
  fecha: Timestamp;
  tipo: TipoEvento;
  titulo: string;
  descripcion: string;
  fuentes: Fuente[];
  citaTextual?: string;
  responsable?: string;
  impacto: ImpactoEvento;
  createdAt: Timestamp;
}

// Tipos actualizados para respuestas de agentes con fuentes
export interface DeteccionResponseConFuentes {
  nuevos_anuncios: {
    titulo: string;
    descripcion: string;
    fecha_anuncio: string;
    fecha_prometida: string | null;
    responsable: string;
    dependencia: string;
    fuente_url: string;
    cita_promesa: string;
    fuentes_adicionales?: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  }[];
}

export interface MonitoreoResponseConFuentes {
  hay_actualizacion: boolean;
  actualizacion?: {
    descripcion: string;
    fuente_url: string;
    tipo_evento: TipoEvento;
    impacto: ImpactoEvento;
    cita_textual?: string;
    fuentes_adicionales?: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  };
  cambio_status_recomendado: boolean;
  nuevo_status?: StatusType;
  justificacion?: string;
}
