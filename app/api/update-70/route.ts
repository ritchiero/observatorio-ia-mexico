import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Actualizar iniciativa-70
    await adminDb.collection('iniciativas').doc('iniciativa-70').update({
      estatus: 'Aprobada',
      camara: 'Local',
      temas: ['Deepfakes y Contenido', 'Seguridad y Delitos'],
      titulo: 'Reforma al Código Penal de San Luis Potosí - Uso indebido de IA para provocar alarma social',
      descripcion: 'Primera ley estatal aprobada en México que penaliza el uso de IA para crear deepfakes, difundir desinformación y manipular instituciones. Adiciona los artículos 187 TER (deepfakes personales), 272 BIS (desinformación) y 272 TER (manipulación institucional) al Código Penal estatal.',
      proponente: 'Comisión Primera de Justicia del Congreso de San Luis Potosí',
      partido: 'Pluripartidista',
      legislatura: 'LXIV_SLP',
      categoria: 'Ley Aprobada',
      tipo: 'reforma_codigo_penal',
      urlGaceta: 'https://congresosanluis.gob.mx/content/aprobada-reforma-para-sancionar-uso-indebido-de-inteligencia-artificial',
      urlPDF: 'http://congresosanluis.gob.mx/sites/default/files/unpload/legislacion/codigos/2025/11/Codigo_Penal_Estado%20%28al%2025%20de%20noviembre%20de%20%202025%29..pdf',
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'iniciativa-70 actualizada correctamente' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
