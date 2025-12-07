import { getAdminDb } from './firebase-admin';
import { searchWithClaude } from './claude';
import { getDeteccionPrompt, getMonitoreoPrompt } from './prompts';
import { DeteccionResponse, MonitoreoResponse, TriggerTipo, DeteccionResponseConFuentes, MonitoreoResponseConFuentes, TipoFuente } from '@/types';
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
            tipo: f.tipo as TipoFuente,
            url: f.url,
            titulo: f.titulo,
            medio: f.medio,
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
              tipo: f.tipo as TipoFuente,
              url: f.url,
              titulo: f.titulo,
              medio: f.medio,
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
                  tipo: 'nota_prensa' as TipoFuente,
                  url: monitoreo.actualizacion.fuente_url,
                  titulo: monitoreo.actualizacion.descripcion,
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
