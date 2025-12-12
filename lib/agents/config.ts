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
  'claude-3-5-haiku-20241022': {
    inputPer1M: 0.80,
    outputPer1M: 4.00,
    name: 'Claude 3.5 Haiku',
    description: 'Rápido y económico. Ideal para tareas de alto volumen.',
  },
  'claude-sonnet-4-20250514': {
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    name: 'Claude Sonnet 4',
    description: 'Equilibrio entre costo y capacidad. Soporta web search.',
  },
  'claude-sonnet-4-5-20250929': {
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    name: 'Claude Sonnet 4.5',
    description: 'Última versión de Sonnet. Mayor precisión.',
  },
};

// ============================================
// MODELO RECOMENDADO POR TAREA
// ============================================

export const RECOMMENDED_MODELS: Record<AgentType, ClaudeModel> = {
  detection: 'claude-3-5-haiku-20241022',      // Alto volumen, tareas simples
  monitoring: 'claude-3-5-haiku-20241022',     // Alto volumen, comparaciones
  legislation: 'claude-3-5-haiku-20241022',    // Extracción de datos
  judicial_cases: 'claude-3-5-haiku-20241022', // Búsqueda y clasificación
  criteria: 'claude-sonnet-4-20250514',        // Análisis más complejo
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
    model: 'claude-3-5-haiku-20241022',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
    schedule: '0 10 * * 1', // Lunes 10am
  },
  {
    id: 'monitoring',
    name: 'Monitoreo de Anuncios',
    description: 'Actualiza el estado de anuncios existentes',
    enabled: true,
    model: 'claude-3-5-haiku-20241022',
    maxItemsPerRun: 10,
    maxTokensOutput: 1500,
    schedule: '0 9 * * 1,3,5', // Lun, Mié, Vie 9am
  },
  {
    id: 'legislation',
    name: 'Legislación',
    description: 'Detecta nuevas iniciativas de ley sobre IA',
    enabled: false, // Deshabilitado por defecto (no implementado)
    model: 'claude-3-5-haiku-20241022',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
  },
  {
    id: 'judicial_cases',
    name: 'Casos Judiciales',
    description: 'Busca casos judiciales relacionados con IA',
    enabled: false,
    model: 'claude-3-5-haiku-20241022',
    maxItemsPerRun: 5,
    maxTokensOutput: 2000,
  },
  {
    id: 'criteria',
    name: 'Criterios Jurídicos',
    description: 'Detecta nuevos criterios y precedentes sobre IA',
    enabled: false,
    model: 'claude-sonnet-4-20250514', // Más complejo, usa Sonnet
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
