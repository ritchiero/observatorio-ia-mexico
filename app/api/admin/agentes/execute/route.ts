/**
 * API: Ejecutar Agente
 * =====================
 * POST: Ejecutar un agente manualmente
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { usageTracker } from '@/lib/agents/usage-tracker';
import { trackedClaudeCall } from '@/lib/agents/claude-tracked';
import { getAdminDb } from '@/lib/firebase-admin';
import type { 
  ExecuteAgentRequest, 
  ExecuteAgentResponse, 
  AgentRunResult,
  AgentResultItem 
} from '@/types/agents';
import { getDeteccionPrompt } from '@/lib/prompts';

// ============================================
// POST - Ejecutar agente
// ============================================

export const maxDuration = 120; // 2 minutos max

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const body = await request.json() as ExecuteAgentRequest;
    const { agentType, mode, model, maxItems } = body;

    // Verificar permisos de ejecución
    const canExecute = await usageTracker.canExecute();
    if (!canExecute.allowed && mode === 'live') {
      return NextResponse.json({
        success: false,
        error: canExecute.reason,
      }, { status: 403 });
    }

    // Obtener configuración del agente
    const configs = await usageTracker.getAgentConfigs();
    const agentConfig = configs.find(a => a.id === agentType);

    if (!agentConfig) {
      return NextResponse.json({
        success: false,
        error: `Agente "${agentType}" no encontrado`,
      }, { status: 404 });
    }

    if (!agentConfig.enabled) {
      return NextResponse.json({
        success: false,
        error: `Agente "${agentType}" está inactivo`,
      }, { status: 403 });
    }

    // Iniciar ejecución
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startedAt = new Date().toISOString();

    const run: AgentRunResult = {
      runId,
      agentType,
      mode,
      trigger: 'manual',
      startedAt,
      status: 'running',
      itemsFound: 0,
      itemsSaved: 0,
      apiCalls: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      results: [],
    };

    try {
      // Ejecutar según tipo de agente
      switch (agentType) {
        case 'detection':
          await executeDetection(run, model || agentConfig.model, maxItems || agentConfig.maxItemsPerRun);
          break;
        case 'monitoring':
          await executeMonitoring(run, model || agentConfig.model, maxItems || agentConfig.maxItemsPerRun);
          break;
        default:
          run.status = 'error';
          run.error = `Agente "${agentType}" no implementado aún`;
      }

      run.completedAt = new Date().toISOString();
      run.durationMs = Date.now() - new Date(startedAt).getTime();

      if (run.status === 'running') {
        run.status = 'success';
      }

      // Actualizar estado del agente
      await usageTracker.updateAgentConfig(agentType, {
        lastRunAt: run.completedAt,
        lastRunStatus: run.status,
        lastRunError: run.error,
      });

      const response: ExecuteAgentResponse = {
        success: run.status === 'success',
        run,
      };

      // Warning si cerca del límite
      const usage = await usageTracker.getTodayUsage();
      const master = await usageTracker.getMasterConfig();
      if (usage.estimatedCostUsd / master.dailyBudgetUsd > master.alertThreshold) {
        response.budgetWarning = `Uso diario al ${Math.round((usage.estimatedCostUsd / master.dailyBudgetUsd) * 100)}%`;
      }

      return NextResponse.json(response);

    } catch (error) {
      run.status = 'error';
      run.error = error instanceof Error ? error.message : 'Error desconocido';
      run.completedAt = new Date().toISOString();
      run.durationMs = Date.now() - new Date(startedAt).getTime();

      return NextResponse.json({
        success: false,
        run,
      });
    }

  } catch (error) {
    console.error('[api/agentes/execute] Error:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar agente' },
      { status: 500 }
    );
  }
}

// ============================================
// EJECUCIÓN DE AGENTES
// ============================================

async function executeDetection(
  run: AgentRunResult,
  model: string,
  maxItems: number
): Promise<void> {
  // Generar el prompt con títulos existentes (para evitar duplicados)
  const existingTitles = await getExistingAnuncioTitles(200).catch(() => []);
  const fullPrompt = getDeteccionPrompt(existingTitles);
  
  // Llamar a Claude
  const result = await trackedClaudeCall({
    agentType: 'detection',
    mode: run.mode,
    model: model as 'claude-3-5-haiku-20241022' | 'claude-sonnet-4-20250514' | 'claude-sonnet-4-5-20250929',
    systemPrompt: 'Eres un analista de políticas públicas de inteligencia artificial en México.',
    userPrompt: fullPrompt,
    maxTokens: 2000,
    enableWebSearch: model !== 'claude-3-5-haiku-20241022',
  });

  run.apiCalls = 1;
  run.totalTokens = result.usage.totalTokens;
  run.estimatedCostUsd = result.costUsd;

  if (!result.success) {
    run.status = 'error';
    run.error = result.error;
    return;
  }

  // Parsear respuesta
  try {
    const data = extractJsonObject(result.text);
    const anuncios = data.nuevos_anuncios || [];

    run.itemsFound = anuncios.length;
    run.results = anuncios.slice(0, maxItems).map((a: Record<string, unknown>, i: number) => {
      const title = (a.titulo as string) || 'Sin título';
      const preview = ((a.descripcion as string) || '').substring(0, 100);
      const sources = extractSourcesFromDeteccionItem(a);
      return {
        id: `detect_${i}`,
      type: 'anuncio' as const,
        title,
        preview,
        data: a,
        sources,
      };
    });

    // En modo live, guardar en cola de revisión
    if (run.mode === 'live' && run.results && run.results.length > 0) {
      const saved = await enqueueResults(run, run.results);
      run.itemsSaved = saved;
    }

  } catch {
    run.status = 'error';
    run.error = 'Error parseando respuesta de Claude';
  }
}

async function executeMonitoring(
  run: AgentRunResult,
  model: string,
  maxItems: number
): Promise<void> {
  // Por ahora, solo un mensaje de no implementado
  run.status = 'error';
  run.error = 'El agente de monitoreo requiere acceso a anuncios existentes. Por implementar.';
  
  // En el futuro:
  // 1. Obtener anuncios existentes de Firestore
  // 2. Para cada anuncio (limitado por maxItems), llamar a Claude
  // 3. Acumular tokens y costos
  // 4. Parsear actualizaciones
}

function extractJsonObject(text: string): any {
  // Claude suele cumplir el JSON, pero si incluye texto extra, extraemos el primer bloque JSON.
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No se encontró JSON en la respuesta');
    return JSON.parse(match[0]);
  }
}

function extractSourcesFromDeteccionItem(item: Record<string, unknown>): string[] {
  const sources = new Set<string>();
  const fuenteUrl = item.fuente_url;
  if (typeof fuenteUrl === 'string' && fuenteUrl.trim()) sources.add(fuenteUrl.trim());

  const adicionales = item.fuentes_adicionales;
  if (Array.isArray(adicionales)) {
    for (const f of adicionales) {
      const url = (f as any)?.url;
      if (typeof url === 'string' && url.trim()) sources.add(url.trim());
    }
  }

  // Compatibilidad con el mock anterior (si viniera como `fuentes: string[]`)
  const fuentes = item.fuentes;
  if (Array.isArray(fuentes)) {
    for (const u of fuentes) {
      if (typeof u === 'string' && u.trim()) sources.add(u.trim());
    }
  }

  return Array.from(sources);
}

async function getExistingAnuncioTitles(limit: number): Promise<string[]> {
  const db = getAdminDb();
  const snap = await db.collection('anuncios').select('titulo').limit(limit).get();
  const titles = snap.docs
    .map((d) => d.get('titulo'))
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => t.trim());

  // Deduplicar (por si hay títulos repetidos)
  return Array.from(new Set(titles));
}

async function enqueueResults(run: AgentRunResult, results: AgentResultItem[]): Promise<number> {
  const db = getAdminDb();
  const batch = db.batch();
  const detectedAt = new Date().toISOString();

  let count = 0;
  for (const item of results) {
    const id = `queue_${run.runId}_${count}`;
    const ref = db.collection('agent_queue').doc(id);
    batch.set(ref, {
      id,
      type: item.type,
      status: 'pending',
      data: item.data,
      title: item.title,
      preview: item.preview,
      detectedAt,
      detectedBy: run.agentType,
      runId: run.runId,
      confidence: item.confidence ?? null,
      sources: item.sources ?? [],
    });
    count++;
  }

  if (count > 0) {
    await batch.commit();
  }
  return count;
}
