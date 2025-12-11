import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const db: Firestore = getAdminDb();
    const snapshot = await db.collection('casos_ia').orderBy('fechaInicio', 'desc').get();
    
    const casos = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || '',
        tribunal: data.tribunal || '',
        materia: data.materia || '',
        temaIA: data.temaIA || '',
        partes: data.partes || {},
        resumen: data.resumen || '',
        fechaInicio: data.fechaInicio?.toDate?.()?.toISOString() || data.fechaInicio || '',
        fechaResolucion: data.fechaResolucion?.toDate?.()?.toISOString() || data.fechaResolucion || null,
        estado: data.estado || 'en_proceso',
        resolucion: data.resolucion || null,
        relevancia: data.relevancia || '',
        documentos: data.documentos || [],
      };
    });

    return NextResponse.json({ 
      success: true, 
      casos,
      count: casos.length 
    });
  } catch (error) {
    console.error('[API] Error fetching casos-ia:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching casos', casos: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db: Firestore = getAdminDb();
    const body = await request.json();
    const { caso } = body;

    if (!caso || !caso.nombre) {
      return NextResponse.json(
        { success: false, error: 'Nombre del caso es requerido' },
        { status: 400 }
      );
    }

    const docRef = await db.collection('casos_ia').add({
      ...caso,
      fechaInicio: caso.fechaInicio ? new Date(caso.fechaInicio) : new Date(),
      fechaResolucion: caso.fechaResolucion ? new Date(caso.fechaResolucion) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Caso creado exitosamente' 
    });
  } catch (error) {
    console.error('[API] Error creating caso:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating caso' },
      { status: 500 }
    );
  }
}
