import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST() {
  try {
    const iniciativaData = {
      id: 'iniciativa-81',
      titulo: 'Reforma al Código Penal de San Luis Potosí - Uso indebido de IA para provocar alarma social',
      descripcion: 'Primera ley estatal aprobada en México que penaliza el uso de IA para crear deepfakes, difundir desinformación y manipular instituciones. Adiciona los artículos 187 TER (deepfakes personales, 1-3 años prisión), 272 BIS (desinformación, 2-5 años) y 272 TER (manipulación institucional, 3-6 años) al Código Penal estatal. Incluye excepciones para periodismo, academia, arte, parodia y crítica política.',
      proponente: 'Comisión Primera de Justicia del Congreso de San Luis Potosí (Presidenta: Leticia Vázquez Hernández)',
      partido: 'Pluripartidista',
      fecha: '2025-11-14',
      estatus: 'Aprobada',
      legislatura: 'LXIV_SLP',
      camara: 'Local',
      categoria: 'Ley Aprobada',
      tipo: 'reforma_codigo_penal',
      temas: ['Deepfakes y Contenido', 'Seguridad y Delitos'],
      urlGaceta: 'https://congresosanluis.gob.mx/content/aprobada-reforma-para-sancionar-uso-indebido-de-inteligencia-artificial',
      urlPDF: 'http://congresosanluis.gob.mx/sites/default/files/unpload/legislacion/codigos/2025/11/Codigo_Penal_Estado%20%28al%2025%20de%20noviembre%20de%20%202025%29..pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Agregar a Firestore
    await db.collection('iniciativas').doc('iniciativa-81').set(iniciativaData);

    return NextResponse.json({
      success: true,
      message: 'Ley de SLP agregada como iniciativa-81',
      data: iniciativaData
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
