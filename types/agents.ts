/**
 * Tipos para el Sistema de Agentes
 * ================================
 * Define la estructura de datos para:
 * - Configuración de agentes
 * - Tracking de uso y costos
 * - Cola de revisión de contenido
 */

// ============================================
// MODELOS Y PRECIOS
// ============================================

export type ClaudeModel = 
  | 'claude-3-5-haiku-20241022'
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4-5-20250929';

export interface ModelPricing {
  inputPer1M: number;   // USD por 1M tokens de entrada
  outputPer1M: number;  // USD por 1M tokens de salida
  name: string;
  description: string;
}

// ============================================
// CONFIGURACIÓN DE AGENTES
// ============================================

export type AgentType = 
  | 'detection'      // Detección de nuevos anuncios
  | 'monitoring'     // Monitoreo de anuncios existentes
  | 'legislation'    // Iniciativas legislativas
  | 'judicial_cases' // Casos judiciales
  | 'criteria';      // Criterios jurídicos

export type ExecutionMode = 
  | 'test'     // Mock, no llama a Claude ($0)
  | 'preview'  // Llama a Claude pero no guarda en DB
  | 'live';    // Ejecución real, guarda en cola

export type AgentStatus = 
  | 'idle'      // Sin ejecutar
  | 'running'   // Ejecutándose
  | 'success'   // Última ejecución exitosa
  | 'error';    // Última ejecución con error

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  enabled: boolean;
  model: ClaudeModel;
  maxItemsPerRun: number;
  maxTokensOutput: number;
  schedule?: string;        // Cron expression
  lastRunAt?: string;       // ISO timestamp
  lastRunStatus?: AgentStatus;
  lastRunError?: string;
}

export interface MasterConfig {
  enabled: boolean;                         // Switch principal ON/OFF
  mode: ExecutionMode;                      // Modo de ejecución
  status: 'active' | 'paused' | 'disabled';
  pauseReason?: string;
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  alertThreshold: number;                   // 0-1, ej: 0.8 = 80%
  updatedAt: string;
  updatedBy: string;
}

// ============================================
// TRACKING DE USO
// ============================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ApiCallLog {
  id: string;
  timestamp: string;
  agentType: AgentType;
  model: ClaudeModel;
  mode: ExecutionMode;
  usage: TokenUsage;
  estimatedCostUsd: number;
  durationMs: number;
  success: boolean;
  error?: string;
  promptPreview?: string;    // Primeros 200 chars del prompt
}

export interface DailyUsage {
  date: string;              // YYYY-MM-DD
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  byAgent: Record<AgentType, {
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
  byModel: Record<ClaudeModel, {
    calls: number;
    tokens: number;
    costUsd: number;
  }>;
}

// ============================================
// EJECUCIONES DE AGENTES
// ============================================

export interface AgentRunResult {
  runId: string;
  agentType: AgentType;
  mode: ExecutionMode;
  trigger: 'manual' | 'cron';
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'success' | 'error';
  
  // Métricas
  itemsFound: number;
  itemsSaved: number;
  apiCalls: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs?: number;
  
  // Errores
  error?: string;
  errors?: string[];
  
  // Resultados (para preview)
  results?: AgentResultItem[];
}

export interface AgentResultItem {
  id: string;
  type: 'anuncio' | 'iniciativa' | 'caso';
  title: string;
  preview: string;           // Resumen corto
  data: Record<string, unknown>;  // Datos completos
  confidence?: number;       // 0-1, qué tan seguro está el agente
  sources?: string[];        // URLs de fuentes
}

// ============================================
// COLA DE REVISIÓN
// ============================================

export type QueueItemStatus = 
  | 'pending'   // Pendiente de revisión
  | 'approved'  // Aprobado para publicar
  | 'rejected'  // Rechazado
  | 'published'; // Ya publicado

export interface QueueItem {
  id: string;
  type: 'anuncio' | 'iniciativa' | 'caso';
  status: QueueItemStatus;
  
  // Contenido detectado
  data: Record<string, unknown>;
  title: string;
  preview: string;
  
  // Metadatos de detección
  detectedAt: string;
  detectedBy: AgentType;
  runId: string;
  confidence?: number;
  sources?: string[];
  
  // Revisión
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  editedData?: Record<string, unknown>;  // Si el admin editó antes de aprobar
  
  // Publicación
  publishedAt?: string;
  publishedId?: string;    // ID del documento publicado
}

// ============================================
// RESPUESTAS DE API
// ============================================

export interface AgentConfigResponse {
  master: MasterConfig;
  agents: AgentConfig[];
}

export interface AgentUsageResponse {
  today: DailyUsage;
  recentCalls: ApiCallLog[];
  budgetStatus: {
    dailyUsed: number;
    dailyLimit: number;
    dailyPercentage: number;
    monthlyUsed: number;
    monthlyLimit: number;
    monthlyPercentage: number;
  };
}

export interface ExecuteAgentRequest {
  agentType: AgentType;
  mode: ExecutionMode;
  model?: ClaudeModel;
  maxItems?: number;
}

export interface ExecuteAgentResponse {
  success: boolean;
  run: AgentRunResult;
  budgetWarning?: string;
}
