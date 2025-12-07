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
