/**
 * Configuración del Sistema de Agentes
 * =====================================
 * Precios, defaults y constantes para el sistema de agentes.
 */

import type { 
  ClaudeModel, 
  ModelPricing, 
  AgentType, 
  AgentConfig, 
  MasterConfig 
} from '@/types/agents';

// ============================================
// PRECIOS POR MODELO (USD)
// ============================================

export const MODEL_PRICING: Record<ClaudeModel, ModelPricing> = {
  'claude-haiku-4-5': {
    inputPer1M: 1.00,
    outputPer1M: 5.00,
    name: 'Claude Haiku 4.5',
    description: 'Rápido y económico. Ideal para tareas de alto volumen.',
  },
  'claude-sonnet-5': {
    inputPer1M: 2.00,
    outputPer1M: 10.00,
    name: 'Claude Sonnet 5',
    description: 'Equilibrio entre costo y capacidad. Soporta búsqueda web.',
  },
  'claude-opus-5': {
    inputPer1M: 5.00,
    outputPer1M: 25.00,
    name: 'Claude Opus 5',
    description: 'El más capaz. Búsqueda web y razonamiento adaptativo.',
  },
};

// ============================================
// MODELO RECOMENDADO POR TAREA
// ============================================

export const RECOMMENDED_MODELS: Record<AgentType, ClaudeModel> = {
  detection: 'claude-opus-5',      // Búsqueda web + extracción estructurada
  monitoring: 'claude-opus-5',     // Comparación de estado contra fuentes
  legislation: 'claude-opus-5',    // Extracción de datos legislativos
  judicial_cases: 'claude-opus-5', // Búsqueda y clasificación
  criteria: 'claude-opus-5',       // Análisis más complejo
};

// ============================================
// CONFIGURACIÓN POR DEFECTO DE AGENTES
// ============================================

export const DEFAULT_AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'detection',
    name: 'Detección de Anuncios',
    description: 'Busca nuevos anuncios gubernamentales sobre IA',
    enabled: true,
    model: 'claude-opus-5',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
    schedule: '0 10 * * 1', // Lunes 10am
  },
  {
    id: 'monitoring',
    name: 'Monitoreo de Anuncios',
    description: 'Actualiza el estado de anuncios existentes',
    enabled: true,
    model: 'claude-opus-5',
    maxItemsPerRun: 10,
    maxTokensOutput: 1500,
    schedule: '0 9 * * 1,3,5', // Lun, Mié, Vie 9am
  },
  {
    id: 'legislation',
    name: 'Legislación',
    description: 'Detecta nuevas iniciativas de ley sobre IA',
    enabled: false, // Deshabilitado por defecto (no implementado)
    model: 'claude-opus-5',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
  },
  {
    id: 'judicial_cases',
    name: 'Casos Judiciales',
    description: 'Busca casos judiciales relacionados con IA',
    enabled: false,
    model: 'claude-opus-5',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
  },
  {
    id: 'criteria',
    name: 'Criterios Jurídicos',
    description: 'Detecta nuevos criterios y precedentes sobre IA',
    enabled: false,
    model: 'claude-opus-5',
    maxItemsPerRun: 3,
    maxTokensOutput: 3000,
  },
];

// ============================================
// CONFIGURACIÓN MAESTRA POR DEFECTO
// ============================================

export const DEFAULT_MASTER_CONFIG: MasterConfig = {
  enabled: false,              // Apagado por defecto
  mode: 'test',                // Modo test por defecto
  status: 'disabled',
  dailyBudgetUsd: 5.00,        // $5 diarios
  monthlyBudgetUsd: 50.00,     // $50 mensuales
  alertThreshold: 0.8,         // Alertar al 80%
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// ============================================
// LÍMITES DE SEGURIDAD
// ============================================

export const SAFETY_LIMITS = {
  maxCallsPerRun: 20,           // Máximo de llamadas a Claude por ejecución
  maxTokensPerCall: 4000,       // Máximo tokens de salida por llamada
  delayBetweenCallsMs: 1000,    // 1 segundo entre llamadas
  timeoutPerCallMs: 60000,      // 60 segundos timeout
  maxConsecutiveErrors: 3,      // Pausar después de 3 errores seguidos
  pauseAfterErrorsMs: 3600000,  // Pausar 1 hora después de errores
};

// ============================================
// HELPERS
// ============================================

/**
 * Calcula el costo estimado de una llamada a Claude
 */
export function calculateCost(
  model: ClaudeModel, 
  inputTokens: number, 
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPer1M;
  return Math.round((inputCost + outputCost) * 10000) / 10000; // 4 decimales
}

/**
 * Formatea un costo en USD
 */
export function formatCost(costUsd: number): string {
  return `$${costUsd.toFixed(4)}`;
}

/**
 * Formatea tokens con separador de miles
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString('es-MX');
}

/**
 * Obtiene el nombre legible de un agente
 */
export function getAgentName(agentType: AgentType): string {
  const config = DEFAULT_AGENT_CONFIGS.find(a => a.id === agentType);
  return config?.name || agentType;
}

/**
 * Obtiene el nombre legible de un modelo
 */
export function getModelName(model: ClaudeModel): string {
  return MODEL_PRICING[model]?.name || model;
}

/**
 * Verifica si el presupuesto diario está excedido
 */
export function isDailyBudgetExceeded(
  currentCost: number, 
  dailyBudget: number
): boolean {
  return currentCost >= dailyBudget;
}

/**
 * Obtiene el porcentaje de uso del presupuesto
 */
export function getBudgetPercentage(
  currentCost: number, 
  budget: number
): number {
  if (budget <= 0) return 0;
  return Math.round((currentCost / budget) * 100);
}
