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
import { getDeteccionPrompt, getMonitoreoPrompt } from '@/lib/prompts';
import { crearEventoTimeline } from '@/lib/timeline';
import { Timestamp } from 'firebase-admin/firestore';

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

      // Actualizar estado del agente (sin valores undefined)
      const updateData: Record<string, unknown> = {
        lastRunAt: run.completedAt,
        lastRunStatus: run.status,
      };
      if (run.error) {
        updateData.lastRunError = run.error;
      }
      await usageTracker.updateAgentConfig(agentType, updateData);

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
  run: AgentRunResult & { logs?: string[]; rawResponse?: string; promptPreview?: string },
  model: string,
  maxItems: number
): Promise<void> {
  const logs: string[] = [];
  
  // Obtener títulos existentes para evitar duplicados
  logs.push('📋 Obteniendo títulos existentes de anuncios...');
  const existingTitles = await getExistingAnuncioTitles(200).catch(() => []);
  logs.push(`✓ Se encontraron ${existingTitles.length} anuncios existentes para filtrar`);
  
  // Generar el prompt
  const fullPrompt = getDeteccionPrompt(existingTitles);
  logs.push(`📝 Prompt generado (${fullPrompt.length} caracteres)`);
  
  // Guardar preview del prompt
  run.promptPreview = fullPrompt.substring(0, 500) + (fullPrompt.length > 500 ? '...' : '');
  
  // Llamar a Claude
  const webSearchEnabled = model !== 'claude-3-5-haiku-20241022';
  logs.push(`🤖 Llamando a Claude (modelo: ${model}, web_search: ${webSearchEnabled ? 'SÍ' : 'NO'})`);
  logs.push(`⚙️ Modo: ${run.mode}`);
  
  const result = await trackedClaudeCall({
    agentType: 'detection',
    mode: run.mode,
    model: model as 'claude-3-5-haiku-20241022' | 'claude-sonnet-4-20250514' | 'claude-sonnet-4-5-20250929',
    systemPrompt: 'Eres un analista de políticas públicas de inteligencia artificial en México.',
    userPrompt: fullPrompt,
    maxTokens: 2000,
    enableWebSearch: webSearchEnabled,
  });

  run.apiCalls = 1;
  run.totalTokens = result.usage.totalTokens;
  run.estimatedCostUsd = result.costUsd;
  
  logs.push(`✓ Respuesta recibida en ${result.durationMs}ms`);
  logs.push(`📊 Tokens: ${result.usage.inputTokens} entrada + ${result.usage.outputTokens} salida = ${result.usage.totalTokens} total`);
  logs.push(`💰 Costo estimado: $${result.costUsd.toFixed(4)}`);

  if (!result.success) {
    run.status = 'error';
    run.error = result.error;
    logs.push(`❌ Error: ${result.error}`);
    run.logs = logs;
    return;
  }

  // Guardar respuesta raw para debug
  run.rawResponse = result.text.substring(0, 2000) + (result.text.length > 2000 ? '...' : '');
  logs.push(`📄 Respuesta: ${result.text.length} caracteres`);

  // Parsear respuesta
  try {
    const data = extractJsonObject(result.text);
    const anuncios = data.nuevos_anuncios || [];

    logs.push(`🔍 Anuncios detectados: ${anuncios.length}`);
    
    run.itemsFound = anuncios.length;
    run.results = anuncios.slice(0, maxItems).map((a: Record<string, unknown>, i: number) => {
      const title = (a.titulo as string) || 'Sin título';
      const preview = ((a.descripcion as string) || '').substring(0, 100);
      const sources = extractSourcesFromDeteccionItem(a);
      logs.push(`  ${i + 1}. "${title}" (${sources.length} fuentes)`);
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
      logs.push(`💾 Guardando ${run.results.length} items en cola de revisión...`);
      const saved = await enqueueResults(run, run.results);
      run.itemsSaved = saved;
      logs.push(`✓ ${saved} items guardados en agent_queue`);
    } else if (run.mode === 'preview') {
      logs.push(`👁️ Modo preview: no se guardó en base de datos`);
    } else if (run.mode === 'test') {
      logs.push(`🧪 Modo test: datos simulados, sin llamada real a Claude`);
    }

  } catch (err) {
    run.status = 'error';
    run.error = 'Error parseando respuesta de Claude';
    logs.push(`❌ Error parseando JSON: ${err instanceof Error ? err.message : 'desconocido'}`);
  }
  
  run.logs = logs;
}

async function executeMonitoring(
  run: AgentRunResult,
  model: string,
  maxItems: number
): Promise<void> {
  const db = getAdminDb();

  // Leer anuncios (los más recientes). Si no hay, terminar sin error.
  const snap = await db
    .collection('anuncios')
    .orderBy('updatedAt', 'desc')
    .limit(Math.max(1, maxItems))
    .get();

  if (snap.empty) {
    run.itemsFound = 0;
    run.apiCalls = 0;
    run.totalTokens = 0;
    run.estimatedCostUsd = 0;
    return;
  }

  let calls = 0;
  let totalTokens = 0;
  let totalCost = 0;
  const results: AgentResultItem[] = [];

  for (const doc of snap.docs) {
    const anuncio = doc.data() as any;
    const anuncioId = doc.id;

    const titulo = typeof anuncio.titulo === 'string' ? anuncio.titulo : anuncioId;
    const descripcion = typeof anuncio.descripcion === 'string' ? anuncio.descripcion : '';
    const responsable = typeof anuncio.responsable === 'string' ? anuncio.responsable : '';
    const status = typeof anuncio.status === 'string' ? anuncio.status : 'prometido';

    const fechaAnuncio = anuncio.fechaAnuncio?.toDate
      ? anuncio.fechaAnuncio.toDate().toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const fechaPrometida = anuncio.fechaPrometida?.toDate
      ? anuncio.fechaPrometida.toDate().toISOString().split('T')[0]
      : null;

    const prompt = getMonitoreoPrompt({
      titulo,
      descripcion,
      fechaAnuncio,
      fechaPrometida,
      responsable,
      status,
    });

    const call = await trackedClaudeCall({
      agentType: 'monitoring',
      mode: run.mode,
      model: model as any,
      systemPrompt: 'Eres un analista de seguimiento de políticas públicas de inteligencia artificial en México.',
      userPrompt: prompt,
      maxTokens: 2000,
      enableWebSearch: model !== 'claude-3-5-haiku-20241022',
    });

    calls += 1;
    totalTokens += call.usage.totalTokens;
    totalCost += call.costUsd;

    if (!call.success) {
      results.push({
        id: `mon_${anuncioId}`,
        type: 'anuncio',
        title: titulo,
        preview: `Error: ${call.error || 'falló la llamada a Claude'}`.substring(0, 100),
        data: { anuncioId, error: call.error || 'falló la llamada a Claude' },
      });
      continue;
    }

    let parsed: any;
    try {
      parsed = extractJsonObject(call.text);
    } catch (e) {
      results.push({
        id: `mon_${anuncioId}`,
        type: 'anuncio',
        title: titulo,
        preview: 'Error parseando respuesta de Claude'.substring(0, 100),
        data: { anuncioId, raw: call.text },
      });
      continue;
    }

    const hayActualizacion = !!parsed?.hay_actualizacion;
    if (!hayActualizacion) {
      continue;
    }

    const actualizacion = parsed?.actualizacion;
    const fuenteUrl = actualizacion?.fuente_url;
    const desc = actualizacion?.descripcion;

    const cambioStatus = !!parsed?.cambio_status_recomendado;
    const nuevoStatus = parsed?.nuevo_status;
    const justificacion = parsed?.justificacion;

    const tipoEvento = actualizacion?.tipo_evento || (cambioStatus ? 'cambio_status' : 'actualizacion');
    const impacto = actualizacion?.impacto || 'neutral';
    const citaTextual = actualizacion?.cita_textual;

    const fuentes = extractSourcesFromMonitoringItem(parsed);

    // Resultado para UI (preview/live)
    results.push({
      id: `mon_${anuncioId}`,
      type: 'anuncio',
      title: titulo,
      preview: (typeof desc === 'string' ? desc : 'Actualización detectada').substring(0, 100),
      data: {
        anuncioId,
        hay_actualizacion: true,
        actualizacion,
        cambio_status_recomendado: cambioStatus,
        nuevo_status: nuevoStatus,
        justificacion,
      },
      sources: fuentes,
    });

    // Solo escribir en modo live
    if (run.mode !== 'live') {
      continue;
    }

    // Actualizar anuncio: agregar actualizacion y opcionalmente cambiar status
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    const docLatest = await anuncioRef.get();
    if (!docLatest.exists) continue;
    const dataLatest = docLatest.data() as any;
    const actualizacionesArr = Array.isArray(dataLatest.actualizaciones) ? [...dataLatest.actualizaciones] : [];

    actualizacionesArr.push({
      fecha: Timestamp.now(),
      descripcion: typeof desc === 'string' ? desc : 'Actualización detectada',
      fuente: typeof fuenteUrl === 'string' ? fuenteUrl : (fuentes[0] || ''),
      cambioStatus,
      statusAnterior: cambioStatus ? (dataLatest.status || status) : undefined,
      statusNuevo: cambioStatus ? (typeof nuevoStatus === 'string' ? nuevoStatus : undefined) : undefined,
    });

    const updateData: Record<string, unknown> = {
      actualizaciones: actualizacionesArr,
      updatedAt: Timestamp.now(),
    };

    if (cambioStatus && typeof nuevoStatus === 'string' && nuevoStatus.length > 0) {
      updateData.status = nuevoStatus;
    }

    await anuncioRef.update(updateData);

    // Crear evento de timeline (best-effort)
    try {
      const fuentesTimeline = buildTimelineSourcesFromMonitoring(actualizacion);
      await crearEventoTimeline({
        anuncioId,
        fecha: new Date(),
        tipo: tipoEvento,
        titulo: cambioStatus ? `Cambio de status: ${nuevoStatus || ''}`.trim() : 'Actualización detectada',
        descripcion: typeof desc === 'string' ? desc : 'Actualización detectada',
        fuentes: fuentesTimeline,
        citaTextual: typeof citaTextual === 'string' ? citaTextual : undefined,
        responsable,
        impacto,
      } as any);
    } catch {
      // No tumbar la ejecución si el timeline falla
    }

    // Registrar actividad (best-effort)
    try {
      await db.collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: cambioStatus ? 'cambio_status' : 'actualizacion',
        anuncioId,
        anuncioTitulo: titulo,
        descripcion: cambioStatus
          ? `Status cambió a "${nuevoStatus || ''}". ${typeof justificacion === 'string' ? justificacion : ''}`.trim()
          : (typeof desc === 'string' ? desc : 'Actualización detectada'),
      });
    } catch {
      // noop
    }
  }

  run.apiCalls = calls;
  run.totalTokens = totalTokens;
  run.estimatedCostUsd = totalCost;
  run.results = results;
  run.itemsFound = results.length;

  if (run.mode === 'live') {
    run.itemsSaved = results.length;
  }
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

function extractSourcesFromMonitoringItem(parsed: Record<string, unknown>): string[] {
  const sources = new Set<string>();
  const actualizacion = (parsed as any)?.actualizacion;
  const fuenteUrl = actualizacion?.fuente_url;
  if (typeof fuenteUrl === 'string' && fuenteUrl.trim()) sources.add(fuenteUrl.trim());

  const adicionales = actualizacion?.fuentes_adicionales;
  if (Array.isArray(adicionales)) {
    for (const f of adicionales) {
      const url = (f as any)?.url;
      if (typeof url === 'string' && url.trim()) sources.add(url.trim());
    }
  }

  return Array.from(sources);
}

function buildTimelineSourcesFromMonitoring(actualizacion: any): Array<any> {
  const fuentes: Array<any> = [];
  const mainUrl = actualizacion?.fuente_url;
  const mainDesc = actualizacion?.descripcion;
  if (typeof mainUrl === 'string' && mainUrl.trim()) {
    fuentes.push({
      tipo: 'nota_prensa',
      url: mainUrl.trim(),
      titulo: typeof mainDesc === 'string' && mainDesc.trim() ? mainDesc.trim() : 'Fuente',
      medio: null,
      fecha: Timestamp.now(),
      fechaPublicacion: new Date(),
    });
  }

  const adicionales = actualizacion?.fuentes_adicionales;
  if (Array.isArray(adicionales)) {
    for (const f of adicionales) {
      const url = (f as any)?.url;
      const titulo = (f as any)?.titulo;
      const tipo = (f as any)?.tipo;
      const medio = (f as any)?.medio;
      if (typeof url === 'string' && url.trim()) {
        fuentes.push({
          tipo: typeof tipo === 'string' && tipo.length > 0 ? tipo : 'nota_prensa',
          url: url.trim(),
          titulo: typeof titulo === 'string' && titulo.trim() ? titulo.trim() : 'Fuente',
          medio: typeof medio === 'string' ? medio : null,
          fecha: Timestamp.now(),
          fechaPublicacion: new Date(),
        });
      }
    }
  }

  return fuentes;
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
