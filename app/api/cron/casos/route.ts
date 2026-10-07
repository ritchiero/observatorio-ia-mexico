import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { searchWithClaude } from '@/lib/claude';
import { Timestamp } from 'firebase-admin/firestore';
import { requireCron } from '@/lib/auth';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

function getCasosPrompt(nombresExistentes: string[]): string {
    const listaNombres = nombresExistentes.length > 0
      ? nombresExistentes.map(n => `- ${n}`).join('\n')
          : '(No hay casos previos registrados)';

  return `Eres un analista jurídico especializado en casos judiciales relacionados con inteligencia artificial en México.
  Tu tarea es identificar NUEVOS casos judiciales en México donde la inteligencia artificial sea un elemento central, ya sea como objeto de la controversia o como herramienta utilizada en el proceso.

  USA WEB SEARCH para revisar:
  - Semanario Judicial de la Federación (sjf2.scjn.gob.mx)
  - Suprema Corte de Justicia de la Nación (scjn.gob.mx)
  - Tribunales Colegiados de Circuito
  - INAI (resoluciones sobre datos personales e IA)
  - IMPI (propiedad intelectual e IA)
  - Noticias recientes sobre "caso judicial inteligencia artificial México"
  - Noticias recientes sobre "sentencia IA México tribunal"
  - Noticias recientes sobre "amparo inteligencia artificial México"
  - Noticias recientes sobre "deepfake caso judicial México"
  - Noticias recientes sobre "algoritmo discriminación caso México"

  CASOS YA REGISTRADOS (NO incluir):
  ${listaNombres}

  CRITERIOS DE DETECCIÓN:
  - Amparos donde se cuestione el uso de IA por autoridades
  - Casos de deepfakes (pornografía, fraude, suplantación)
  - Casos de propiedad intelectual sobre obras generadas por IA
  - Casos de discriminación algorítmica
  - Casos donde se usó IA como herramienta jurisdiccional (jurimetría)
  - Casos de privacidad y datos personales con IA
  - Casos de evidencia generada o analizada por IA
  - Resoluciones del INAI sobre uso de IA y datos
  - Resoluciones del IMPI sobre IA y propiedad intelectual
  - Tesis aisladas o jurisprudencia sobre IA

  NO INCLUIR:
  - Casos que no tengan relación directa con IA
  - Casos de otros países (solo México)
  - Casos hipotéticos o propuestos

  RESPONDE EN JSON VÁLIDO con este formato exacto:
  {
    "nuevos_casos": [
        {
              "nombre": "Nombre descriptivo del caso",
                    "expedienteActual": "Número de expediente (ej: 123/2025)",
                          "tribunalActual": "Tribunal que conoce el caso",
                                "estado": "en_proceso o resuelto",
                                      "materia": "amparo o penal o civil o administrativo o laboral o familiar o mercantil",
                                            "temaIA": "jurimetria o deepfakes o algoritmos o propiedad_intelectual o discriminacion o privacidad o evidencia_ia o herramientas_jurisdiccionales o delitos_informaticos o etica_judicial o violencia_digital o otro",
                                                  "partes": {
                                                          "actor": "Nombre del actor/demandante",
                                                                  "demandado": "Nombre del demandado"
                                                                        },
                                                                              "resumen": "Resumen detallado del caso y su relevancia para la IA",
                                                                                    "elementoIA": "Descripción de cómo se involucra la IA en el caso",
                                                                                          "trayectoria": [
                                                                                                  {
                                                                                                            "orden": 1,
                                                                                                                      "tribunal": "Tribunal",
                                                                                                                                "ubicacion": "Ciudad, Estado",
                                                                                                                                          "expediente": "Número",
                                                                                                                                                    "tipo": "Amparo Indirecto o Recurso de Revisión, etc.",
                                                                                                                                                              "fechaIngreso": "YYYY-MM-DD",
                                                                                                                                                                        "estado": "en_proceso o resuelto",
                                                                                                                                                                                  "sentido": "Descripción del sentido de la resolución (si resuelto)"
                                                                                                                                                                                          }
                                                                                                                                                                                                ],
                                                                                                                                                                                                      "documentos": [
                                                                                                                                                                                                              {
                                                                                                                                                                                                                        "titulo": "Título del documento",
                                                                                                                                                                                                                                  "tipo": "sentencia o demanda o tesis o amparo o otro",
                                                                                                                                                                                                                                            "url": "URL del documento"
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                          ],
                                                                                                                                                                                                                                                                "fuentes": [
                                                                                                                                                                                                                                                                        {
                                                                                                                                                                                                                                                                                  "titulo": "Título de la fuente",
                                                                                                                                                                                                                                                                                            "url": "URL",
                                                                                                                                                                                                                                                                                                      "medio": "Nombre del medio (opcional)"
                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                    ]
                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                          ]
                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                          Si no encuentras nuevos casos, responde: {"nuevos_casos": []}`;
}

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  // Deadline interno: terminar con 20s de margen antes del maxDuration de 300s
  const DEADLINE_MS = 280_000;
  const MARGEN_PARSEO_MS = 10_000;
  const startTime = Date.now();
  const isDeadlineExceeded = () => Date.now() - startTime > DEADLINE_MS;
  
  let turnosClaude = 0;
  let duracionClaudeMs = 0;

  try {
    console.log('[CRON] Iniciando agente de casos judiciales...');
    const db = getAdminDb();
    const errores: string[] = [];
    let casosEncontrados = 0;

    // Obtener nombres de casos existentes para deduplicación
    const casosSnapshot = await db.collection('casos_ia').get();
    const nombresExistentes = casosSnapshot.docs.map(doc => doc.data().nombre);

    // Ejecutar búsqueda con Claude
    const prompt = getCasosPrompt(nombresExistentes);
    
    if (isDeadlineExceeded()) {
      throw new Error('Deadline excedido antes de iniciar búsqueda con Claude');
    }
    
    // Calcular timeout dinámico
    const tiempoTranscurrido = Date.now() - startTime;
    const tiempoRestante = DEADLINE_MS - tiempoTranscurrido;
    const timeoutClaude = Math.max(30_000, tiempoRestante - MARGEN_PARSEO_MS);
    
    const claudeResult = await searchWithClaude({ 
      prompt, 
      maxTokens: 8192,
      timeoutMs: timeoutClaude,
    });

    turnosClaude = claudeResult.turnos;
    duracionClaudeMs = claudeResult.duracionMs;

    if (isDeadlineExceeded()) {
      throw new Error('Deadline excedido después de búsqueda con Claude');
    }

    // Parsear respuesta JSON
    let resultado: { nuevos_casos: any[] };
    try {
      const jsonMatch = claudeResult.texto.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }
      resultado = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error(`Respuesta invalida del agente de casos: ${parseError}`);
    }

    // Guardar nuevos casos
    for (const caso of resultado.nuevos_casos) {
      if (isDeadlineExceeded()) {
        errores.push('Deadline excedido durante el guardado de casos');
        break;
      }
      
      try {
        // Verificar duplicado por nombre (comparación flexible)
        const nombreNormalizado = caso.nombre?.toLowerCase().trim();
        const esDuplicado = nombresExistentes.some(n =>
          n.toLowerCase().trim() === nombreNormalizado
        );
        if (esDuplicado) {
          console.log(`[CRON] Caso duplicado, saltando: ${caso.nombre}`);
          continue;
        }

        const docRef = db.collection('casos_ia').doc();

        await docRef.set({
          id: docRef.id,
          // Identificación
          nombre: caso.nombre,
          expedienteActual: caso.expedienteActual || '',
          tribunalActual: caso.tribunalActual || '',
          estado: caso.estado || 'en_proceso',
          // Clasificación
          materia: caso.materia || 'amparo',
          temaIA: caso.temaIA || 'otro',
          subtema: caso.subtema || null,
          // Partes
          partes: caso.partes || { actor: '', demandado: '' },
          // Contexto
          resumen: caso.resumen || '',
          hechos: caso.hechos || null,
          elementoIA: caso.elementoIA || '',
          // Trayectoria
          trayectoria: (caso.trayectoria || []).map((inst: any, idx: number) => ({
            orden: inst.orden || idx + 1,
            tribunal: inst.tribunal || '',
            ubicacion: inst.ubicacion || '',
            expediente: inst.expediente || '',
            tipo: inst.tipo || '',
            fechaIngreso: inst.fechaIngreso || '',
            fechaResolucion: inst.fechaResolucion || null,
            estado: inst.estado || 'en_proceso',
            sentido: inst.sentido || null,
          })),
          // Documentos y fuentes
          documentos: caso.documentos || [],
          fuentes: caso.fuentes || [],
          // Meta
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        });

        // Registrar actividad
        await db.collection('actividad').add({
          fecha: Timestamp.now(),
          tipo: 'nuevo_caso',
          casoId: docRef.id,
          casoNombre: caso.nombre,
          descripcion: `Nuevo caso judicial detectado: ${caso.nombre}`,
        });

        casosEncontrados++;
        nombresExistentes.push(caso.nombre);
      } catch (error) {
        errores.push(`Error al guardar caso "${caso.nombre}": ${error}`);
      }
    }

    // Guardar log del agente
    const duracionMs = Date.now() - startTime;
    await db.collection('agenteLogs').add({
      tipo: 'casos_judiciales',
      fecha: Timestamp.now(),
      duracionMs,
      casosEncontrados,
      errores,
      rawResponse: claudeResult.texto,
      trigger: 'cron' as const,
      claudeMeta: {
        turnos: turnosClaude,
        duracionMs: duracionClaudeMs,
      },
    });

      // Registrar actividad de ejecución
      await db.collection('actividad').add({
              fecha: Timestamp.now(),
              tipo: 'agente_ejecutado',
              descripcion: `Agente de casos judiciales ejecutado. ${casosEncontrados} nuevo(s) caso(s) encontrado(s).`,
      });

      console.log('[CRON] Agente de casos judiciales completado:', {
              success: true,
              casosEncontrados,
              errores,
              duracionMs,
      });

      return NextResponse.json({
              mensaje: `Casos judiciales completado. ${casosEncontrados} nuevo(s) caso(s) encontrado(s).`,
              success: true,
              casosEncontrados,
              errores,
              duracionMs,
      });
  } catch (error) {
    const duracionMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    const esTimeout = errorMsg.toLowerCase().includes('timeout') || 
                      errorMsg.toLowerCase().includes('deadline') ||
                      errorMsg.toLowerCase().includes('cancelada') ||
                      duracionMs > 270_000;
    
    console.error('[CRON] Error en agente de casos judiciales:', error);
    
    // Mejorar detección de fase
    let fase = 'desconocida';
    if (errorMsg.includes('búsqueda') || errorMsg.includes('Claude') || errorMsg.includes('cancelada')) {
      fase = 'busqueda_claude';
    } else if (errorMsg.includes('parsear') || errorMsg.includes('JSON')) {
      fase = 'parseo_json';
    } else if (errorMsg.includes('guardar') || errorMsg.includes('Firestore')) {
      fase = 'guardado_firestore';
    } else if (errorMsg.includes('Deadline')) {
      fase = duracionClaudeMs > 0 ? 'guardado_firestore' : 'busqueda_claude';
    }
    
    try {
      // Registrar error detallado en agenteLogs (interno)
      await getAdminDb().collection('agenteLogs').add({
        tipo: 'casos_judiciales',
        fecha: Timestamp.now(),
        duracionMs,
        casosEncontrados: 0,
        errores: [errorMsg],
        rawResponse: '',
        trigger: 'cron' as const,
        error: {
          mensaje: errorMsg,
          esTimeout,
          fase,
        },
        claudeMeta: turnosClaude > 0 ? {
          turnos: turnosClaude,
          duracionMs: duracionClaudeMs,
        } : undefined,
      });
      
      // Mensaje público genérico pero indicando si fue timeout
      await getAdminDb().collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: 'agente_fallo',
        descripcion: esTimeout 
          ? 'El agente de casos judiciales excedió el tiempo límite y no pudo completar la revisión. El detalle quedó en el registro interno.'
          : 'El agente de casos judiciales falló y no pudo completar la revisión. El detalle quedó en el registro interno.',
      });
    } catch (activityError) {
      console.error('[CRON] No se pudo registrar el fallo de casos:', activityError);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al ejecutar agente de casos judiciales',
        detalle: errorMsg,
        esTimeout,
        duracionMs,
      },
      { status: 500 }
    );
  }
}
