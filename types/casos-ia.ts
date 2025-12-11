// Tipos para Casos y Criterios de IA

export interface Documento {
  titulo: string;
  tipo: 'sentencia' | 'demanda' | 'tesis' | 'amparo' | 'otro';
  url: string;
}

export interface Fuente {
  titulo: string;
  url: string;
  medio?: string;
  fecha?: string;
}

export interface Instancia {
  orden: number;
  tribunal: string;
  ubicacion: string;
  expediente: string;
  tipo: string; // "Amparo Indirecto", "Recurso de Revisión", etc.
  fechaIngreso: string;
  fechaResolucion?: string;
  estado: 'en_proceso' | 'resuelto';
  sentido?: string; // "Niega amparo", "Concede", "Revoca", etc.
  resumen?: string;
  ministroPonente?: string;
  votoParticular?: string;
  generoCriterio?: boolean;
  documentos?: Documento[];
}

export interface FundamentoLegal {
  articulo: string;
  ley: string;
  contenido: string;
}

export interface Criterio {
  tiene: boolean;
  tipo: 'tesis_aislada' | 'jurisprudencia';
  clave?: string;
  registro: string;
  epoca: string;
  instanciaEmisora: string;
  materia: string;
  rubro: string;
  texto: string;
  
  // Datos de publicación
  fechaResolucion?: string;
  fechaPublicacion?: string;
  votacion?: string;
  magistradoPonente?: string;
  secretario?: string;
  expedienteOrigen?: string;
  publicacion?: string;
  
  // Fundamentos
  fundamentosLegales?: FundamentoLegal[];
  definicionesJuridicas?: Record<string, string>;
  razonamientoJuridico?: {
    premisaMayor: string;
    premisaMenor: string;
    conclusion: string;
  };
  
  // Interpretación
  reglasPrincipales: string[];
  alcance: string;
  elementosDistintivos?: Record<string, string>;
  
  // Impacto
  relevancia: string;
  casosAplicables: string | string[];
  implicaciones: string | {
    juridicas?: string[];
    practicas?: string[];
    futuras?: string[];
  };
  
  // Contexto
  precedenteEstablecido?: string;
  confirmacionPosterior?: {
    tribunal: string;
    expediente: string;
    sentido: string;
  };
}

export type TemaIA = 
  | 'jurimetria'
  | 'deepfakes'
  | 'algoritmos'
  | 'propiedad_intelectual'
  | 'discriminacion'
  | 'privacidad'
  | 'evidencia_ia'
  | 'otro';

export type MateriaCaso = 
  | 'amparo'
  | 'penal'
  | 'civil'
  | 'administrativo'
  | 'laboral'
  | 'familiar'
  | 'mercantil';

export interface CasoIA {
  id: string;
  
  // Identificación
  nombre: string;
  expedienteActual: string;
  tribunalActual: string;
  estado: 'en_proceso' | 'resuelto';
  
  // Clasificación
  materia: MateriaCaso;
  temaIA: TemaIA;
  subtema?: string;
  
  // Partes
  partes: {
    actor: string;
    demandado: string;
    terceros?: string;
  };
  
  // Contexto del caso
  resumen: string;
  hechos?: string;
  elementoIA: string; // Cómo se involucra la IA
  
  // Trayectoria procesal
  trayectoria: Instancia[];
  
  // Los criterios generados (lo más importante)
  criterio?: Criterio;
  criterios?: Criterio[];
  
  // Documentos y fuentes
  documentos: Documento[];
  fuentes: Fuente[];
  
  // Meta
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// Labels para UI
export const TEMAS_IA: Record<TemaIA, { label: string; emoji: string; color: string }> = {
  jurimetria: { label: 'Jurimetría', emoji: '📊', color: 'purple' },
  deepfakes: { label: 'Deepfakes', emoji: '🎭', color: 'red' },
  algoritmos: { label: 'Algoritmos', emoji: '🤖', color: 'blue' },
  propiedad_intelectual: { label: 'Propiedad Intelectual', emoji: '©️', color: 'indigo' },
  discriminacion: { label: 'Discriminación Algorítmica', emoji: '⚖️', color: 'orange' },
  privacidad: { label: 'Privacidad', emoji: '🔒', color: 'cyan' },
  evidencia_ia: { label: 'Evidencia con IA', emoji: '🔍', color: 'teal' },
  otro: { label: 'Otro', emoji: '📁', color: 'gray' },
};

export const MATERIAS: Record<MateriaCaso, string> = {
  amparo: 'Amparo',
  penal: 'Penal',
  civil: 'Civil',
  administrativo: 'Administrativo',
  laboral: 'Laboral',
  familiar: 'Familiar',
  mercantil: 'Mercantil',
};

export const TIPOS_CRITERIO = {
  tesis_aislada: { label: 'Tesis Aislada', emoji: '📜' },
  jurisprudencia: { label: 'Jurisprudencia', emoji: '⚖️' },
};
