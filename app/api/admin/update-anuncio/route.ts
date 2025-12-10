import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Fuente, FuenteTipo } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UpdateAnuncioRequest {
  adminKey: string;
  anuncioId: string;
  fuentes?: Array<{
    url: string;
    titulo: string;
    fecha: string; // ISO date string
    tipo: FuenteTipo;
    accesible?: boolean;
    waybackUrl?: string;
    extracto?: string;
  }>;
  resumenAgente?: string;
}

export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body: UpdateAnuncioRequest = await request.json();
    const { adminKey, anuncioId, fuentes, resumenAgente } = body;
    
    // Verificar admin key
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!anuncioId) {
      return NextResponse.json({ error: 'anuncioId is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    
    // Verificar que el anuncio existe
    const anuncioDoc = await anuncioRef.get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio not found' }, { status: 404 });
    }

    // Preparar datos para actualizar
    const updateData: any = {
      updatedAt: Timestamp.now()
    };

    // Convertir fuentes a formato Firestore
    if (fuentes && fuentes.length > 0) {
      updateData.fuentes = fuentes.map(f => ({
        url: f.url,
        titulo: f.titulo,
        fecha: Timestamp.fromDate(new Date(f.fecha)),
        tipo: f.tipo,
        accesible: f.accesible ?? null,
        waybackUrl: f.waybackUrl || null,
        extracto: f.extracto || null
      }));
    }

    // Agregar resumen del agente si se proporciona
    if (resumenAgente !== undefined) {
      updateData.resumenAgente = resumenAgente;
    }

    // Actualizar el documento
    await anuncioRef.update(updateData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Anuncio actualizado correctamente',
      anuncioId,
      updated: {
        fuentes: fuentes?.length || 0,
        resumenAgente: !!resumenAgente
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar anuncio:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar anuncio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
