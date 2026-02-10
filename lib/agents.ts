import { getAdminDb } from './firebase-admin';
import { searchWithClaude } from './claude';
import { getDeteccionPrompt, getMonitoreoPrompt, getRecapMensualPrompt } from './prompts';
import { DeteccionResponse, MonitoreoResponse, TriggerTipo, DeteccionResponseConFuentes, MonitoreoResponseConFuentes, TipoFuente, FuenteTipo } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';
import { crearEventoInicial, crearEventoTimeline } from './timeline';

export async function ejecutarAgenteDeteccion(trigger: TriggerTipo = 'manual') {
  const startTime = Date.now();
  const db = getAdminDb();
  const errores: string[] = [];
  let anunciosEncontrados = 0;

  try {
    // Obtener títulos de anuncios existentes
    const anunciosSnapshot = await db.collection('anuncios').get();
    const titulosExistentes = anunciosSnapshot.docs.map(doc => doc.data().titulo);

    // Ejecutar búsqueda con Claude
    const prompt = getDeteccionPrompt(titulosExistentes);
    const rawResponse = await searchWithClaude({ prompt });

    // Parsear respuesta JSON
    let deteccion: DeteccionResponseConFuentes;
    try {
      // Extraer JSON de la respuesta (puede venir con texto adicional)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON en la respuesta');
      }
      deteccion = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      errores.push(`Error al parsear respuesta: ${parseError}`);
      deteccion = { nuevos_anuncios: [] };
    }

    // Guardar nuevos anuncios
    for (const anuncio of deteccion.nuevos_anuncios) {
      try {
        const anuncioRef = db.collection('anuncios').doc();
        await anuncioRef.set({
          id: anuncioRef.id,
          titulo: anuncio.titulo,
          descripcion: anuncio.descripcion,
          fechaAnuncio: Timestamp.fromDate(new Date(anuncio.fecha_anuncio)),
          fechaPrometida: anuncio.fecha_prometida 
            ? Timestamp.fromDate(new Date(anuncio.fecha_prometida))
            : null,
          responsable: anuncio.responsable,
          dependencia: anuncio.dependencia,
          fuenteOriginal: anuncio.fuente_url,
          citaPromesa: anuncio.cita_promesa,
          status: 'prometido',
          actualizaciones: [],
          creadoManualmente: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Crear evento inicial en el timeline
        try {
          const fuentesAdicionales = (anuncio.fuentes_adicionales || []).map(f => ({
            tipo: f.tipo as FuenteTipo,
            url: f.url,
            titulo: f.titulo,
            fecha: Timestamp.fromDate(new Date(anuncio.fecha_anuncio)) as any,
            fechaPublicacion: new Date(anuncio.fecha_anuncio),
          }));

          await crearEventoInicial({
            anuncioId: anuncioRef.id,
            titulo: anuncio.titulo,
            fechaAnuncio: new Date(anuncio.fecha_anuncio),
            responsable: anuncio.responsable,
            citaPromesa: anuncio.cita_promesa,
            fuenteOriginal: anuncio.fuente_url,
            fuentesAdicionales,
          });
        } catch (timelineError) {
          errores.push(`Error al crear evento de timeline: ${timelineError}`);
        }

        // Registrar actividad
        await db.collection('actividad').add({
          fecha: Timestamp.now(),
          tipo: 'nuevo_anuncio',
          anuncioId: anuncioRef.id,
          anuncioTitulo: anuncio.titulo,
          descripcion: `Nuevo anuncio detectado: ${anuncio.titulo}`,
        });

        anunciosEncontrados++;
      } catch (error) {
        errores.push(`Error al guardar anuncio "${anuncio.titulo}": ${error}`);
      }
    }

    // Guardar log del agente
    const duracionMs = Date.now() - startTime;
    await db.collection('agenteLogs').add({
      tipo: 'deteccion',
      fecha: Timestamp.now(),
      duracionMs,
      anunciosEncontrados,
      actualizacionesDetectadas: 0,
      errores,
      rawResponse,
      trigger,
    });

    // Registrar actividad de ejecución
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'agente_ejecutado',
      descripcion: `Agente de detección ejecutado. ${anunciosEncontrados} nuevo(s) anuncio(s) encontrado(s).`,
    });

    return {
      success: true,
      anunciosEncontrados,
      errores,
      duracionMs,
    };
  } catch (error) {
    const duracionMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    errores.push(`Error general: ${errorMsg}`);

    // Guardar log de error
    await db.collection('agenteLogs').add({
      tipo: 'deteccion',
      fecha: Timestamp.now(),
      duracionMs,
      anunciosEncontrados: 0,
      actualizacionesDetectadas: 0,
      errores,
      rawResponse: '',
      trigger,
    });

    return {
      success: false,
      anunciosEncontrados: 0,
      errores,
      duracionMs,
    };
  }
}

export async function ejecutarAgenteMonitoreo(trigger: TriggerTipo = 'manual') {
  const startTime = Date.now();
  const db = getAdminDb();
  const errores: string[] = [];
  let actualizacionesDetectadas = 0;

  try {
    // Obtener todos los anuncios
    const anunciosSnapshot = await db.collection('anuncios').get();
    const anuncios = anunciosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      titulo: string;
      descripcion: string;
      fechaAnuncio: { toDate: () => Date };
      fechaPrometida: { toDate: () => Date } | null;
      responsable: string;
      status: string;
      actualizaciones: unknown[];
      [key: string]: unknown;
    }>;

    // Monitorear cada anuncio
    for (const anuncio of anuncios) {
      try {
        const prompt = getMonitoreoPrompt({
          titulo: anuncio.titulo,
          descripcion: anuncio.descripcion,
          fechaAnuncio: anuncio.fechaAnuncio.toDate().toISOString().split('T')[0],
          fechaPrometida: anuncio.fechaPrometida 
            ? anuncio.fechaPrometida.toDate().toISOString().split('T')[0]
            : null,
          responsable: anuncio.responsable,
          status: anuncio.status,
        });

        const rawResponse = await searchWithClaude({ prompt });

        // Parsear respuesta
        let monitoreo: MonitoreoResponseConFuentes;
        try {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No se encontró JSON en la respuesta');
          }
          monitoreo = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          errores.push(`Error al parsear respuesta para "${anuncio.titulo}": ${parseError}`);
          continue;
        }

        // Si hay actualización, guardarla
        if (monitoreo.hay_actualizacion && monitoreo.actualizacion) {
          const actualizacion = {
            fecha: Timestamp.now(),
            descripcion: monitoreo.actualizacion.descripcion,
            fuente: monitoreo.actualizacion.fuente_url,
            cambioStatus: monitoreo.cambio_status_recomendado,
            statusAnterior: monitoreo.cambio_status_recomendado ? anuncio.status : undefined,
            statusNuevo: monitoreo.cambio_status_recomendado ? monitoreo.nuevo_status : undefined,
          };

          const actualizaciones = anuncio.actualizaciones || [];
          actualizaciones.push(actualizacion);

          const updateData: Record<string, unknown> = {
            actualizaciones,
            updatedAt: Timestamp.now(),
          };

          // Cambiar status si es recomendado
          if (monitoreo.cambio_status_recomendado && monitoreo.nuevo_status) {
            updateData.status = monitoreo.nuevo_status;

            // Registrar actividad de cambio de status
            await db.collection('actividad').add({
              fecha: Timestamp.now(),
              tipo: 'cambio_status',
              anuncioId: anuncio.id,
              anuncioTitulo: anuncio.titulo,
              descripcion: `Status cambió de "${anuncio.status}" a "${monitoreo.nuevo_status}": ${monitoreo.justificacion}`,
            });
          } else {
            // Registrar actividad de actualización
            await db.collection('actividad').add({
              fecha: Timestamp.now(),
              tipo: 'actualizacion',
              anuncioId: anuncio.id,
              anuncioTitulo: anuncio.titulo,
              descripcion: monitoreo.actualizacion.descripcion,
            });
          }

          await db.collection('anuncios').doc(anuncio.id).update(updateData);
          
          // Crear evento en el timeline
          try {
            const fuentesAdicionales = (monitoreo.actualizacion.fuentes_adicionales || []).map(f => ({
              tipo: f.tipo as FuenteTipo,
              url: f.url,
              titulo: f.titulo,
              medio: f.medio,
              fecha: Timestamp.now() as any,
              fechaPublicacion: new Date(),
            }));

            await crearEventoTimeline({
              anuncioId: anuncio.id,
              fecha: new Date(),
              tipo: monitoreo.actualizacion.tipo_evento || 'actualizacion',
              titulo: monitoreo.cambio_status_recomendado 
                ? `Cambio de status: ${monitoreo.nuevo_status}`
                : 'Actualización detectada',
              descripcion: monitoreo.actualizacion.descripcion,
              fuentes: [
                {
                  tipo: 'nota_prensa' as FuenteTipo,
                  url: monitoreo.actualizacion.fuente_url,
                  titulo: monitoreo.actualizacion.descripcion,
                  fecha: Timestamp.now() as any,
                  fechaPublicacion: new Date(),
                },
                ...fuentesAdicionales,
              ],
              citaTextual: monitoreo.actualizacion.cita_textual,
              responsable: anuncio.responsable,
              impacto: monitoreo.actualizacion.impacto || 'neutral',
            });
          } catch (timelineError) {
            errores.push(`Error al crear evento de timeline para "${anuncio.titulo}": ${timelineError}`);
          }
          
          actualizacionesDetectadas++;
        }
      } catch (error) {
        errores.push(`Error al monitorear "${anuncio.titulo}": ${error}`);
      }
    }

    // Guardar log del agente
    const duracionMs = Date.now() - startTime;
    await db.collection('agenteLogs').add({
      tipo: 'monitoreo',
      fecha: Timestamp.now(),
      duracionMs,
      anunciosEncontrados: 0,
      actualizacionesDetectadas,
      errores,
      rawResponse: '',
      trigger,
    });

    // Registrar actividad de ejecución
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'agente_ejecutado',
      descripcion: `Agente de monitoreo ejecutado. ${actualizacionesDetectadas} actualización(es) detectada(s).`,
    });

    return {
      success: true,
      actualizacionesDetectadas,
      errores,
      duracionMs,
    };
  } catch (error) {
    const duracionMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    errores.push(`Error general: ${errorMsg}`);

    // Guardar log de error
    await db.collection('agenteLogs').add({
      tipo: 'monitoreo',
      fecha: Timestamp.now(),
      duracionMs,
      anunciosEncontrados: 0,
      actualizacionesDetectadas: 0,
      errores,
      rawResponse: '',
      trigger,
    });

    return {
      success: false,
      actualizacionesDetectadas: 0,
      errores,
      duracionMs,
    };
  }
}

export async function ejecutarAgenteRecapMensual(trigger: TriggerTipo = 'manual') {
    const startTime = Date.now();
    const db = getAdminDb();
    const errores: string[] = [];

    try {
          const ahora = new Date();
          const mesRecap = ahora.getMonth() === 0 ? 12 : ahora.getMonth();
          const anioRecap = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
          const meses = ['enero','febrero','marzo','abril','mayo','junio',
                                            'julio','agosto','septiembre','octubre','noviembre','diciembre'];
          const mesLabel = meses[mesRecap - 1];

          // Verificar si ya existe recap de este mes
          const existente = await db.collection('recapsMensuales')
            .where('mes', '==', mesRecap)
            .where('anio', '==', anioRecap)
            .get();

          if (!existente.empty) {
                  return {
                            success: true,
                            mensaje: `Recap de ${mesLabel} ${anioRecap} ya existe. Saltando.`,
                            duracionMs: Date.now() - startTime,
                            errores: [],
                  };
          }

          // Recopilar datos de anuncios
          const anunciosSnap = await db.collection('anuncios').get();
          const anuncios = anunciosSnap.docs.map(doc => {
                  const d = doc.data();
                  const actualizaciones = (d.actualizaciones || []);
                  const inicioMes = new Date(anioRecap, mesRecap - 1, 1);
                  const finMes = new Date(anioRecap, mesRecap, 0, 23, 59, 59);
                  const actualizacionesDelMes = actualizaciones
                    .filter((a: any) => {
                                const fecha = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
                                return fecha >= inicioMes && fecha <= finMes;
                    })
                    .map((a: any) => a.descripcion || '');

                  return {
                            titulo: d.titulo,
                            status: d.status,
                            statusAnterior: actualizaciones.find((a: any) => a.statusAnterior)?.statusAnterior,
                            responsable: d.responsable,
                            dependencia: d.dependencia,
                            actualizacionesDelMes,
                  };
          });

          const statsTracker = {
                  totalAnuncios: anuncios.length,
                  operando: anuncios.filter(a => a.status === 'operando').length,
                  enDesarrollo: anuncios.filter(a => a.status === 'en_desarrollo').length,
                  prometido: anuncios.filter(a => a.status === 'prometido').length,
                  incumplido: anuncios.filter(a => a.status === 'incumplido').length,
                  abandonado: anuncios.filter(a => a.status === 'abandonado').length,
          };

          // Recopilar datos de iniciativas
          const iniciativasSnap = await db.collection('iniciativas').get();
          const totalIniciativas = iniciativasSnap.size;
          const iniciativasDocs = iniciativasSnap.docs.map(d => d.data());
          const activas = iniciativasDocs.filter((i: any) =>
                  i.status === 'en_comisiones' || i.status === 'turnada'
                                                     ).length;
          const aprobadas = iniciativasDocs.filter((i: any) => i.status === 'aprobada').length;
          const desechadas = iniciativasDocs.filter((i: any) =>
                  i.status === 'desechada_termino' || i.status === 'archivada' || i.status === 'rechazada'
                                                        ).length;

          // Recopilar datos de casos judiciales
          const casosSnap = await db.collection('casosIA').get();
          const totalCasos = casosSnap.size;
          const casosDocs = casosSnap.docs.map(d => d.data());
          const conCriterio = casosDocs.filter((c: any) => c.criterio || c.tipoCriterio).length;

          // Construir prompt y llamar a Claude
          const prompt = getRecapMensualPrompt({
                  mes: mesLabel,
                  anio: String(anioRecap),
                  anuncios,
                  iniciativas: {
                            total: totalIniciativas,
                            activas,
                            aprobadas,
                            desechadas,
                            nuevasDelMes: 0,
                            cambiosStatusDelMes: [],
                  },
                  casosJudiciales: {
                            total: totalCasos,
                            conCriterio,
                            nuevosDelMes: 0,
                            resumenNuevos: [],
                  },
                  statsTracker,
          });

          const rawResponse = await searchWithClaude({ prompt, maxTokens: 4096 });

          // Parsear respuesta
          let recap: any;
          try {
                  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                  if (!jsonMatch) throw new Error('No se encontró JSON en la respuesta');
                  recap = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
                  errores.push(`Error al parsear respuesta: ${parseError}`);
                  throw parseError;
          }

          // Guardar recap en Firestore
          const recapRef = db.collection('recapsMensuales').doc();
          await recapRef.set({
                  id: recapRef.id,
                  mes: mesRecap,
                  anio: anioRecap,
                  mesLabel,
                  titulo: recap.titulo,
                  subtitulo: recap.subtitulo,
                  contenido: recap.contenido,
                  datosClave: recap.datos_clave || [],
                  veredicto: recap.veredicto,
                  fuentesConsultadas: recap.fuentes_consultadas || [],
                  statsSnapshot: {
                            ...statsTracker,
                            totalIniciativas,
                            iniciativasActivas: activas,
                            totalCasos,
                  },
                  rawResponse,
                  duracionMs: Date.now() - startTime,
                  trigger,
                  createdAt: Timestamp.now(),
          });

          // Log del agente
          const duracionMs = Date.now() - startTime;
          await db.collection('agenteLogs').add({
                  tipo: 'recap_mensual',
                  fecha: Timestamp.now(),
                  duracionMs,
                  anunciosEncontrados: 0,
                  actualizacionesDetectadas: 0,
                  errores,
                  rawResponse,
                  trigger,
          });

          // Registrar en actividad
          await db.collection('actividad').add({
                  fecha: Timestamp.now(),
                  tipo: 'agente_ejecutado',
                  descripcion: `Recap mensual de ${mesLabel} ${anioRecap} generado: "${recap.titulo}"`,
          });

          return {
                  success: true,
                  recapId: recapRef.id,
                  titulo: recap.titulo,
                  errores,
                  duracionMs,
          };
    } catch (error) {
          const duracionMs = Date.now() - startTime;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errores.push(`Error general: ${errorMsg}`);

          await db.collection('agenteLogs').add({
                  tipo: 'recap_mensual',
                  fecha: Timestamp.now(),
                  duracionMs,
                  anunciosEncontrados: 0,
                  actualizacionesDetectadas: 0,
                  errores,
                  rawResponse: '',
                  trigger,
          });

          return { success: false, errores, duracionMs };
    }
}
