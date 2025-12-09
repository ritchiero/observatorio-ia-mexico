import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminDb();
    
    const iniciativaData = {
      titulo: 'Reforma al Código Penal de San Luis Potosí - Uso indebido de IA para provocar alarma social',
      descripcion: 'Primera ley estatal aprobada en México que penaliza el uso de IA para crear deepfakes, difundir desinformación y manipular instituciones. Adiciona los artículos 187 TER (deepfakes personales, 1-3 años prisión), 272 BIS (desinformación, 2-5 años) y 272 TER (manipulación institucional, 3-6 años) al Código Penal estatal. Incluye excepciones para periodismo, academia, arte, parodia y crítica política.',
      proponente: 'Comisión Primera de Justicia del Congreso de San Luis Potosí (Presidenta: Leticia Vázquez Hernández)',
      partido: 'Pluripartidista',
      fecha: Timestamp.fromDate(new Date('2025-11-14T04:00:00.000Z')),
      estatus: 'Aprobada',
      legislatura: 'LXIV_SLP',
      camara: 'Local',
      categoria: 'Ley Aprobada',
      tipo: 'reforma_codigo_penal',
      temas: ['Deepfakes y Contenido', 'Seguridad y Delitos'],
      urlGaceta: 'https://congresosanluis.gob.mx/content/aprobada-reforma-para-sancionar-uso-indebido-de-inteligencia-artificial',
      urlPDF: 'http://congresosanluis.gob.mx/sites/default/files/unpload/legislacion/codigos/2025/11/Codigo_Penal_Estado%20%28al%2025%20de%20noviembre%20de%20%202025%29..pdf',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await db.collection('iniciativas').doc('iniciativa-81').set(iniciativaData);

    return NextResponse.json({
      success: true,
      message: 'Iniciativa-81 agregada exitosamente',
      id: 'iniciativa-81',
      titulo: iniciativaData.titulo
    });
  } catch (error: any) {
    console.error('[ADD-81] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
