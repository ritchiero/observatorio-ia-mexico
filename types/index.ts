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
  medio?: string;
  archivoUrl?: string;
  descripcion?: string;
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
  resumenAgente?: string; // Resumen de hallazgos del agente de monitoreo
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
// TipoFuente es un alias de FuenteTipo para compatibilidad con timeline
export type TipoFuente = FuenteTipo | 'comunicado_oficial' | 'video' | 'documento' | 'tweet' | 'gaceta_oficial';

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

// ============================================
// TIPOS PARA SECCIÓN LEGISLATIVA
// ============================================

export type IniciativaStatus = 
  | 'en_comisiones'           // Activas en legislatura actual
  | 'desechada_termino'       // Desechadas por término de legislatura
  | 'archivada'               // Archivadas explícitamente
  | 'aprobada'                // Aprobadas
  | 'rechazada'               // Rechazadas explícitamente
  | 'turnada'                 // Turnada a comisión
  | 'dictaminada';            // Con dictamen emitido

export type IniciativaTipo =
  | 'ley_federal'             // Ley Federal específica de IA
  | 'reforma_constitucional'  // Reforma constitucional
  | 'reforma_codigo_penal'    // Código Penal Federal
  | 'reforma_educacion'       // Ley General de Educación
  | 'reforma_salud'           // Ley General de Salud
  | 'reforma_derechos_autor'  // Ley Federal del Derecho de Autor
  | 'reforma_violencia_mujer' // Ley de Acceso de Mujeres a Vida Libre de Violencia
  | 'reforma_trabajo'         // Ley Federal del Trabajo
  | 'reforma_telecomunicaciones' // Ley de Telecomunicaciones
  | 'reforma_otra';           // Otras leyes

export type Legislatura = 'LXIV' | 'LXV' | 'LXVI' | 'III_CDMX';

export type Camara = 'diputados' | 'senadores' | 'congreso_cdmx';

export interface EventoLegislativo {
  fecha: Timestamp;
  tipo: 'presentacion' | 'turnado_comision' | 'dictamen' | 'votacion' | 'aprobacion' | 'rechazo' | 'archivado' | 'desechado';
  descripcion: string;
  resultado?: string; // Ej: "Aprobada 350-120"
  fuente?: string;
}

export type CategoriaImpacto = 
  | 'propiedad_intelectual'
  | 'responsabilidad'
  | 'etica'
  | 'ciberseguridad'
  | 'seguridad_nacional'
  | 'justicia'
  | 'educacion'
  | 'salud'
  | 'privacidad'
  | 'derechos_autor'
  | 'violencia_genero'
  | 'transparencia'
  | 'trabajo'
  | 'economia';

export interface IniciativaLegislativa {
  id: string;
  numero: number; // Número de iniciativa en el listado (1-69+)
  titulo: string;
  proponente: string;
  partido: string;
  fecha: Timestamp; // Fecha de presentación
  legislatura: Legislatura;
  camara: Camara;
  descripcion: string;
  status: IniciativaStatus;
  
  // Categorización
  tipo: IniciativaTipo;
  tematicas: string[]; // ['deepfakes', 'educacion', 'salud', etc.]
  temas?: string[]; // Temas detectados automáticamente
  
  // Fuentes
  urlGaceta: string;
  urlPDF?: string;
  fuentes?: Fuente[];
  
  // Timeline de eventos
  eventos: EventoLegislativo[];
  
  // Resumen del agente
  resumenAgente?: string;
  
  // Resumen y análisis
  resumen?: string; // Resumen de qué propone la iniciativa
  categoriasImpacto?: CategoriaImpacto[]; // Categorías afectadas
  
  // Metadata
  creadoManualmente: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActividadLegislativa {
  id: string;
  fecha: Timestamp;
  tipo: 'nueva_iniciativa' | 'cambio_status' | 'dictamen_emitido' | 'votacion' | 'agente_ejecutado';
  iniciativaId?: string;
  iniciativaTitulo?: string;
  descripcion: string;
}
