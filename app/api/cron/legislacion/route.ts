import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { searchWithClaude } from '@/lib/claude';
import { Timestamp } from 'firebase-admin/firestore';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

function getLegislacionPrompt(titulosExistentes: string[]): string {
    const listaTitulos = titulosExistentes.length > 0
      ? titulosExistentes.map(t => `- ${t}`).join('\n')
          : '(No hay iniciativas previas registradas)';

  return `Eres un analista legislativo especializado en inteligencia artificial en México.
  Tu tarea es identificar NUEVAS iniciativas de ley relacionadas con inteligencia artificial presentadas en México en los últimos 3 meses.

  USA WEB SEARCH para revisar:
  - Gaceta Parlamentaria de la Cámara de Diputados (gaceta.diputados.gob.mx)
  - Sistema de Información Legislativa del Senado (sil.gobernacion.gob.mx)
  - Cámara de Diputados (diputados.gob.mx)
  - Senado de la República (senado.gob.mx)
  - Congreso de la Ciudad de México
  - Noticias recientes sobre "iniciativa ley inteligencia artificial México"
  - Noticias recientes sobre "regulación inteligencia artificial México legislación"

  INICIATIVAS YA REGISTRADAS (NO incluir):
  ${listaTitulos}

  CRITERIOS DE DETECCIÓN:
  - Iniciativas de ley que regulen específicamente la IA
  - Reformas a leyes existentes que incluyan disposiciones sobre IA
  - Puntos de acuerdo relacionados con IA
  - Iniciativas sobre deepfakes, algoritmos, datos personales en contexto IA
  - Iniciativas sobre propiedad intelectual y IA
  - Iniciativas sobre responsabilidad por uso de IA
  - Iniciativas sobre ética en IA
  - Iniciativas estatales (congresos locales) sobre IA

  NO INCLUIR:
  - Iniciativas que no mencionen IA o tecnologías relacionadas
  - Proyectos que solo sean declarativos sin propuesta concreta
  - Duplicados de iniciativas ya registradas

  RESPONDE EN JSON VÁLIDO con este formato exacto:
  {
    "nuevas_iniciativas": [
        {
              "titulo": "Título completo de la iniciativa",
                    "proponente": "Nombre del legislador(a) proponente",
                          "partido": "Partido político (MORENA, PAN, PRI, MC, PT, PVEM, PRD, otro)",
                                "fecha": "YYYY-MM-DD",
                                      "legislatura": "LXVI o III_CDMX u otra",
                                            "camara": "diputados o senadores o congreso_cdmx",
                                                  "descripcion": "Descripción detallada de qué propone la iniciativa",
                                                        "status": "en_comisiones o turnada o dictaminada o aprobada o rechazada o archivada",
                                                              "tipo": "ley_federal o reforma_constitucional o reforma_codigo_penal o reforma_otra",
                                                                    "tematicas": ["regulacion_general", "privacidad_datos", "deepfakes"],
                                                                          "urlGaceta": "URL de la Gaceta Parlamentaria o fuente oficial",
                                                                                "fuentes": [
                                                                                        {
                                                                                                  "tipo": "gaceta_oficial",
                                                                                                            "url": "URL de la fuente",
                                                                                                                      "titulo": "Título de la fuente",
                                                                                                                                "medio": "Nombre del medio (opcional)"
                                                                                                                                        }
                                                                                                                                              ]
                                                                                                                                                  }
                                                                                                                                                    ]
                                                                                                                                                    }
                                                                                                                                                    
                                                                                                                                                    Si no encuentras nuevas iniciativas, responde: {"nuevas_iniciativas": []}`;
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

      console.log('[CRON] Iniciando agente de legislación...');
          const startTime = Date.now();
          const db = getAdminDb();
          const errores: string[] = [];
          let iniciativasEncontradas = 0;

      // Obtener títulos de iniciativas existentes para deduplicación
      const iniciativasSnapshot = await db.collection('iniciativas').get();
          const titulosExistentes = iniciativasSnapshot.docs.map(doc => doc.data().titulo);

      // Ejecutar búsqueda con Claude
      const prompt = getLegislacionPrompt(titulosExistentes);
          const rawResponse = await searchWithClaude({ prompt, maxTokens: 8192 });

      // Parsear respuesta JSON
      let resultado: { nuevas_iniciativas: any[] };
          try {
                  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                  if (!jsonMatch) {
                            throw new Error('No se encontró JSON en la respuesta');
                  }
                  resultado = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
                  errores.push(`Error al parsear respuesta: ${parseError}`);
                  resultado = { nuevas_iniciativas: [] };
          }

      // Guardar nuevas iniciativas
      for (const iniciativa of resultado.nuevas_iniciativas) {
              try {
                        // Verificar duplicado por título (comparación flexible)
                const tituloNormalizado = iniciativa.titulo?.toLowerCase().trim();
                        const esDuplicado = titulosExistentes.some(t => 
                                                                             t.toLowerCase().trim() === tituloNormalizado
                                                                           );
                        if (esDuplicado) {
                                    console.log(`[CRON] Iniciativa duplicada, saltando: ${iniciativa.titulo}`);
                                    continue;
                        }

                const docRef = db.collection('iniciativas').doc();
                        const numero = iniciativasSnapshot.size + iniciativasEncontradas + 1;

                await docRef.set({
                            id: docRef.id,
                            numero,
                            titulo: iniciativa.titulo,
                            proponente: iniciativa.proponente || '',
                            partido: iniciativa.partido || '',
                            fecha: Timestamp.fromDate(new Date(iniciativa.fecha)),
                            legislatura: iniciativa.legislatura || 'LXVI',
                            camara: iniciativa.camara || 'diputados',
                            descripcion: iniciativa.descripcion || '',
                            status: iniciativa.status || 'en_comisiones',
                            estatus: iniciativa.status || 'en_comisiones',
                            tipo: iniciativa.tipo || 'reforma_otra',
                            tematicas: iniciativa.tematicas || [],
                            urlGaceta: iniciativa.urlGaceta || '',
                            fuentes: iniciativa.fuentes || [],
                            eventos: [{
                                          fecha: Timestamp.fromDate(new Date(iniciativa.fecha)),
                                          tipo: 'presentacion',
                                          descripcion: `Iniciativa presentada por ${iniciativa.proponente || 'legislador(a)'}`,
                            }],
                            creadoManualmente: false,
                            createdAt: Timestamp.now(),
                            updatedAt: Timestamp.now(),
                });

                // Registrar actividad
                await db.collection('actividad').add({
                            fecha: Timestamp.now(),
                            tipo: 'nueva_iniciativa',
                            iniciativaId: docRef.id,
                            iniciativaTitulo: iniciativa.titulo,
                            descripcion: `Nueva iniciativa legislativa detectada: ${iniciativa.titulo}`,
                });

                iniciativasEncontradas++;
                        titulosExistentes.push(iniciativa.titulo);
              } catch (error) {
                        errores.push(`Error al guardar iniciativa "${iniciativa.titulo}": ${error}`);
              }
      }

      // Guardar log del agente
      const duracionMs = Date.now() - startTime;
          await db.collection('agenteLogs').add({
                  tipo: 'legislacion',
                  fecha: Timestamp.now(),
                  duracionMs,
                  iniciativasEncontradas,
                  errores,
                  rawResponse,
                  trigger: 'cron' as const,
          });

      // Registrar actividad de ejecución
      await db.collection('actividad').add({
              fecha: Timestamp.now(),
              tipo: 'agente_ejecutado',
              descripcion: `Agente de legislación ejecutado. ${iniciativasEncontradas} nueva(s) iniciativa(s) encontrada(s).`,
      });

      console.log('[CRON] Agente de legislación completado:', {
              success: true,
              iniciativasEncontradas,
              errores,
              duracionMs,
      });

      return NextResponse.json({
              mensaje: `Legislación completada. ${iniciativasEncontradas} nueva(s) iniciativa(s) encontrada(s).`,
              success: true,
              iniciativasEncontradas,
              errores,
              duracionMs,
      });
    } catch (error) {
          console.error('[CRON] Error en agente de legislación:', error);
          return NextResponse.json(
            {
                      error: 'Error al ejecutar agente de legislación',
                      detalle: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
                );
    }
}
