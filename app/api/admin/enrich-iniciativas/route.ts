import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Función para detectar temas basados en título y descripción
function detectarTemas(titulo: string, descripcion: string): string[] {
  const texto = (titulo + ' ' + descripcion).toLowerCase();
  const temas: string[] = [];
  
  const temasKeywords: Record<string, string[]> = {
    'Regulación General': ['ley general', 'marco normativo', 'regulación ética', 'facultades del congreso', 'artículo 73', 'reforma constitucional'],
    'Seguridad y Delitos': ['ciberseguridad', 'seguridad nacional', 'delito', 'penal', 'fraude', 'robo de identidad', 'pornografía'],
    'Privacidad y Datos': ['datos personales', 'privacidad', 'protección de datos', 'neuroderechos'],
    'Deepfakes y Contenido': ['deepfake', 'contenido generado', 'imagen digital', 'manipulación', 'suplantación', 'clonación digital'],
    'Propiedad Intelectual': ['derecho de autor', 'propiedad intelectual', 'obras', 'artistas', 'creadores'],
    'Salud': ['salud', 'médico', 'paciente', 'hospital', 'enfermería'],
    'Laboral': ['trabajo', 'empleo', 'laboral', 'trabajadores'],
    'Educación': ['educación', 'enseñanza', 'escuela', 'estudiantes'],
    'Sector Público': ['gobierno', 'administración', 'transparencia', 'anticorrupción', 'adquisiciones']
  };
  
  for (const [tema, keywords] of Object.entries(temasKeywords)) {
    if (keywords.some(kw => texto.includes(kw))) {
      temas.push(tema);
    }
  }
  
  // Si no se detectó ningún tema, asignar "Otros"
  if (temas.length === 0) {
    temas.push('Otros');
  }
  
  return temas;
}

// Función para determinar cámara
function determinarCamara(proponente: string, legislatura: string): string {
  if (legislatura.includes('CDMX')) {
    return 'Local';
  }
  
  const proponenteLower = proponente.toLowerCase();
  if (proponenteLower.includes('senado') || proponenteLower.includes('senador')) {
    return 'Senado';
  }
  
  return 'Diputados';
}

export async function POST() {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const db = getAdminDb();
    
    // Obtener todas las iniciativas
    const snapshot = await db.collection('iniciativas').get();
    
    const results = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      try {
        // Detectar temas
        const temas = detectarTemas(
          data.titulo || '',
          data.descripcion || ''
        );
        
        // Determinar cámara
        const camara = determinarCamara(
          data.proponente || '',
          data.legislatura || ''
        );
        
        // Actualizar documento
        await db.collection('iniciativas').doc(doc.id).update({
          temas,
          camara,
          updatedAt: Timestamp.now()
        });
        
        results.push({
          id: doc.id,
          titulo: data.titulo?.substring(0, 50),
          temas,
          camara,
          status: 'success'
        });
      } catch (error: any) {
        results.push({
          id: doc.id,
          titulo: data.titulo?.substring(0, 50),
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    return NextResponse.json({
      success: true,
      total: snapshot.docs.length,
      enriched: successCount,
      errors: errorCount,
      results
    }, { status: 200 });
  } catch (error: any) {
    console.error('[ENRICH] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
