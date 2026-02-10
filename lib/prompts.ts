export function getDeteccionPrompt(titulosExistentes: string[]): string {
  const listaTitulos = titulosExistentes.length > 0 
    ? titulosExistentes.map(t => `- ${t}`).join('\n')
    : '(No hay anuncios previos registrados)';

  return `Eres un analista de políticas públicas de inteligencia artificial en México.

Tu tarea es identificar NUEVOS anuncios del gobierno federal mexicano relacionados con inteligencia artificial publicados en el último mes.

USA WEB SEARCH para revisar:
- Sitio oficial de Presidencia (gob.mx/presidencia)
- Secretaría de Economía
- CONAHCYT
- Senado de la República
- Cámara de Diputados
- Noticias recientes sobre "gobierno México inteligencia artificial"

ANUNCIOS YA REGISTRADOS (NO incluir):
${listaTitulos}

CRITERIOS DE DETECCIÓN:
- Anuncios de nuevos proyectos con compromiso concreto
- Infraestructura: laboratorios, centros de datos, supercomputadoras
- Modelos de lenguaje gubernamentales
- Inversiones con montos o fechas
- Leyes o regulaciones propuestas/aprobadas
- Programas educativos con fechas

NO INCLUIR:
- Menciones genéricas sin compromiso concreto
- Opiniones sin anuncio de proyecto
- Anuncios del sector privado sin participación gubernamental

RESPONDE EN JSON VÁLIDO con este formato exacto:
{
  "nuevos_anuncios": [
    {
      "titulo": "Título del anuncio",
      "descripcion": "Descripción detallada del proyecto",
      "fecha_anuncio": "YYYY-MM-DD",
      "fecha_prometida": "YYYY-MM-DD o null si no hay fecha",
      "responsable": "Nombre del funcionario",
      "dependencia": "Nombre de la dependencia",
      "fuente_url": "URL de la fuente oficial",
      "cita_promesa": "Cita textual del compromiso",
      "fuentes_adicionales": [
        {
          "tipo": "nota_prensa|comunicado_oficial|video|documento|tweet|gaceta_oficial|otro",
          "url": "URL de la fuente",
          "titulo": "Título de la fuente",
          "medio": "Nombre del medio (opcional)"
        }
      ]
    }
  ]
}

INCLUYE MÚLTIPLES FUENTES cuando sea posible (comunicado oficial + notas de prensa + videos).

Si no encuentras nuevos anuncios, responde: {"nuevos_anuncios": []}`;
}

export function getMonitoreoPrompt(anuncio: {
  titulo: string;
  descripcion: string;
  fechaAnuncio: string;
  fechaPrometida: string | null;
  responsable: string;
  status: string;
}): string {
  const hoy = new Date().toISOString().split('T')[0];

  return `Eres un analista de seguimiento de políticas públicas de IA en México.

Tu tarea es buscar actualizaciones sobre un anuncio gubernamental específico.

ANUNCIO A MONITOREAR:
- Título: ${anuncio.titulo}
- Descripción: ${anuncio.descripcion}
- Fecha anuncio: ${anuncio.fechaAnuncio}
- Fecha prometida: ${anuncio.fechaPrometida || 'No especificada'}
- Responsable: ${anuncio.responsable}
- Status actual: ${anuncio.status}

FECHA ACTUAL: ${hoy}

USA WEB SEARCH para buscar noticias y comunicados sobre este proyecto específico.

BUSCA EVIDENCIA DE:
1. Avances concretos (licitaciones, contratos, construcción)
2. Cambios de fecha o alcance
3. Asignación de presupuesto
4. Inauguraciones o lanzamientos
5. Cancelaciones o pausas
6. Silencio significativo (fecha prometida pasó sin novedad)

REGLAS PARA CAMBIO DE STATUS:
- prometido → en_desarrollo: Evidencia de trabajo activo
- prometido → incumplido: Fecha prometida pasó sin avance
- en_desarrollo → operando: Proyecto funcionando públicamente
- cualquiera → abandonado: Cancelación explícita

RESPONDE EN JSON VÁLIDO con este formato exacto:
{
  "hay_actualizacion": true o false,
  "actualizacion": {
    "descripcion": "Descripción de la actualización encontrada",
    "fuente_url": "URL de la fuente",
    "tipo_evento": "actualizacion|cambio_status|cumplimiento|incumplimiento|retraso|progreso",
    "impacto": "positivo|neutral|negativo",
    "cita_textual": "Cita textual relevante del funcionario o fuente (opcional)",
    "fuentes_adicionales": [
      {
        "tipo": "nota_prensa|comunicado_oficial|video|documento|tweet|gaceta_oficial|otro",
        "url": "URL de la fuente",
        "titulo": "Título de la fuente",
        "medio": "Nombre del medio (opcional)"
      }
    ]
  },
  "cambio_status_recomendado": true o false,
  "nuevo_status": "prometido|en_desarrollo|operando|incumplido|abandonado",
  "justificacion": "Razón del cambio de status"
}

CRITERIOS PARA tipo_evento:
- actualizacion: Información nueva sin cambio de status
- cambio_status: Cambio oficial de status del proyecto
- cumplimiento: Proyecto cumplió lo prometido
- incumplimiento: Fecha pasó sin cumplir
- retraso: Anuncio de retraso oficial
- progreso: Avance significativo hacia cumplimiento

CRITERIOS PARA impacto:
- positivo: Avances, cumplimientos, lanzamientos
- neutral: Información sin cambio significativo
- negativo: Retrasos, incumplimientos, cancelaciones

INCLUYE MÚLTIPLES FUENTES cuando sea posible para mayor credibilidad.

Si no hay actualizaciones, responde: {"hay_actualizacion": false, "cambio_status_recomendado": false}`;
}

export function getRecapMensualPrompt(datos: {
    mes: string;
    anio: string;
    anuncios: {
          titulo: string;
          status: string;
          statusAnterior?: string;
          responsable: string;
          dependencia: string;
          actualizacionesDelMes: string[];
    }[];
    iniciativas: {
          total: number;
          activas: number;
          aprobadas: number;
          desechadas: number;
          nuevasDelMes: number;
          cambiosStatusDelMes: { titulo: string; statusAnterior: string; statusNuevo: string }[];
    };
    casosJudiciales: {
          total: number;
          conCriterio: number;
          nuevosDelMes: number;
          resumenNuevos: string[];
    };
    statsTracker: {
          totalAnuncios: number;
          operando: number;
          enDesarrollo: number;
          prometido: number;
          incumplido: number;
          abandonado: number;
    };
}): string {
    const anunciosConActividad = datos.anuncios
      .filter(a => a.actualizacionesDelMes.length > 0)
      .map(a =>
              `- "${a.titulo}" (${a.responsable}, ${a.dependencia}): Status ${a.statusAnterior ? `cambió de ${a.statusAnterior} a ` : ''}${a.status}. Actualizaciones: ${a.actualizacionesDelMes.join('; ')}`
               ).join('\n') || '(Sin actividad en anuncios este mes)';

    const cambiosLeg = datos.iniciativas.cambiosStatusDelMes.length > 0
      ? `Cambios de status:\n${datos.iniciativas.cambiosStatusDelMes.map(c => `- "${c.titulo}": ${c.statusAnterior} → ${c.statusNuevo}`).join('\n')}`
          : '(Sin cambios legislativos este mes)';

    const resumenCasos = datos.casosJudiciales.resumenNuevos.length > 0
      ? datos.casosJudiciales.resumenNuevos.map(r => `- ${r}`).join('\n')
            : '(Sin nuevos casos este mes)';

    return `Eres el editor del Observatorio de IA México, un observatorio ciudadano que monitorea la inteligencia artificial en el estado mexicano.

    Tu tarea es redactar el RECAP MENSUAL de ${datos.mes} ${datos.anio}: un resumen ejecutivo breve, directo y con datos duros sobre el estado de la IA gubernamental en México.

    DATOS DEL MES:

    === TRACKER DE PROMESAS ===
    Total anuncios: ${datos.statsTracker.totalAnuncios}
    - Operando: ${datos.statsTracker.operando}
    - En desarrollo: ${datos.statsTracker.enDesarrollo}
    - Prometido: ${datos.statsTracker.prometido}
    - Incumplido: ${datos.statsTracker.incumplido}
      - Abandonado: ${datos.statsTracker.abandonado}

      Detalle de anuncios con actividad este mes:
      ${anunciosConActividad}

      === LEGISLACIÓN ===
      Total iniciativas: ${datos.iniciativas.total}
      Activas: ${datos.iniciativas.activas} | Aprobadas: ${datos.iniciativas.aprobadas} | Desechadas: ${datos.iniciativas.desechadas}
      Nuevas este mes: ${datos.iniciativas.nuevasDelMes}
      ${cambiosLeg}

      === CASOS JUDICIALES ===
      Total casos: ${datos.casosJudiciales.total} | Con criterio: ${datos.casosJudiciales.conCriterio}
      Nuevos este mes: ${datos.casosJudiciales.nuevosDelMes}
      ${resumenCasos}

      USA WEB SEARCH para buscar si hubo noticias relevantes adicionales sobre IA y gobierno en México durante ${datos.mes} ${datos.anio} que complementen este recap.

      INSTRUCCIONES DE REDACCIÓN:
      1. Tono: periodístico, directo, sin adjetivos vacíos. Estilo "The Economist" en español.
      2. Extensión: 300-500 palabras máximo.
      3. Estructura del JSON de respuesta (responde SOLO en JSON válido):

      {
        "titulo": "Título editorial breve y llamativo para el recap del mes",
          "subtitulo": "Una línea que resuma el estado general",
            "contenido": "El cuerpo del recap en texto plano. Usa saltos de línea (\\n\\n) para separar párrafos. NO uses markdown.",
              "datos_clave": [
                  "Dato duro 1 (ej: '0 de 9 proyectos de IA operando')",
                      "Dato duro 2",
                          "Dato duro 3"
                            ],
                              "veredicto": "Una frase final tipo sentencia editorial (máx 15 palabras)",
                                "fuentes_consultadas": [
                                    {
                                          "url": "URL consultada via web search",
                                                "titulo": "Descripción de la fuente"
                                                    }
                                                      ]
                                                      }

                                                      REGLAS:
                                                      - Si no pasó nada relevante, el recap debe decirlo explícitamente: el silencio gubernamental ES noticia.
                                                      - Siempre incluye el porcentaje de cumplimiento del tracker.
                                                      - Compara con el mes anterior si hay datos para hacerlo.
                                                      - NO inventes datos. Si algo no está en los datos proporcionados, no lo incluyas.`;
}
