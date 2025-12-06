import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const datosIniciales = [
  {
    titulo: 'Laboratorio Nacional de IA',
    descripcion: 'Prometido para octubre. Sin decreto ni estructura.',
    fechaAnuncio: '2025-04-01',
    fechaPrometida: '2025-10-01',
    responsable: 'Claudia Sheinbaum',
    dependencia: 'Presidencia',
    fuenteOriginal: 'https://www.gob.mx/presidencia',
    citaPromesa: 'Se creará el Laboratorio Nacional de IA para octubre de 2025',
    status: 'incumplido' as const,
  },
  {
    titulo: 'Modelo de lenguaje propio (KAL)',
    descripcion: 'Presentado en nov. como "KAL". Sin docs técnicos ni código público.',
    fechaAnuncio: '2025-07-01',
    fechaPrometida: null,
    responsable: 'Marcelo Ebrard',
    dependencia: 'Secretaría de Economía',
    fuenteOriginal: 'https://www.gob.mx/se',
    citaPromesa: 'México desarrollará su propio modelo de lenguaje de IA',
    status: 'en_desarrollo' as const,
  },
  {
    titulo: 'Plataforma México IA+',
    descripcion: 'Evento realizado. Sin productos concretos.',
    fechaAnuncio: '2025-07-15',
    fechaPrometida: null,
    responsable: 'Secretaría de Economía',
    dependencia: 'Economía + CCE',
    fuenteOriginal: 'https://www.gob.mx/se',
    citaPromesa: 'Lanzamiento de plataforma México IA+ para impulsar la innovación',
    status: 'prometido' as const,
  },
  {
    titulo: 'Inversión CloudHQ $4.8B USD',
    descripcion: 'Anunciado. En planeación.',
    fechaAnuncio: '2025-09-01',
    fechaPrometida: '2026-06-01',
    responsable: 'Claudia Sheinbaum / Marcelo Ebrard',
    dependencia: 'Presidencia',
    fuenteOriginal: 'https://www.gob.mx/presidencia',
    citaPromesa: 'Inversión de $4.8 mil millones de dólares en infraestructura de nube',
    status: 'prometido' as const,
  },
  {
    titulo: 'Marco normativo de IA',
    descripcion: 'Propuesta publicada. Sin aprobación.',
    fechaAnuncio: '2025-10-01',
    fechaPrometida: null,
    responsable: 'Senado de la República',
    dependencia: 'Senado',
    fuenteOriginal: 'https://www.senado.gob.mx',
    citaPromesa: 'Se presentará marco normativo para regular la inteligencia artificial',
    status: 'prometido' as const,
  },
  {
    titulo: 'Centro Público de Formación en IA',
    descripcion: 'Convocatoria cerrada. Clases inician enero 2026.',
    fechaAnuncio: '2025-11-01',
    fechaPrometida: '2026-01-15',
    responsable: 'ATDT + Infotec + TecNM',
    dependencia: 'ATDT',
    fuenteOriginal: 'https://www.gob.mx/agendadigital',
    citaPromesa: 'Centro de formación pública en IA con inicio de clases en enero 2026',
    status: 'en_desarrollo' as const,
  },
  {
    titulo: 'KAL (LLM mexicano)',
    descripcion: 'Presentado sin benchmarks, código ni documentación.',
    fechaAnuncio: '2025-11-15',
    fechaPrometida: null,
    responsable: 'Saptiva + Economía',
    dependencia: 'Secretaría de Economía',
    fuenteOriginal: 'https://www.gob.mx/se',
    citaPromesa: 'Presentación oficial del modelo de lenguaje mexicano KAL',
    status: 'en_desarrollo' as const,
  },
  {
    titulo: 'Supercomputadora Coatlicue',
    descripcion: 'Construcción iniciará 2026. Operación estimada: 2028.',
    fechaAnuncio: '2025-11-20',
    fechaPrometida: '2028-01-01',
    responsable: 'Claudia Sheinbaum + ATDT',
    dependencia: 'Presidencia',
    fuenteOriginal: 'https://www.gob.mx/presidencia',
    citaPromesa: 'Construcción de supercomputadora nacional Coatlicue',
    status: 'prometido' as const,
  },
  {
    titulo: 'Regulación regional IA (APEC)',
    descripcion: 'Propuesta diplomática. Sin acuerdo vinculante.',
    fechaAnuncio: '2025-11-25',
    fechaPrometida: null,
    responsable: 'Marcelo Ebrard',
    dependencia: 'Secretaría de Economía',
    fuenteOriginal: 'https://www.gob.mx/se',
    citaPromesa: 'México propondrá regulación regional de IA en foro APEC',
    status: 'prometido' as const,
  },
  {
    titulo: '15 carreras de bachillerato con IA',
    descripcion: 'Aprobadas. Implementación: próximo ciclo escolar.',
    fechaAnuncio: '2025-12-01',
    fechaPrometida: '2026-08-01',
    responsable: 'SEP',
    dependencia: 'Secretaría de Educación Pública',
    fuenteOriginal: 'https://www.gob.mx/sep',
    citaPromesa: 'Aprobación de 15 nuevas carreras de bachillerato con enfoque en IA',
    status: 'prometido' as const,
  },
];

// POST /api/seed - Cargar datos iniciales
export async function POST() {
  try {
    const db = getAdminDb();

    // Verificar si ya hay datos
    const snapshot = await db.collection('anuncios').limit(1).get();
    if (!snapshot.empty) {
      return NextResponse.json(
        { error: 'Ya existen datos en la base de datos. Elimina los datos existentes primero.' },
        { status: 400 }
      );
    }

    // Insertar datos iniciales
    let insertados = 0;
    for (const dato of datosIniciales) {
      const anuncioRef = db.collection('anuncios').doc();
      await anuncioRef.set({
        id: anuncioRef.id,
        titulo: dato.titulo,
        descripcion: dato.descripcion,
        fechaAnuncio: Timestamp.fromDate(new Date(dato.fechaAnuncio)),
        fechaPrometida: dato.fechaPrometida 
          ? Timestamp.fromDate(new Date(dato.fechaPrometida))
          : null,
        responsable: dato.responsable,
        dependencia: dato.dependencia,
        fuenteOriginal: dato.fuenteOriginal,
        citaPromesa: dato.citaPromesa,
        status: dato.status,
        actualizaciones: [],
        creadoManualmente: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Registrar actividad
      await db.collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: 'nuevo_anuncio',
        anuncioId: anuncioRef.id,
        anuncioTitulo: dato.titulo,
        descripcion: `Anuncio inicial cargado: ${dato.titulo}`,
      });

      insertados++;
    }

    return NextResponse.json({
      success: true,
      message: `${insertados} anuncios iniciales cargados exitosamente`,
    });
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
    return NextResponse.json(
      { error: 'Error al cargar datos iniciales' },
      { status: 500 }
    );
  }
}
