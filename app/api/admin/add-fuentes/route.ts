import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { FuenteTipo } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AddFuentesRequest {
  adminKey: string;
  anuncioId: string;
  fuentes: Array<{
    url: string;
    titulo: string;
    fecha: string; // ISO date string
    tipo: FuenteTipo;
    medio?: string;
    accesible?: boolean;
    extracto?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddFuentesRequest = await request.json();
    const { adminKey, anuncioId, fuentes } = body;
    
    // Verificar admin key
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!anuncioId || !fuentes || fuentes.length === 0) {
      return NextResponse.json({ error: 'anuncioId y fuentes son requeridos' }, { status: 400 });
    }

    const db = getAdminDb();
    const anuncioRef = db.collection('anuncios').doc(anuncioId);
    
    // Obtener anuncio existente
    const anuncioDoc = await anuncioRef.get();
    if (!anuncioDoc.exists) {
      return NextResponse.json({ error: 'Anuncio not found' }, { status: 404 });
    }

    const anuncioData = anuncioDoc.data();
    const fuentesExistentes = anuncioData?.fuentes || [];

    // Convertir nuevas fuentes a formato Firestore
    const nuevasFuentes = fuentes.map(f => ({
      url: f.url,
      titulo: f.titulo,
      fecha: Timestamp.fromDate(new Date(f.fecha)),
      tipo: f.tipo,
      medio: f.medio || null,
      accesible: f.accesible ?? true,
      extracto: f.extracto || null
    }));

    // Filtrar duplicados por URL
    const urlsExistentes = new Set(fuentesExistentes.map((f: { url: string }) => f.url));
    const fuentesSinDuplicar = nuevasFuentes.filter(f => !urlsExistentes.has(f.url));

    if (fuentesSinDuplicar.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'Todas las fuentes ya existían',
        agregadas: 0
      });
    }

    // Combinar fuentes existentes con nuevas
    const todasLasFuentes = [...fuentesExistentes, ...fuentesSinDuplicar];

    // Actualizar el documento
    await anuncioRef.update({
      fuentes: todasLasFuentes,
      updatedAt: Timestamp.now()
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Se agregaron ${fuentesSinDuplicar.length} fuentes`,
      agregadas: fuentesSinDuplicar.length,
      total: todasLasFuentes.length
    });
    
  } catch (error) {
    console.error('Error al agregar fuentes:', error);
    return NextResponse.json({ 
      error: 'Error al agregar fuentes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
