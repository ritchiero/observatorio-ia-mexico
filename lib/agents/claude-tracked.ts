/**
 * Wrapper de Claude con Tracking
 * ===============================
 * Encapsula todas las llamadas a Claude para:
 * - Tracking de tokens y costos
 * - Soporte de modos (test/preview/live)
 * - Límites y validaciones
 * - Logging de cada llamada
 */

import Anthropic from '@anthropic-ai/sdk';
import type { 
  ClaudeModel, 
  ExecutionMode, 
  AgentType,
  TokenUsage,
  ApiCallLog 
} from '@/types/agents';
import { 
  calculateCost, 
  SAFETY_LIMITS,
  MODEL_PRICING 
} from './config';
import { usageTracker } from './usage-tracker';

// ============================================
// CONFIGURACIÓN
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// ============================================
// TIPOS
// ============================================

export interface TrackedCallOptions {
  agentType: AgentType;
  mode: ExecutionMode;
  model?: ClaudeModel;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  enableWebSearch?: boolean;
  testResponse?: string;  // Respuesta mock para modo test
}

export interface TrackedCallResult {
  success: boolean;
  text: string;
  usage: TokenUsage;
  costUsd: number;
  durationMs: number;
  model: ClaudeModel;
  mode: ExecutionMode;
  callId: string;
  error?: string;
}

// ============================================
// RESPUESTAS MOCK PARA TESTING
// ============================================

const MOCK_RESPONSES: Record<AgentType, string> = {
  detection: JSON.stringify({
    nuevos_anuncios: [
      {
        titulo: '[TEST] Anuncio de Prueba',
        descripcion: 'Este es un anuncio generado en modo test',
        fecha_deteccion: new Date().toISOString().split('T')[0],
        fuentes: ['https://ejemplo.com/test'],
        institucion: 'Institución de Prueba',
        relevancia: 'alta'
      }
    ],
    resumen: 'Resumen de prueba generado en modo test'
  }),
  monitoring: JSON.stringify({
    actualizaciones: [
      {
        id: 'test-1',
        estado_anterior: 'sin_cambios',
        estado_nuevo: 'en_proceso',
        cambios_detectados: ['Actualización de prueba'],
        fuentes_nuevas: []
      }
    ]
  }),
  legislation: JSON.stringify({
    iniciativas: [
      {
        titulo: '[TEST] Iniciativa de Prueba',
        estado: 'propuesta',
        camara: 'diputados',
        fecha: new Date().toISOString().split('T')[0]
      }
    ]
  }),
  judicial_cases: JSON.stringify({
    casos: [
      {
        titulo: '[TEST] Caso de Prueba',
        tipo: 'amparo',
        estado: 'pendiente'
      }
    ]
  }),
  criteria: JSON.stringify({
    criterios: [
      {
        titulo: '[TEST] Criterio de Prueba',
        tipo: 'jurisprudencia'
      }
    ]
  }),
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Ejecuta una llamada a Claude con tracking completo
 */
export async function trackedClaudeCall(
  options: TrackedCallOptions
): Promise<TrackedCallResult> {
  const {
    agentType,
    mode,
    model = 'claude-3-5-haiku-20241022',
    systemPrompt,
    userPrompt,
    maxTokens = 2000,
    enableWebSearch = false,
    testResponse,
  } = options;

  const startTime = Date.now();
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Validar límites
  if (maxTokens > SAFETY_LIMITS.maxTokensPerCall) {
    return {
      success: false,
      text: '',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      costUsd: 0,
      durationMs: 0,
      model,
      mode,
      callId,
      error: `maxTokens (${maxTokens}) excede el límite de seguridad (${SAFETY_LIMITS.maxTokensPerCall})`,
    };
  }

  // Modo TEST: No llama a Claude, usa mock
  if (mode === 'test') {
    const mockText = testResponse || MOCK_RESPONSES[agentType] || '{"test": true}';
    const mockUsage: TokenUsage = {
      inputTokens: Math.round(userPrompt.length / 4),  // Estimación
      outputTokens: Math.round(mockText.length / 4),
      totalTokens: 0,
    };
    mockUsage.totalTokens = mockUsage.inputTokens + mockUsage.outputTokens;

    const result: TrackedCallResult = {
      success: true,
      text: mockText,
      usage: mockUsage,
      costUsd: 0, // Modo test no tiene costo
      durationMs: 50, // Simulado
      model,
      mode,
      callId,
    };

    // Loguear incluso en modo test (con costo 0)
    await logCall(result, agentType, systemPrompt.substring(0, 200));
    
    return result;
  }

  // Modos PREVIEW y LIVE: Llamar a Claude
  try {
    // Preparar tools si web search está habilitado
    const tools: Anthropic.Messages.Tool[] = enableWebSearch ? [
      {
        type: 'web_search_20250305' as unknown as 'custom',
        name: 'web_search',
      } as unknown as Anthropic.Messages.Tool
    ] : [];

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      ...(tools.length > 0 && { tools }),
    });

    // Extraer texto de la respuesta
    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      }
    }

    // Extraer usage
    const usage: TokenUsage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    const costUsd = calculateCost(model, usage.inputTokens, usage.outputTokens);
    const durationMs = Date.now() - startTime;

    const result: TrackedCallResult = {
      success: true,
      text,
      usage,
      costUsd,
      durationMs,
      model,
      mode,
      callId,
    };

    // Loguear la llamada
    await logCall(result, agentType, systemPrompt.substring(0, 200));

    return result;

  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    const result: TrackedCallResult = {
      success: false,
      text: '',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      costUsd: 0,
      durationMs,
      model,
      mode,
      callId,
      error: errorMessage,
    };

    // Loguear el error
    await logCall(result, agentType, systemPrompt.substring(0, 200));

    return result;
  }
}

// ============================================
// LOGGING
// ============================================

async function logCall(
  result: TrackedCallResult,
  agentType: AgentType,
  promptPreview: string
): Promise<void> {
  const log: ApiCallLog = {
    id: result.callId,
    timestamp: new Date().toISOString(),
    agentType,
    model: result.model,
    mode: result.mode,
    usage: result.usage,
    estimatedCostUsd: result.costUsd,
    durationMs: result.durationMs,
    success: result.success,
    error: result.error,
    promptPreview,
  };

  try {
    await usageTracker.logApiCall(log);
  } catch (error) {
    console.error('[claude-tracked] Error logging call:', error);
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Estima el costo de una llamada antes de ejecutarla
 */
export function estimateCallCost(
  model: ClaudeModel,
  promptLength: number,
  estimatedOutputTokens: number
): number {
  // Estimación: ~4 caracteres por token
  const inputTokens = Math.ceil(promptLength / 4);
  return calculateCost(model, inputTokens, estimatedOutputTokens);
}

/**
 * Verifica si un modelo soporta web search
 */
export function modelSupportsWebSearch(model: ClaudeModel): boolean {
  // Haiku no soporta web search
  return model !== 'claude-3-5-haiku-20241022';
}

/**
 * Obtiene información del modelo
 */
export function getModelInfo(model: ClaudeModel) {
  return MODEL_PRICING[model];
}
