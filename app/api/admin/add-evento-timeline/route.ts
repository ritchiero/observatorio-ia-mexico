import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FuenteInput {
  url: string;
  titulo: string;
  fecha?: string;
  tipo?: string;
  medio?: string;
}

interface EventoInput {
  fecha: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  impacto: 'positivo' | 'neutral' | 'negativo';
  citaTextual?: string;
  responsable?: string;
  fuentes?: FuenteInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncioId, evento } = body as { anuncioId: string; evento: EventoInput };

    if (!anuncioId || !evento) {
      return NextResponse.json({ error: 'anuncioId y evento son requeridos' }, { status: 400 });
    }

    if (!evento.fecha || !evento.titulo || !evento.descripcion) {
      return NextResponse.json({ error: 'fecha, titulo y descripcion son requeridos' }, { status: 400 });
    }

    const db = getAdminDb();

    // Verificar que el anuncio existe
    const anuncioDoc = await db.collection('anuncios').doc(anuncioId).get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    // Preparar fuentes
    const fuentes = (evento.fuentes || []).map(f => ({
      url: f.url,
      titulo: f.titulo,
      fecha: f.fecha ? Timestamp.fromDate(new Date(f.fecha)) : Timestamp.now(),
      tipo: f.tipo || 'nota_prensa',
      medio: f.medio || null,
      accesible: true
    }));

    // Crear el evento
    const eventoRef = db.collection('eventos_timeline').doc();
    const eventoData = {
      id: eventoRef.id,
      anuncioId,
      fecha: Timestamp.fromDate(new Date(evento.fecha)),
      tipo: evento.tipo || 'actualizacion',
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      impacto: evento.impacto || 'neutral',
      citaTextual: evento.citaTextual || null,
      responsable: evento.responsable || null,
      fuentes,
      createdAt: Timestamp.now()
    };

    await eventoRef.set(eventoData);

    // Registrar actividad
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'actualizacion',
      anuncioId,
      anuncioTitulo: anuncioDoc.data()?.titulo,
      descripcion: `Nuevo evento agregado al timeline: ${evento.titulo}`
    });

    return NextResponse.json({
      success: true,
      message: 'Evento agregado al timeline',
      eventoId: eventoRef.id
    });

  } catch (error) {
    console.error('Error agregando evento:', error);
    return NextResponse.json({
      error: 'Error al agregar evento',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
