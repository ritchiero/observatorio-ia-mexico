import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { searchWithClaude } from '@/lib/claude';
import { Timestamp } from 'firebase-admin/firestore';

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
    try {
          // Verificar que la petición viene de Vercel Cron
      const authHeader = request.headers.get('authorization');
          if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                  return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                          );
          }

      console.log('[CRON] Iniciando agente de casos judiciales...');
          const startTime = Date.now();
          const db = getAdminDb();
          const errores: string[] = [];
          let casosEncontrados = 0;

      // Obtener nombres de casos existentes para deduplicación
      const casosSnapshot = await db.collection('casos_ia').get();
          const nombresExistentes = casosSnapshot.docs.map(doc => doc.data().nombre);

      // Ejecutar búsqueda con Claude
      const prompt = getCasosPrompt(nombresExistentes);
          const rawResponse = await searchWithClaude({ prompt, maxTokens: 8192 });

      // Parsear respuesta JSON
      let resultado: { nuevos_casos: any[] };
          try {
                  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                  if (!jsonMatch) {
                            throw new Error('No se encontró JSON en la respuesta');
                  }
                  resultado = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
                  errores.push(`Error al parsear respuesta: ${parseError}`);
                  resultado = { nuevos_casos: [] };
          }

      // Guardar nuevos casos
      for (const caso of resultado.nuevos_casos) {
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
                  rawResponse,
                  trigger: 'cron' as const,
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
          console.error('[CRON] Error en agente de casos judiciales:', error);
          return NextResponse.json(
            {
                      error: 'Error al ejecutar agente de casos judiciales',
                      detalle: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
                );
    }
}
