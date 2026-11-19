import { NextResponse } from 'next/server';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireCron } from '@/lib/auth';
import {
  getCurrentDeploymentOrigin,
  runConsolidatedAgents,
} from '@/lib/agents/run-consolidated-cron';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// Cron CONSOLIDADO (modo slow-season). Dispara todos los agentes de descubrimiento
// en una sola invocación para caber en el límite de ~2 cron jobs del plan Hobby de
// Vercel. Se ejecutan EN PARALELO: cada sub-endpoint corre en su propia función
// serverless, así el tiempo total ≈ el agente más lento, no la suma.
//
// CONTRATO (corregido 1-sep-2026): el veredicto sale del CUERPO de cada respuesta,
// no del HTTP. Los agentes no lanzan cuando fallan — devuelven `success:false` con
// HTTP 200 —, así que la versión anterior, que sólo miraba `r.ok` y devolvía
// `ok:true` incondicionalmente, reportó verde durante 20 corridas muertas.
// Lote editorial puntual. El siguiente despliegue retira este bloque una vez
// verificada la escritura. No se ejecuta en preview ni después del corte.
const CASO = {
  "id": "sup-rap-214-2026",
  "nombre": "TEPJF: IA e imagen de menores en propaganda electoral",
  "expedienteActual": "SUP-RAP-214/2026",
  "tribunalActual": "Sala Superior del Tribunal Electoral del Poder Judicial de la Federación",
  "estado": "resuelto",
  "materia": "administrativo",
  "temaIA": "deepfakes",
  "subtema": "Materia electoral · imagen y consentimiento de niñas, niños y adolescentes",
  "partes": {
    "actor": "Movimiento Ciudadano",
    "demandado": "Consejo General del Instituto Nacional Electoral"
  },
  "resumen": "La Sala Superior revocó parcialmente el Acuerdo INE/CG527/2026. Ordenó eliminar la prohibición absoluta de simular la presencia de niñas, niños y adolescentes identificables en actos proselitistas a los que no asistieron, y definir un procedimiento expreso para que puedan retirar su consentimiento al uso de su imagen modificada. No anuló el resto de los lineamientos.",
  "hechos": "El INE modificó sus lineamientos el 3 de septiembre de 2026 para regular la utilización de IA en propaganda con imágenes de menores. Movimiento Ciudadano apeló el 9 de septiembre de 2026.",
  "elementoIA": "La sentencia examina el uso de IA para alterar imágenes de menores en propaganda electoral. El retiro del consentimiento debe indicar ante quién se presenta, qué ocurre si no se retira la propaganda y cómo se acredita la eliminación de los datos.",
  "trayectoria": [
    {
      "orden": 1,
      "tribunal": "Sala Superior del TEPJF",
      "ubicacion": "Ciudad de México",
      "expediente": "SUP-RAP-214/2026",
      "tipo": "Recurso de apelación",
      "fechaIngreso": "2026-09-09",
      "fechaResolucion": "2026-11-11",
      "estado": "resuelto",
      "sentido": "Revoca parcialmente",
      "ministroPonente": "Reyes Rodríguez Mondragón"
    }
  ],
  "documentos": [
    {
      "titulo": "Sentencia SUP-RAP-214/2026",
      "tipo": "sentencia",
      "url": "https://www.te.gob.mx/portal/media/SentenciasN/pdf/Superior/SUP-RAP-0214-2026.pdf"
    }
  ],
  "fuentes": [
    {
      "titulo": "Sala Superior del TEPJF: SUP-RAP-214/2026",
      "url": "https://www.te.gob.mx/portal/media/SentenciasN/pdf/Superior/SUP-RAP-0214-2026.pdf",
      "medio": "TEPJF",
      "fecha": "2026-11-11"
    }
  ]
};
const IMAGEN = {
  "id": "imss-bienestar-equipos-imagen-ia-2026-11-11",
  "titulo": "IMSS Bienestar anuncia 193 equipos de imagen con IA",
  "descripcion": "El Plan de Consolidación del IMSS Bienestar contempla 125 mastógrafos y 68 tomógrafos de 128 cortes con IA para hospitales generales y rurales. El director general informó que la compra consolidada ya se había hecho, que la distribución iniciaba en noviembre y que un tomógrafo ya estaba instalado en el Hospital Mixto Jesús María, Nayarit. El objetivo oficial es completar la entrega del paquete de 212 equipos al 15 de febrero de 2027. La inversión anunciada de más de 5,732 millones de pesos corresponde al paquete completo, no exclusivamente a los equipos con IA.",
  "fechaAnuncio": "2026-11-11T12:00:00-06:00",
  "fechaPrometida": "2027-02-15T12:00:00-06:00",
  "responsable": "Alejandro Svarch Pérez",
  "dependencia": "IMSS Bienestar",
  "fuenteOriginal": "https://www.gob.mx/presidencia/es/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-11-de-noviembre-de-2026?idiom=es",
  "citaPromesa": "La meta es que podamos entregar hasta el último equipo, que sería el 15 de febrero",
  "status": "en_desarrollo"
};
const DECRETO = {
  "referenciaOficial": "IN_LXVI_845",
  "titulo": "Aguascalientes: uso ético y transparente de IA en la investigación",
  "proponente": "Amisadaí Manuel Castorena Romo",
  "partido": "PAN",
  "fecha": "2026-03-12T12:00:00-06:00",
  "estatus": "aprobada",
  "legislatura": "LXVI_AGS",
  "tipo": "reforma_ley_sectorial",
  "categoria": "Reforma Sectorial",
  "camara": "Congreso del Estado de Aguascalientes",
  "ambito": "Local",
  "entidadFederativa": "Aguascalientes",
  "descripcion": "El Decreto 635 reformó el artículo 73 de la Ley de Ciencia, Tecnología, Innovación y Emprendimiento para el Desarrollo de la Sociedad del Conocimiento de Aguascalientes. Exige declarar el uso de IA y verificar datos en la investigación, citar las fuentes originales con estándares internacionales y respetar la propiedad intelectual. Se aprobó el 8 de octubre de 2026, se promulgó el 5 de noviembre y se publicó el 9 de noviembre; entró en vigor al día siguiente. Prevé 180 días naturales para adecuar reglas internas y un plazo de 180 días para que la autoridad emita una guía de citación.",
  "urlGaceta": "https://eservicios2.aguascalientes.gob.mx/PeriodicoOficial/Archivos/10956.pdf#page=7",
  "urlPDF": "https://eservicios2.aguascalientes.gob.mx/PeriodicoOficial/Archivos/10956.pdf#page=7",
  "tematicas": [
    "inteligencia_artificial",
    "etica",
    "innovacion"
  ],
  "articuloSlug": "aguascalientes-decreto-635-ia-investigacion",
  "articuloResumen": "El Decreto 635 reformó el artículo 73 de la Ley de Ciencia, Tecnología, Innovación y Emprendimiento para el Desarrollo de la Sociedad del Conocimiento de Aguascalientes. Exige declarar el uso de IA y verificar datos en la investigación, citar las fuentes originales con estándares internacionales y respetar la propiedad intelectual. Se aprobó el 8 de octubre de 2026, se promulgó el 5 de noviembre y se publicó el 9 de noviembre; entró en vigor al día siguiente. Prevé 180 días naturales para adecuar reglas internas y un plazo de 180 días para que la autoridad emita una guía de citación.",
  "articuloMD": "## Qué cambió\n\nEl Decreto 635 reformó el artículo 73 de la Ley de Ciencia, Tecnología, Innovación y Emprendimiento para el Desarrollo de la Sociedad del Conocimiento de Aguascalientes. Exige declarar el uso de IA y verificar datos en la investigación, citar las fuentes originales con estándares internacionales y respetar la propiedad intelectual. Se aprobó el 8 de octubre de 2026, se promulgó el 5 de noviembre y se publicó el 9 de noviembre; entró en vigor al día siguiente. Prevé 180 días naturales para adecuar reglas internas y un plazo de 180 días para que la autoridad emita una guía de citación.\n\n## Fuente primaria\n\n[Decreto 635, Periódico Oficial de Aguascalientes, 9 de noviembre de 2026](https://eservicios2.aguascalientes.gob.mx/PeriodicoOficial/Archivos/10956.pdf#page=7)"
};

const avances = [
  {
    id: 'TfQzMmZ85J1CuJIBpvWG',
    titulo: 'Orientación con IA para el Servicio Universal de Salud',
    fecha: '2026-11-13',
    fuente: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-13-de-noviembre-de-2026',
    descripcion: 'Presidencia habló del trabajo con empresas para ofrecer orientación en salud mediante IA. La declaración no confirma una adjudicación ni el lanzamiento de la aplicación.',
  },
  {
    id: 'atdt-centro-ia-2da-convocatoria-2026-05-26',
    titulo: 'Seguimiento a la segunda generación del Centro Público de Formación en IA',
    fecha: '2026-10-16',
    fuente: 'https://www.gob.mx/sep/prensa/comunicado-conjunto-19-centro-publico-de-formacion-en-ia-reune-a-estudiantes-y-empresas-para-compartir-conocimientos-y-oportunidades',
    descripcion: 'La SEP reportó 23 mil jóvenes en la segunda generación en distintas especialidades. Son participantes, no egresados, y la cifra es distinta de los 30 mil lugares ofrecidos.',
  },
] as const;

const FABRICA_ID = 'Aoq8rFjRaXu9VNcvBjtC';
const normalizar = (valor: unknown) =>
  String(valor ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const fechaEditorial = (dia: string) => Timestamp.fromDate(new Date(dia + 'T18:00:00.000Z'));

async function publicarLoteEditorial() {
  if (process.env.VERCEL_ENV !== 'production' || Date.now() >= Date.parse('2026-11-22T00:00:00Z')) return;

  const db = getAdminDb();
  const lote = db.collection('migraciones_editoriales').doc('barrido-2026-11-19');
  const casos = db.collection('casos_ia');
  const anuncios = db.collection('anuncios');
  const iniciativas = db.collection('iniciativas');
  const casoRef = casos.doc(CASO.id);
  const imagenRef = anuncios.doc(IMAGEN.id);
  const decretoRef = iniciativas.doc('ags-lxvi-845');
  const fabricaRef = anuncios.doc(FABRICA_ID);
  const eventoRefs = avances.map(a => anuncios.doc(a.id));

  await db.runTransaction(async tx => {
    if ((await tx.get(lote)).exists) return;

    const [casosActuales, anunciosActuales, leyesActuales, fichas] = await Promise.all([
      tx.get(casos.select('expedienteActual', 'nombre')),
      tx.get(anuncios.select('titulo', 'descripcion')),
      tx.get(iniciativas.select('titulo', 'referenciaOficial', 'urlPDF', 'proponente', 'entidadFederativa')),
      tx.getAll(fabricaRef, ...eventoRefs),
    ]);
    const fecha = Timestamp.now();
    const publicados: string[] = [];

    if (!casosActuales.docs.some(doc =>
      doc.id === casoRef.id ||
      normalizar([doc.get('expedienteActual'), doc.get('nombre')].join(' ')).replace(/[^a-z0-9]/g, '').includes('suprap2142026')
    )) {
      tx.create(casoRef, { ...CASO, fechaCreacion: fecha, fechaActualizacion: fecha });
      publicados.push(casoRef.path);
    }

    if (!anunciosActuales.docs.some(doc => {
      const texto = normalizar([doc.get('titulo'), doc.get('descripcion')].join(' '));
      return doc.id === imagenRef.id || (/imss[ -]bienestar/.test(texto) && /mastograf/.test(texto) && /tomograf/.test(texto));
    })) {
      tx.create(imagenRef, {
        ...IMAGEN,
        fechaAnuncio: fechaEditorial('2026-11-11'),
        fechaPrometida: fechaEditorial('2027-02-15'),
        fuentes: [{ url: IMAGEN.fuenteOriginal, titulo: 'Presidencia: conferencia del 11 de noviembre de 2026', fecha: fechaEditorial('2026-11-11'), tipo: 'anuncio_original' }],
        actualizaciones: [],
        creadoManualmente: true,
        createdAt: fecha,
        updatedAt: fecha,
      });
      publicados.push(imagenRef.path);
    }

    if (!leyesActuales.docs.some(doc => {
      const datos = doc.data();
      return doc.id === decretoRef.id || datos.referenciaOficial === DECRETO.referenciaOficial ||
        datos.urlPDF === DECRETO.urlPDF ||
        (normalizar(datos.entidadFederativa) === 'aguascalientes' &&
         /decreto 635|inteligencia artificial|articulo 73/.test(normalizar(datos.titulo)) &&
         (/decreto 635/.test(normalizar(datos.titulo)) || /castorena/.test(normalizar(datos.proponente))));
    })) {
      tx.create(decretoRef, {
        ...DECRETO,
        fecha: fechaEditorial('2026-03-12'),
        fechaPublicacion: fechaEditorial('2026-11-09'),
        fechaVigencia: fechaEditorial('2026-11-10'),
        eventos: [
          { fecha: fechaEditorial('2026-03-12'), tipo: 'presentacion', descripcion: 'Presentación de la iniciativa IN_LXVI_845.' },
          { fecha: fechaEditorial('2026-10-08'), tipo: 'aprobacion', descripcion: 'Aprobación por el Congreso local.' },
          { fecha: fechaEditorial('2026-11-09'), tipo: 'publicacion', descripcion: 'Publicación del Decreto 635 en el Periódico Oficial.', fuente: DECRETO.urlPDF },
        ],
        estadoVerificacion: 'verificado',
        createdAt: fecha,
        updatedAt: fecha,
      });
      publicados.push(decretoRef.path);
    }

    const fabrica = fichas[0];
    const textoPrevio = fabrica.get('descripcion');
    const fraseAnterior = 'consistente en un equipo de cien especialistas';
    if (fabrica.exists && !fabrica.get('oculto') && typeof textoPrevio === 'string' && textoPrevio.includes(fraseAnterior)) {
      tx.update(fabricaRef, {
        descripcion: textoPrevio.replace(fraseAnterior, 'anunciada con una meta de cien especialistas') +
          ' En octubre de 2026, la ATDT reportó que la Fábrica operaba con un equipo de 20 especialistas.',
        updatedAt: fecha,
      });
      publicados.push(fabricaRef.path);
    }

    for (const [i, avance] of avances.entries()) {
      const ficha = fichas[i + 1];
      if (!ficha.exists || ficha.get('oculto')) continue;
      const actualizaciones = ficha.get('actualizaciones');
      const fuentes = ficha.get('fuentes');
      const historial: DocumentData[] = Array.isArray(actualizaciones) ? actualizaciones : [];
      const referencias: DocumentData[] = Array.isArray(fuentes) ? fuentes : [];
      if (historial.some(a => a?.fuente === avance.fuente)) continue;
      tx.update(ficha.ref, {
        actualizaciones: [...historial, { fecha: fechaEditorial(avance.fecha), descripcion: avance.descripcion, fuente: avance.fuente, cambioStatus: false }],
        fuentes: referencias.some(f => f?.url === avance.fuente)
          ? referencias
          : [...referencias, { url: avance.fuente, titulo: avance.titulo, fecha: fechaEditorial(avance.fecha), tipo: 'comunicado_oficial' }],
        updatedAt: fecha,
      });
      publicados.push(ficha.ref.path);
    }

    if (publicados.length) {
      tx.create(db.collection('actividad').doc('lote-editorial-2026-11-19'), {
        fecha, tipo: 'correccion',
        descripcion: `Lote editorial del 19 de noviembre: ${publicados.length} fichas creadas o actualizadas con fuentes oficiales.`,
      });
    }
    tx.create(lote, { fecha, publicados });
  });
}

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  try {
    await publicarLoteEditorial();
  } catch (editorialError) {
    console.error('[CRON todo] No se pudo publicar el lote editorial 2026-11-19:', editorialError);
  }

  // Mantener todas las subejecuciones en el mismo deployment que recibió la
  // llamada. Esto permite probar un preview sin terminar ejecutando el código
  // de producción por culpa de NEXT_PUBLIC_SITE_URL.
  const base = getCurrentDeploymentOrigin(request.url);
  const secret = process.env.CRON_SECRET;

  // requireCron ya falla cerrado si el secreto no existe.
  const result = await runConsolidatedAgents(base, secret!);

  // SIEMPRE registrar evidencia de la corrida consolidada, incluso si alguna sub-ruta falló
  try {
    const db = await import('@/lib/firebase-admin').then(m => m.getAdminDb());
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: result.ok ? 'agente_ejecutado' : 'agente_parcial',
      descripcion: result.ok
        ? `Corrida consolidada ejecutada exitosamente. Agentes: ${result.agentes.join(', ')}.`
        : `Corrida consolidada completada con fallos. Resultados: ${result.resultados.map(r => `${r.agente}=${r.ok ? 'OK' : r.error || 'FAIL'}`).join(', ')}.`,
    });
  } catch (activityError) {
    console.error('[CRON todo] No se pudo registrar la corrida consolidada en actividad:', activityError);
  }

  return NextResponse.json(
    result,
    { status: result.ok ? 200 : 502 },
  );
}
