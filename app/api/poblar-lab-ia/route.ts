import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Endpoint para poblar el timeline del Laboratorio de IA con la investigación completa
export async function GET() {
  try {
    const anuncioId = 'UfSnLrpDhXrNnqy0BKC1';
    const db = getAdminDb();
    
    // 1. Actualizar el anuncio con las fuentes y nuevo status
    const fuentes = [
      {
        url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-15-de-abril-de-2025',
        titulo: 'Versión estenográfica: Conferencia de prensa - 15 de abril 2025',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'anuncio_original',
        medio: 'Gobierno de México',
        accesible: true
      },
      {
        url: 'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
        titulo: 'Sheinbaum anuncia Laboratorio Nacional de Inteligencia Artificial',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'nota_prensa',
        medio: 'Infobae',
        accesible: true
      },
      {
        url: 'https://www.eluniversal.com.mx/nacion/sheinbaum-alista-laboratorio-nacional-de-inteligencia-artificial-gabinete-va-por-incorporacion-de-la-ia/',
        titulo: 'Sheinbaum alista Laboratorio Nacional de IA; gabinete va por incorporación de la IA',
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'nota_prensa',
        medio: 'El Universal',
        accesible: true
      },
      {
        url: 'https://www.jornada.com.mx/noticia/2025/07/30/ciencias/presentaran-laboratorio-de-ia-para-impulsar-investigacion-y-desarrollo-de-la-tecnologia',
        titulo: 'Presentarán laboratorio de IA para impulsar investigación y desarrollo',
        fecha: Timestamp.fromDate(new Date('2025-07-30')),
        tipo: 'nota_prensa',
        medio: 'La Jornada',
        accesible: true
      },
      {
        url: 'https://www.elfinanciero.com.mx/salud/2025/10/06/que-sabemos-del-laboratorio-nacional-de-inteligencia-artificial-y-como-ayudaria-para-detectar-el-cancer/',
        titulo: 'Qué sabemos del Laboratorio Nacional de IA y cómo ayudaría para detectar el cáncer',
        fecha: Timestamp.fromDate(new Date('2025-10-06')),
        tipo: 'nota_prensa',
        medio: 'El Financiero',
        accesible: true
      },
      {
        url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-centro-publico-de-formacion-en-inteligencia-artificial',
        titulo: 'Versión estenográfica: Centro Público de Formación en IA',
        fecha: Timestamp.fromDate(new Date('2025-11-06')),
        tipo: 'anuncio_original',
        medio: 'Gobierno de México',
        accesible: true
      }
    ];

    // Actualizar anuncio con fuentes y cambiar status a en_desarrollo
    await db.collection('anuncios').doc(anuncioId).update({
      fuentes,
      status: 'en_desarrollo',
      resumenAgente: 'El proyecto evolucionó de anuncio a implementación parcial. En noviembre 2025 se inauguró el Centro Público de Formación en IA como componente del laboratorio, con instalaciones en 10 ciudades y objetivo de formar 25,000 egresados. No se ha publicado decreto formal en el DOF, pero hay avances concretos en colaboración con UNAM, IPN, TecNM e Infotec.',
      updatedAt: Timestamp.now()
    });

    // 2. Crear eventos del timeline
    const eventos = [
      // Abril 2025 - Anuncio inicial
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-04-15')),
        tipo: 'anuncio_inicial',
        titulo: 'Anuncio oficial del Laboratorio Nacional de IA',
        descripcion: 'La presidenta Claudia Sheinbaum anunció la creación del Laboratorio Nacional de Inteligencia Artificial, coordinado por la Agencia Digital de Innovación Pública y Secihti. El proyecto enfocará en colaboración interdisciplinaria para sismología, meteorología y medicina.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-15-de-abril-de-2025',
            titulo: 'Conferencia de prensa presidencial',
            fecha: Timestamp.fromDate(new Date('2025-04-15')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          },
          {
            url: 'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
            titulo: 'Sheinbaum anuncia Laboratorio Nacional de IA',
            fecha: Timestamp.fromDate(new Date('2025-04-15')),
            tipo: 'nota_prensa',
            medio: 'Infobae'
          }
        ],
        citaTextual: 'Lo que sí es que planteamos hacer el Laboratorio Nacional de Inteligencia Artificial, se lo encargué a la Agencia Digital junto con la Secihti en la idea de que sean distintos investigadores de distintas áreas.',
        responsable: 'Claudia Sheinbaum',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      // Junio 2025
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-06-11')),
        tipo: 'progreso',
        titulo: 'Detalles de colaboración internacional revelados',
        descripcion: 'Se reporta que el laboratorio será un nodo de colaboración interdisciplinaria e interinstitucional, con participación de expertos internacionales y nacionales. Enfoque en soberanía tecnológica.',
        fuentes: [
          {
            url: 'https://karine.ai/laboratorio-nacional-de-inteligencia-artificial-en-mexico/',
            titulo: 'Laboratorio Nacional de IA en México',
            fecha: Timestamp.fromDate(new Date('2025-06-11')),
            tipo: 'nota_prensa',
            medio: 'Karine.ai'
          }
        ],
        citaTextual: 'México tendrá su propio Laboratorio Nacional de Inteligencia Artificial (LNIA)... El laboratorio será un nodo de colaboración interdisciplinaria e interinstitucional.',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      // Julio 2025
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-07-11')),
        tipo: 'progreso',
        titulo: 'Avances en desarrollo y múltiples dimensiones',
        descripcion: 'Se revela que el laboratorio tiene muchas aristas: educación, desarrollo tecnológico y programas abiertos. Coordinado por Pepe Merino y Secihti.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/es/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-11-de-julio-de-2025',
            titulo: 'Conferencia de prensa - 11 julio',
            fecha: Timestamp.fromDate(new Date('2025-07-11')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          }
        ],
        citaTextual: 'El objetivo es crear el Laboratorio Nacional de Inteligencia Artificial, que tiene muchas aristas: tiene que ver con educación, tiene que ver con desarrollo tecnológico.',
        responsable: 'Claudia Sheinbaum',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-07-29')),
        tipo: 'progreso',
        titulo: 'Anuncio de presentación próxima con instituciones superiores',
        descripcion: 'La presidenta anuncia que presentarán muy pronto el laboratorio, incorporando distintas instituciones de educación superior.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-29-de-julio-de-2025',
            titulo: 'Conferencia de prensa - 29 julio',
            fecha: Timestamp.fromDate(new Date('2025-07-29')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          },
          {
            url: 'https://www.jornada.com.mx/noticia/2025/07/30/ciencias/presentaran-laboratorio-de-ia-para-impulsar-investigacion-y-desarrollo-de-la-tecnologia',
            titulo: 'Presentarán laboratorio de IA',
            fecha: Timestamp.fromDate(new Date('2025-07-30')),
            tipo: 'nota_prensa',
            medio: 'La Jornada'
          }
        ],
        citaTextual: 'Les vamos a presentar muy pronto el Laboratorio Nacional de Inteligencia Artificial, donde se incorporan distintas instituciones de educación superior.',
        responsable: 'Claudia Sheinbaum',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      // Agosto 2025
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-08-22')),
        tipo: 'actualizacion',
        titulo: 'Coordinación con académicos y gobierno en curso',
        descripcion: 'Se reporta trabajo conjunto entre instituciones académicas y gobierno, coordinado por Pepe Merino, con objetivos en digitalización.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-22-de-agosto-de-2025',
            titulo: 'Conferencia de prensa - 22 agosto',
            fecha: Timestamp.fromDate(new Date('2025-08-22')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          }
        ],
        citaTextual: 'Estamos trabajando en una iniciativa... el Laboratorio Nacional de Inteligencia Artificial, que es un esfuerzo con instituciones académicas y las instituciones de gobierno.',
        impacto: 'neutral',
        createdAt: Timestamp.now()
      },
      // Septiembre 2025
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-09-05')),
        tipo: 'progreso',
        titulo: 'Iniciativa completa esperada para octubre',
        descripcion: 'La presidenta anuncia que la iniciativa tendrá varias aristas incluyendo formación, lenguaje mexicano y regulación, y estará completa en octubre.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-5-de-septiembre-de-2025',
            titulo: 'Conferencia de prensa - 5 septiembre',
            fecha: Timestamp.fromDate(new Date('2025-09-05')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          },
          {
            url: 'https://cirt.mx/avanza-la-iniciativa-del-laboratorio-nacional-de-inteligencia-artificial-claudia-sheinbaum/',
            titulo: 'Avanza la iniciativa del Laboratorio',
            fecha: Timestamp.fromDate(new Date('2025-09-05')),
            tipo: 'nota_prensa',
            medio: 'CIRT'
          }
        ],
        citaTextual: 'Yo pienso que, en octubre, ya vamos a tener completa la iniciativa.',
        responsable: 'Claudia Sheinbaum',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      // Octubre 2025
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-10-06')),
        tipo: 'progreso',
        titulo: 'Revelados ejes de trabajo: salud, desastres, energía',
        descripcion: 'Se dan a conocer los ejes principales: prevención de desastres, salud (detección de cáncer), y energía. Enfoque en soberanía digital y diagnóstico temprano.',
        fuentes: [
          {
            url: 'https://www.elfinanciero.com.mx/salud/2025/10/06/que-sabemos-del-laboratorio-nacional-de-inteligencia-artificial-y-como-ayudaria-para-detectar-el-cancer/',
            titulo: 'Qué sabemos del Laboratorio y cómo ayudaría para detectar el cáncer',
            fecha: Timestamp.fromDate(new Date('2025-10-06')),
            tipo: 'nota_prensa',
            medio: 'El Financiero'
          },
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-06-de-octubre-de-2025',
            titulo: 'Conferencia de prensa - 6 octubre',
            fecha: Timestamp.fromDate(new Date('2025-10-06')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          }
        ],
        citaTextual: 'El Laboratorio Nacional de Inteligencia Artificial tendrá un enfoque en salud con objetivos como la detección oportuna del cáncer de mama.',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      },
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-10-23')),
        tipo: 'actualizacion',
        titulo: 'Coordinación activa en investigación y regulación',
        descripcion: 'Se confirma que Pepe Merino coordina el laboratorio con áreas en investigación y regulación, incluyendo temas como doblajes.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-conferencia-de-prensa-de-la-presidenta-claudia-sheinbaum-pardo-del-23-de-octubre-de-2025',
            titulo: 'Conferencia de prensa - 23 octubre',
            fecha: Timestamp.fromDate(new Date('2025-10-23')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          }
        ],
        citaTextual: 'Estamos trabajando, está coordinándolo Pepe Merino en esto que llamamos el "Laboratorio Nacional de Inteligencia Artificial".',
        responsable: 'Claudia Sheinbaum',
        impacto: 'neutral',
        createdAt: Timestamp.now()
      },
      // Noviembre 2025 - Inauguración
      {
        anuncioId,
        fecha: Timestamp.fromDate(new Date('2025-11-06')),
        tipo: 'cumplimiento',
        titulo: 'Inauguración del Centro Público de Formación en IA',
        descripcion: 'Se inaugura el Centro Público de Formación en IA como componente del Laboratorio Mexicano de IA. Instalaciones en 10 ciudades con Infotec, TecNM, Secihti e IPN. Objetivo: formar 25,000 egresados y democratizar la educación en IA.',
        fuentes: [
          {
            url: 'https://www.gob.mx/presidencia/articulos/version-estenografica-centro-publico-de-formacion-en-inteligencia-artificial',
            titulo: 'Versión estenográfica: Centro Público de Formación en IA',
            fecha: Timestamp.fromDate(new Date('2025-11-06')),
            tipo: 'anuncio_original',
            medio: 'Gobierno de México'
          },
          {
            url: 'https://www.facebook.com/ClaraBrugadaM/posts/1379690273518499',
            titulo: 'Inauguración en Tecnológico de Tláhuac',
            fecha: Timestamp.fromDate(new Date('2025-11-06')),
            tipo: 'nota_prensa',
            medio: 'Facebook'
          }
        ],
        citaTextual: 'Lo que hoy anunciamos forma parte de algo que la Presidenta ya ha tenido oportunidad de adelantar, que es el Laboratorio Mexicano de Inteligencia Artificial.',
        responsable: 'Claudia Sheinbaum',
        impacto: 'positivo',
        createdAt: Timestamp.now()
      }
    ];

    // Eliminar eventos existentes del timeline para este anuncio
    const existingEvents = await db.collection('eventos_timeline').where('anuncioId', '==', anuncioId).get();
    const deletePromises = existingEvents.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Crear nuevos eventos
    for (const evento of eventos) {
      const eventoRef = db.collection('eventos_timeline').doc();
      await eventoRef.set({
        id: eventoRef.id,
        ...evento
      });
    }

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'actualizacion',
      anuncioId,
      anuncioTitulo: 'Laboratorio Nacional de Inteligencia Artificial',
      descripcion: 'Timeline poblado con investigación completa: 10 eventos desde abril a noviembre 2025'
    });

    return NextResponse.json({
      success: true,
      message: 'Timeline del Laboratorio de IA poblado exitosamente',
      fuentes: fuentes.length,
      eventos: eventos.length,
      statusActualizado: 'en_desarrollo'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Error al poblar timeline',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
