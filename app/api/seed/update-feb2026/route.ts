import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// ============================================================
// ACTUALIZACIÓN MASIVA - Febrero 2026
// Cubre reportes semanales desde dic 22, 2025 hasta feb 9, 2026
// Ejecutar UNA SOLA VEZ via POST /api/seed/update-feb2026
// ============================================================

// IDs de Firestore de los anuncios existentes
const EXISTING_IDS = {
    carreras15: 'JCaTP1cQ6HfT5GQbGP4p',
    regulacionAPEC: 'LFhRGUsF1SyPFLkLZSjQ',
    coatlicue: 'Szo2Jkz805qJNLHOSTSg',
    kal: 'O7WKBMvjkJvk2UHtCnZI',
    centroAnuncio: '1Qq5rwasocMv2F0MLgQ5',
    centroEjecucion: 'ADyLAhTng95KSjFPUzfO',
    cloudHQ: 'zSmTpbbyDUtKxc3bhT3a',
    mexicoIA: 'fpQIXV5So7Df0Y0TYqaW',
    laboratorio: 'UfSnLrpDhXrNnqy0BKC1',
};

// PARTE 1: Actualizaciones de estatus de anuncios existentes
const statusUpdates = [
  {
        id: EXISTING_IDS.centroEjecucion,
        updates: {
                status: 'operando',
                descripcion: 'Operando desde enero 2026. 11,000 estudiantes en 26 cursos especializados con Microsoft, Google, IBM, Amazon y más. Primera generación activa en 10 ciudades.',
                updatedAt: Timestamp.now(),
        },
  },
  {
        id: EXISTING_IDS.centroAnuncio,
        updates: {
                status: 'operando',
                descripcion: 'El Centro Público de Formación en IA anunciado por la Presidenta Claudia Sheinbaum ya está en operación. El 27 de enero de 2026 iniciaron clases 10,000 estudiantes en 10 ciudades. Para febrero 2026, 11,000 estudiantes se incorporaron a cursos especializados con certificación de Big Tech.',
                updatedAt: Timestamp.now(),
        },
  },
  {
        id: EXISTING_IDS.carreras15,
        updates: {
                status: 'en_desarrollo',
                descripcion: 'En implementación activa. Se inauguraron nuevos CBTIS y CETIS con carreras de IA en Nuevo León, San Luis Potosí, Tijuana, Hidalgo y Edo. de México. CBTIS 299 (García NL) y UNRC (SLP) con Ingeniería en IA ya operando.',
                updatedAt: Timestamp.now(),
        },
  },
  {
        id: EXISTING_IDS.coatlicue,
        updates: {
                status: 'en_desarrollo',
                descripcion: 'En desarrollo activo. Entrevista WIRED (ene 2026) confirmó cronograma: obra civil en 2025, compra de GPUs en 2026. Secihti refrendó inversión de 6 mil MDP. Comunidad científica celebra el proyecto. Capacidad proyectada: 314 petaflops.',
                updatedAt: Timestamp.now(),
        },
  },
  {
        id: EXISTING_IDS.laboratorio,
        updates: {
                status: 'en_desarrollo',
                descripcion: 'El 13 de enero de 2026, Sheinbaum anunció formalmente en la mañanera la creación del Laboratorio de IA, enfocado en salud, energía, prevención de desastres y meteorología. La AIT México declaró alinear sus objetivos con este laboratorio. Coordinado por ATDT y Secihti.',
                updatedAt: Timestamp.now(),
        },
  },
  ];

// PARTE 2: Nuevos anuncios a agregar
const nuevosAnuncios = [
  {
        titulo: 'Green Data Center de IA con NVIDIA (Nuevo León)',
        descripcion: 'Inversión de $1,000 millones de dólares para construir el primer Green Data Center de IA en México, en colaboración con NVIDIA. Presentado por el Gobernador Samuel García desde Nueva York. Enfocado en cómputo de alto rendimiento para IA. Construcción iniciará en 2026. Se estima generar entre 10,000 y 15,000 empleos.',
        fechaAnuncio: '2026-02-02',
        fechaPrometida: '2027-01-01',
        responsable: 'Samuel García / Gobierno de Nuevo León',
        dependencia: 'Gobierno del Estado de Nuevo León',
        fuenteOriginal: 'https://www.elhorizonte.mx',
        citaPromesa: 'Inversión de mil millones de dólares para el primer Green Data Center de IA en México',
        status: 'prometido',
        resumenAgente: 'El 2 de febrero de 2026, el Gobierno de Nuevo León anunció una inversión de $1,000 MDD para la construcción del primer Green Data Center de IA en México, en colaboración con NVIDIA. El proyecto, presentado por el Gobernador Samuel García desde Nueva York, se centrará en cómputo de alto rendimiento y se espera que inicie construcción en 2026. Es independiente del proyecto de CloudHQ en Querétaro, diferenciándose por empresa, ubicación y monto.',
        fuentes: [
          { url: 'https://www.elhorizonte.mx', titulo: 'Apunta NL a consolidarse como destino ideal para data centers', fecha: '2026-02-02', tipo: 'nota_prensa', medio: 'El Horizonte', accesible: true },
              ],
  },
  {
        titulo: 'Regulación de IA en Industria del Doblaje',
        descripcion: 'Iniciativa de ley lista para ser presentada por la Presidencia para proteger a actores de doblaje frente al uso de IA. Construida en acuerdo con la comunidad del doblaje. Parte de un paquete más amplio de iniciativas culturales incluyendo la Nueva Ley de Cine.',
        fechaAnuncio: '2026-02-03',
        fechaPrometida: null,
        responsable: 'Claudia Curiel de Icaza / Secretaría de Cultura',
        dependencia: 'Secretaría de Cultura',
        fuenteOriginal: 'https://www.jornada.com.mx',
        citaPromesa: 'Iniciativa lista para proteger a actores de doblaje ante el avance de la IA',
        status: 'prometido',
        resumenAgente: 'El 3 de febrero de 2026, la Secretaria de Cultura Claudia Curiel de Icaza anunció una iniciativa de ley para proteger los derechos de imagen y voz de los actores de doblaje frente al uso de IA. La propuesta fue construida en acuerdo con la comunidad del doblaje y forma parte de la futura Nueva Ley de Cine. Es un movimiento regulatorio novedoso que aborda un nicho específico de la aplicación de IA en industrias creativas.',
        fuentes: [
          { url: 'https://www.jornada.com.mx', titulo: 'Lista, iniciativa para proteger a actores de doblaje ante avance de la IA: Curiel', fecha: '2026-02-03', tipo: 'nota_prensa', medio: 'La Jornada', accesible: true },
          { url: 'https://www.eleconomista.com.mx', titulo: 'Nueva ley de cine incluirá regulación sobre IA en doblaje', fecha: '2026-02-03', tipo: 'nota_prensa', medio: 'El Economista', accesible: true },
              ],
  },
  {
        titulo: 'Regulación de IA en Campañas Políticas (Reforma Electoral)',
        descripcion: 'La próxima reforma electoral incluirá un apartado específico para regular el uso de IA en campañas políticas. Busca hacer frente a la manipulación de contenido multimedia (imágenes, videos y voz) para la desinformación. Borrador en revisión.',
        fechaAnuncio: '2026-01-31',
        fechaPrometida: '2026-02-28',
        responsable: 'Comisión Presidencial para la Reforma Electoral',
        dependencia: 'Presidencia de la República',
        fuenteOriginal: 'https://www.infobae.com',
        citaPromesa: 'La reforma electoral incluirá medidas sobre uso de IA en campañas',
        status: 'prometido',
        resumenAgente: 'El 31 de enero de 2026 se anunció que la próxima reforma electoral incluirá regulación específica sobre el uso de IA en campañas políticas, enfocándose en combatir la manipulación de contenido multimedia para desinformación. La propuesta está impulsada por la Comisión Presidencial para la Reforma Electoral y se espera su presentación formal en febrero de 2026.',
        fuentes: [
          { url: 'https://www.infobae.com', titulo: 'Reforma electoral incluirá medidas sobre uso de IA en campañas; Sheinbaum prevé presentarla en febrero', fecha: '2026-01-31', tipo: 'nota_prensa', medio: 'Infobae', accesible: true },
              ],
  },
  {
        titulo: 'Declaración de Ética y Buenas Prácticas para IA',
        descripcion: 'Secihti y ATDT presentaron la "Declaración de Ética y Buenas Prácticas para el Uso y Desarrollo de la IA en México", basada en los Principios de Chapultepec. Establece un marco ético y hoja de ruta para orientar el diseño, implementación y evaluación de sistemas de IA con enfoque en derechos humanos.',
        fechaAnuncio: '2026-01-29',
        fechaPrometida: null,
        responsable: 'Secihti + ATDT',
        dependencia: 'Secihti / ATDT',
        fuenteOriginal: 'https://secihti.mx/ciencia-y-humanidades/principios-de-chapultepec-declaracion-de-etica-y-buenas-practicas-para-el-uso-y-desarrollo-de-la-inteligencia-artificial/',
        citaPromesa: 'Declaración de ética y buenas prácticas para el uso y desarrollo de la IA en México',
        status: 'operando',
        resumenAgente: 'El 29 de enero de 2026, Secihti y ATDT presentaron la Declaración de Ética y Buenas Prácticas para el Uso y Desarrollo de la IA en México, basada en los Principios de Chapultepec. Este documento constituye el primer marco ético federal formal para guiar la implementación de sistemas de IA en el sector público mexicano, con enfoque en derechos humanos y bienestar social.',
        fuentes: [
          { url: 'https://secihti.mx/ciencia-y-humanidades/principios-de-chapultepec-declaracion-de-etica-y-buenas-practicas-para-el-uso-y-desarrollo-de-la-inteligencia-artificial/', titulo: 'Declaración de Ética y Buenas Prácticas para el Uso y Desarrollo de la IA', fecha: '2026-01-29', tipo: 'comunicado_oficial', medio: 'SECIHTI', accesible: true },
              ],
  },
  {
        titulo: 'Acuerdo Monterrey-AIFOD para Hub de IA en LATAM',
        descripcion: 'Firma de Memorando de Entendimiento entre Monterrey y el AI for Developing Countries Forum (AIFOD) durante el AIFOD Bangkok Summit. Posiciona a Monterrey como hub estratégico de IA para el desarrollo sostenible en América Latina. Marcos para investigación conjunta, intercambio de conocimiento y desarrollo de talento.',
        fechaAnuncio: '2026-02-04',
        fechaPrometida: null,
        responsable: 'Gobierno Municipal de Monterrey',
        dependencia: 'Gobierno Municipal de Monterrey, Nuevo León',
        fuenteOriginal: 'https://aifod.org',
        citaPromesa: 'Acuerdo estratégico de cooperación en IA entre Monterrey y AIFOD',
        status: 'prometido',
        resumenAgente: 'El 4 de febrero de 2026, el Gobierno Municipal de Monterrey firmó un MOU con AIFOD durante el Bangkok Summit en el UN ESCAP Hall. El acuerdo posiciona a Monterrey como hub de IA para el desarrollo sostenible en LATAM, con marcos para investigación conjunta en smart cities, energía y agricultura. Es una iniciativa subnacional proactiva de cooperación internacional.',
        fuentes: [
          { url: 'https://aifod.org', titulo: 'AIFOD and City of Monterrey Sign Historic Partnership Agreement', fecha: '2026-02-04', tipo: 'comunicado_oficial', medio: 'AIFOD', accesible: true },
              ],
  },
  {
        titulo: 'Maestría en IA - Universidad de las Mujeres (Chihuahua)',
        descripcion: 'Inscripciones abiertas para nueva maestría en Inteligencia Artificial e Ingeniería del Conocimiento en la Universidad de las Mujeres de Chihuahua. Programa de 20 meses diseñado para formar mujeres en áreas de alta demanda tecnológica. Iniciativa local independiente de programas federales.',
        fechaAnuncio: '2026-01-30',
        fechaPrometida: null,
        responsable: 'Gobierno Municipal de Chihuahua / Instituto Municipal de las Mujeres',
        dependencia: 'Gobierno Municipal de Chihuahua',
        fuenteOriginal: 'https://www.municipiochihuahua.gob.mx',
        citaPromesa: 'Maestría en Inteligencia Artificial e Ingeniería del Conocimiento',
        status: 'en_desarrollo',
        resumenAgente: 'El 30 de enero de 2026, el Gobierno Municipal de Chihuahua abrió inscripciones para una maestría en IA en la Universidad de las Mujeres. Programa de 20 meses enfocado en equidad de género en el campo de la computación y la IA.',
        fuentes: [
          { url: 'https://www.municipiochihuahua.gob.mx', titulo: 'Abre Municipio inscripciones para la maestría en Inteligencia artificial en la Universidad de las Mujeres', fecha: '2026-01-30', tipo: 'comunicado_oficial', medio: 'Gobierno Municipal de Chihuahua', accesible: true },
              ],
  },
  {
        titulo: 'Sistema Nexus de IA para Seguridad (Edo. de México)',
        descripcion: 'Plataforma de seguridad basada en IA para el Mundial 2026. Reconocimiento facial y vehicular en tiempo real con bases de datos nacionales. Infraestructura inicial: 5,000 cámaras inteligentes y 111 arcos carreteros en 38 municipios, expandiéndose a 30,000 cámaras para mayo 2026.',
        fechaAnuncio: '2026-01-20',
        fechaPrometida: '2026-04-01',
        responsable: 'Secretaría de Seguridad del Estado de México',
        dependencia: 'Gobierno del Estado de México',
        fuenteOriginal: 'https://www.infobae.com',
        citaPromesa: 'Despliegue del Sistema Nexus con IA para seguridad del Mundial 2026',
        status: 'en_desarrollo',
        resumenAgente: 'El 20 de enero de 2026, el Gobierno del Estado de México presentó el Sistema Nexus, una plataforma de seguridad con IA para el Mundial 2026. Incluye reconocimiento facial y vehicular en tiempo real, con 5,000 cámaras inteligentes y 111 arcos carreteros. Operación prevista para abril 2026.',
        fuentes: [
          { url: 'https://www.infobae.com/mexico/2026/01/16/edomex-presenta-sistema-de-ia-para-identificar-a-presuntos-delincuentes-y-personas-desaparecidas-durante-el-mundial-2026/', titulo: 'Edomex presenta sistema de IA para identificar a presuntos delincuentes durante el Mundial 2026', fecha: '2026-01-16', tipo: 'nota_prensa', medio: 'Infobae', accesible: true },
              ],
  },
  {
        titulo: 'Ciclo de Conferencias en IA (Secihti)',
        descripcion: 'Secihti inauguró un ciclo permanente de conferencias en IA para posicionar la inteligencia artificial y el cómputo de alto rendimiento como ejes estratégicos para el desarrollo nacional. Enmarcado en la Red Nacional en IA y Cómputo de Alto Rendimiento.',
        fechaAnuncio: '2026-01-18',
        fechaPrometida: null,
        responsable: 'Secihti',
        dependencia: 'Secretaría de Ciencia, Humanidades, Tecnología e Innovación',
        fuenteOriginal: 'https://www.eleconomista.com.mx/arteseideas/secihti-apuesta-inteligencia-artificial-enfrentar-retos-nacionales-20260118-795833.html',
        citaPromesa: 'Ciclo permanente de conferencias en IA para el desarrollo nacional',
        status: 'operando',
        resumenAgente: 'El 18 de enero de 2026, Secihti inauguró un ciclo permanente de conferencias en IA. La primera sesión fue sobre algoritmos evolutivos multiobjetivo, impartida por el Dr. Carlos Artemio Coello Coello del Cinvestav.',
        fuentes: [
          { url: 'https://www.eleconomista.com.mx/arteseideas/secihti-apuesta-inteligencia-artificial-enfrentar-retos-nacionales-20260118-795833.html', titulo: 'Secihti apuesta por la inteligencia artificial para enfrentar retos nacionales', fecha: '2026-01-18', tipo: 'nota_prensa', medio: 'El Economista', accesible: true },
              ],
  },
  {
        titulo: 'Capacitación IA del INE',
        descripcion: 'Programa de capacitación "Inteligencia Artificial: usos y criterios en el INE" dirigido a todo el personal del instituto. Primer organismo autónomo en México en regular activamente la utilización de IA en su ámbito.',
        fechaAnuncio: '2026-01-23',
        fechaPrometida: null,
        responsable: 'Instituto Nacional Electoral',
        dependencia: 'INE',
        fuenteOriginal: 'https://www.ine.mx',
        citaPromesa: 'Capacitación institucional en uso ético y estratégico de IA',
        status: 'operando',
        resumenAgente: 'El 23 de enero de 2026, el INE lanzó su programa de capacitación en IA para consolidar el uso ético y estratégico de la tecnología en procesos internos y electorales.',
        fuentes: [
          { url: 'https://www.ine.mx', titulo: 'Capacitará INE a su personal en el uso ético y estratégico de la IA', fecha: '2026-01-23', tipo: 'comunicado_oficial', medio: 'INE', accesible: true },
              ],
  },
  {
        titulo: 'Cooperación México-Alemania con eje en IA',
        descripcion: 'Plan de Trabajo 2026-2027 entre Secretaría de Economía y Ministerio Federal de Economía y Energía de Alemania. Uno de los cuatro ejes estratégicos es "Inteligencia artificial: buenas prácticas regulatorias y su uso práctico".',
        fechaAnuncio: '2026-01-22',
        fechaPrometida: null,
        responsable: 'Secretaría de Economía',
        dependencia: 'Secretaría de Economía',
        fuenteOriginal: 'https://www.gob.mx/se',
        citaPromesa: 'Plan de trabajo bilateral con eje en IA y buenas prácticas regulatorias',
        status: 'operando',
        resumenAgente: 'El 22 de enero de 2026, la Secretaría de Economía firmó el Plan de Trabajo 2026-2027 con Alemania, que incluye la IA como uno de sus cuatro ejes estratégicos. Colaboración apoyada por la GIZ y alineada con el Plan México.',
        fuentes: [
          { url: 'https://www.gob.mx/se', titulo: 'México y Alemania fortalecen cooperación bilateral con Plan de Trabajo 2026-2027', fecha: '2026-01-22', tipo: 'comunicado_oficial', medio: 'Secretaría de Economía', accesible: true },
              ],
  },
  {
        titulo: 'Colaboración IA para Búsqueda de Personas (Guerrero)',
        descripcion: 'Colaboración entre COESPO Guerrero, UAEM y UAGro para implementar herramientas de IA en la localización e identificación de personas desaparecidas. Incluye herramientas como IdentIA (reconocimiento de tatuajes) y RAG (análisis de expedientes).',
        fechaAnuncio: '2026-01-22',
        fechaPrometida: null,
        responsable: 'Gobierno de Guerrero / COESPO',
        dependencia: 'Gobierno del Estado de Guerrero',
        fuenteOriginal: 'https://guerrero.gob.mx',
        citaPromesa: 'Implementación de herramientas de IA para búsqueda de personas desaparecidas',
        status: 'en_desarrollo',
        resumenAgente: 'El 22 de enero de 2026, el Gobierno de Guerrero formalizó una colaboración con UAEM y UAGro para usar IA en la localización de personas desaparecidas, con herramientas como IdentIA y RAG.',
        fuentes: [
          { url: 'https://guerrero.gob.mx', titulo: 'Impulsa Gobierno de Guerrero uso de IA para fortalecer la identificación humana y búsqueda de personas', fecha: '2026-01-22', tipo: 'comunicado_oficial', medio: 'Gobierno de Guerrero', accesible: true },
              ],
  },
  {
        titulo: 'Instituto de IA de la UAT (Tamaulipas)',
        descripcion: 'La Universidad Autónoma de Tamaulipas anunció la conformación de su Instituto de Inteligencia Artificial, aprobando el Manifiesto Institucional para el Uso Ético de la IA. Coordinará capacidades en IA para docencia, investigación y gestión.',
        fechaAnuncio: '2026-01-14',
        fechaPrometida: null,
        responsable: 'Universidad Autónoma de Tamaulipas',
        dependencia: 'UAT',
        fuenteOriginal: 'https://oficinadecorresponsales.wordpress.com/2026/01/14/creara-la-uat-el-instituto-de-inteligencia-artificial/',
        citaPromesa: 'Creación del Instituto de Inteligencia Artificial de la UAT',
        status: 'en_desarrollo',
        resumenAgente: 'El 14 de enero de 2026, la UAT anunció avances para su Instituto de IA. Se aprobó el Manifiesto Institucional para el Uso Ético de la IA.',
        fuentes: [
          { url: 'https://oficinadecorresponsales.wordpress.com/2026/01/14/creara-la-uat-el-instituto-de-inteligencia-artificial/', titulo: 'Creará la UAT el Instituto de Inteligencia Artificial', fecha: '2026-01-14', tipo: 'nota_prensa', medio: 'Agencia de Noticias Oficina de Corresponsales', accesible: true },
              ],
  },
  {
        titulo: 'Software IA Forense - IdentIA y RAG (Búsqueda de Personas)',
        descripcion: 'Herramientas de IA forense desarrolladas por LAB-CO en colaboración con fiscalías de Zacatecas, Quintana Roo, Chiapas y Jalisco. IdentIA se especializa en reconocimiento de tatuajes, RAG analiza expedientes masivos. Salida de fase experimental prevista para febrero 2026.',
        fechaAnuncio: '2025-12-31',
        fechaPrometida: '2026-02-28',
        responsable: 'LAB-CO / Fiscalías estatales',
        dependencia: 'LAB-CO + Gobiernos estatales',
        fuenteOriginal: 'https://www.infobae.com',
        citaPromesa: 'Herramientas de IA forense para la búsqueda de personas desaparecidas',
        status: 'en_desarrollo',
        resumenAgente: 'Dos herramientas de IA forense para personas desaparecidas: IdentIA (tatuajes) y RAG (análisis de expedientes). Desarrolladas por LAB-CO con fiscalías estatales. Saldrán de fase experimental en febrero 2026.',
        fuentes: [
          { url: 'https://www.infobae.com', titulo: 'IA forense avanza ante la crisis de desaparecidos en México: IdentIA y RAG llegarán en 2026', fecha: '2025-12-31', tipo: 'nota_prensa', medio: 'Infobae', accesible: true },
              ],
  },
  {
        titulo: 'Software IA para Detección de Cáncer de Pulmón (INER)',
        descripcion: 'El INER implementó un software de IA para apoyar la detección temprana de cáncer de pulmón y enfermedades respiratorias. Desarrollado en colaboración con AstraZeneca. Se integra al sistema de gestión de imágenes del hospital para analizar radiografías.',
        fechaAnuncio: '2026-01-15',
        fechaPrometida: null,
        responsable: 'Secretaría de Salud / INER',
        dependencia: 'Secretaría de Salud',
        fuenteOriginal: 'https://www.gob.mx/salud',
        citaPromesa: 'INER utiliza inteligencia artificial para detección temprana de cáncer de pulmón',
        status: 'operando',
        resumenAgente: 'El INER implementó software de IA con AstraZeneca para detección temprana de cáncer de pulmón, analizando radiografías y próximamente tomografías.',
        fuentes: [
          { url: 'https://www.gob.mx/salud', titulo: '006. INER utiliza inteligencia artificial para impulsar detección temprana de cáncer de pulmón', fecha: '2026-01-15', tipo: 'comunicado_oficial', medio: 'Secretaría de Salud', accesible: true },
              ],
  },
  {
        titulo: 'Capacitación Masiva en IA a Servidores Públicos (Guanajuato)',
        descripcion: 'Más de 6,000 servidores públicos de Guanajuato capacitados en IA Generativa como parte de la estrategia Guanajuato Digital, en alianza con Microsoft y la Red por la Ciberseguridad. Mayor cobertura nacional en este tipo de formación.',
        fechaAnuncio: '2026-01-04',
        fechaPrometida: null,
        responsable: 'Gobierno del Estado de Guanajuato',
        dependencia: 'Gobierno del Estado de Guanajuato',
        fuenteOriginal: 'https://boletines.guanajuato.gob.mx',
        citaPromesa: 'Capacitación masiva en IA Generativa a más de 6,000 servidores públicos',
        status: 'operando',
        resumenAgente: 'Guanajuato capacitó a más de 6,000 servidores públicos en IA Generativa con Microsoft, obteniendo reconocimiento de mayor cobertura nacional.',
        fuentes: [
          { url: 'https://boletines.guanajuato.gob.mx', titulo: 'Capacita Guanajuato a más de 6 mil personas servidoras públicas en I.A.', fecha: '2026-01-04', tipo: 'comunicado_oficial', medio: 'Gobierno de Guanajuato', accesible: true },
              ],
  },
  ];

export async function POST() {
    try {
          const db = getAdminDb();
          const results: string[] = [];

      // PARTE 1: Actualizar estatus de anuncios existentes
      for (const update of statusUpdates) {
              try {
                        await db.collection('anuncios').doc(update.id).update(update.updates);
                        results.push(`✅ Actualizado: ${update.id}`);
                        await db.collection('actividad').add({
                                    fecha: Timestamp.now(),
                                    tipo: 'actualizacion_masiva',
                                    anuncioId: update.id,
                                    descripcion: `Actualización masiva feb 2026: estatus actualizado`,
                        });
              } catch (e: any) {
                        results.push(`❌ Error actualizando ${update.id}: ${e.message}`);
              }
      }

      // PARTE 2: Agregar nuevos anuncios
      const snapshot = await db.collection('anuncios').get();
          const titulosExistentes = new Set(snapshot.docs.map(doc => doc.data().titulo));

      let insertados = 0;
          for (const anuncio of nuevosAnuncios) {
                  if (titulosExistentes.has(anuncio.titulo)) {
                            results.push(`⏭️ Ya existe: ${anuncio.titulo}`);
                            continue;
                  }

            try {
                      const ref = db.collection('anuncios').doc();
                      await ref.set({
                                  id: ref.id,
                                  titulo: anuncio.titulo,
                                  descripcion: anuncio.descripcion,
                                  fechaAnuncio: Timestamp.fromDate(new Date(anuncio.fechaAnuncio)),
                                  fechaPrometida: anuncio.fechaPrometida ? Timestamp.fromDate(new Date(anuncio.fechaPrometida)) : null,
                                  responsable: anuncio.responsable,
                                  dependencia: anuncio.dependencia,
                                  fuenteOriginal: anuncio.fuenteOriginal,
                                  citaPromesa: anuncio.citaPromesa,
                                  status: anuncio.status,
                                  resumenAgente: anuncio.resumenAgente,
                                  fuentes: anuncio.fuentes.map(f => ({
                                                ...f,
                                                fecha: Timestamp.fromDate(new Date(f.fecha)),
                                  })),
                                  actualizaciones: [],
                                  creadoManualmente: false,
                                  createdAt: Timestamp.now(),
                                  updatedAt: Timestamp.now(),
                      });
                      insertados++;
                      results.push(`✅ Nuevo: ${anuncio.titulo}`);

                    await db.collection('actividad').add({
                                fecha: Timestamp.now(),
                                tipo: 'nuevo_anuncio',
                                anuncioId: ref.id,
                                anuncioTitulo: anuncio.titulo,
                                descripcion: `Nuevo anuncio cargado: ${anuncio.titulo}`,
                    });
            } catch (e: any) {
                      results.push(`❌ Error creando ${anuncio.titulo}: ${e.message}`);
            }
          }

      return NextResponse.json({
              success: true,
              resumen: {
                        actualizados: statusUpdates.length,
                        nuevosInsertados: insertados,
                        totalNuevos: nuevosAnuncios.length,
              },
              detalle: results,
      });
    } catch (error: any) {
          console.error('Error en actualización masiva:', error);
          return NextResponse.json(
            { error: `Error en actualización masiva: ${error.message}` },
            { status: 500 }
                );
    }
}
