import { Timestamp } from 'firebase/firestore';

export type StatusType = 'prometido' | 'en_desarrollo' | 'operando' | 'incumplido' | 'abandonado';

export type FuenteTipo = 'anuncio_original' | 'nota_prensa' | 'declaracion' | 'transparencia' | 'otro';

export interface Fuente {
  url: string;
  titulo: string;
  fecha: Timestamp;
  tipo: FuenteTipo;
  accesible?: boolean | null;
  waybackUrl?: string;
  extracto?: string;
}

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
  fuenteOriginal: string; // Deprecated - usar fuentes[]
  fuentes?: Fuente[]; // Array de fuentes verificables
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

// ============================================
// TIPOS PARA IA Y PROPIEDAD INTELECTUAL
// ============================================

// Casos Judiciales
export type TemaJudicial = 'derechos_autor' | 'patentes' | 'marcas' | 'datos_personales' | 'responsabilidad_ia' | 'deepfakes' | 'otro';
export type EstadoCaso = 'en_proceso' | 'resuelto' | 'apelacion' | 'archivado';
export type ImpactoNivel = 'alto' | 'medio' | 'bajo';

export interface PartesJudiciales {
  demandante: string;
  demandado: string;
  terceros?: string[];
}

export interface CasoJudicial {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  tribunal: string;
  expediente?: string;
  partes: PartesJudiciales;
  tema: TemaJudicial;
  estado: EstadoCaso;
  resolucion?: string;
  impacto: ImpactoNivel;
  fuentes: Fuente[];
  timeline: string[]; // IDs de EventoTimeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Criterios Jurídicos
export type AutoridadJuridica = 'SCJN' | 'Tribunales_Colegiados' | 'IMPI' | 'INAI' | 'TFJA' | 'Otro';

export interface CriterioJuridico {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  autoridad: AutoridadJuridica;
  tesis?: string;
  numeroTesis?: string;
  aplicabilidad: string;
  impacto: ImpactoNivel;
  fuentes: Fuente[];
  casosRelacionados?: string[]; // IDs de CasoJudicial
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Propuestas Legislativas
export type CamaraLegislativa = 'Diputados' | 'Senadores';
export type EstadoPropuesta = 'presentada' | 'en_comision' | 'aprobada_camara' | 'aprobada' | 'rechazada' | 'archivada' | 'retirada';
export type TemaLegislativo = 'derechos_autor' | 'privacidad' | 'regulacion_ia' | 'proteccion_datos' | 'deepfakes' | 'etica_ia' | 'otro';

export interface PropuestaLegislativa {
  id: string;
  titulo: string;
  descripcion: string;
  fechaPresentacion: Timestamp;
  autor: string;
  camara: CamaraLegislativa;
  comision: string;
  estado: EstadoPropuesta;
  temas: TemaLegislativo[];
  impacto: ImpactoNivel;
  fuentes: Fuente[];
  timeline: string[]; // IDs de EventoTimeline
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Problemáticas Identificadas
export type CategoriaProblematica = 'voz' | 'deepfake' | 'originalidad' | 'privacidad' | 'desinformacion' | 'sesgo' | 'otro';
export type EstadoProblematica = 'documentado' | 'en_investigacion' | 'resuelto' | 'sin_resolver' | 'escalado';

export interface Problematica {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: Timestamp;
  categoria: CategoriaProblematica;
  afectados: string[];
  impacto: ImpactoNivel;
  estado: EstadoProblematica;
  accionesTomadas?: string;
  fuentes: Fuente[];
  timeline: string[]; // IDs de EventoTimeline
  casosRelacionados?: string[]; // IDs de CasoJudicial
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipos para respuestas de agentes de IA y PI
export interface AgenteCasosJudicialesResponse {
  nuevos_casos: {
    titulo: string;
    descripcion: string;
    fecha: string;
    tribunal: string;
    expediente?: string;
    demandante: string;
    demandado: string;
    tema: TemaJudicial;
    estado: EstadoCaso;
    impacto: ImpactoNivel;
    fuentes: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  }[];
}

export interface AgenteCriteriosResponse {
  nuevos_criterios: {
    titulo: string;
    descripcion: string;
    fecha: string;
    autoridad: AutoridadJuridica;
    tesis?: string;
    numeroTesis?: string;
    aplicabilidad: string;
    impacto: ImpactoNivel;
    fuentes: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  }[];
}

export interface AgentePropuestasResponse {
  nuevas_propuestas: {
    titulo: string;
    descripcion: string;
    fechaPresentacion: string;
    autor: string;
    camara: CamaraLegislativa;
    comision: string;
    estado: EstadoPropuesta;
    temas: TemaLegislativo[];
    impacto: ImpactoNivel;
    fuentes: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  }[];
}

export interface AgenteProblematicasResponse {
  nuevas_problematicas: {
    titulo: string;
    descripcion: string;
    fecha: string;
    categoria: CategoriaProblematica;
    afectados: string[];
    impacto: ImpactoNivel;
    estado: EstadoProblematica;
    fuentes: {
      tipo: TipoFuente;
      url: string;
      titulo: string;
      medio?: string;
    }[];
  }[];
}

// Tipos extendidos de AgenteTipo y ActividadTipo
export type AgenteTipoExtendido = AgenteTipo | 'casos_judiciales' | 'criterios_juridicos' | 'propuestas_legislativas' | 'problematicas';
export type ActividadTipoExtendido = ActividadTipo | 'nuevo_caso' | 'nuevo_criterio' | 'nueva_propuesta' | 'nueva_problematica' | 'actualizacion_caso' | 'actualizacion_propuesta' | 'actualizacion_problematica';
