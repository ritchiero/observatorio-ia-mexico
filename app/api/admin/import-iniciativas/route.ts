import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Función para convertir fecha a Timestamp
function parseDate(dateStr: string | undefined): Timestamp {
  if (!dateStr) return Timestamp.now();
  
  // Si ya es una fecha ISO
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return Timestamp.fromDate(date);
    }
  }
  
  // Manejar formato "09/2025" (solo mes/año)
  if (dateStr.match(/^\d{2}\/\d{4}$/)) {
    const [month, year] = dateStr.split('/');
    return Timestamp.fromDate(new Date(`${year}-${month}-01T04:00:00.000Z`));
  }
  
  // Formato normal DD/MM/YYYY
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateStr.split('/');
    return Timestamp.fromDate(new Date(`${year}-${month}-${day}T04:00:00.000Z`));
  }
  
  return Timestamp.now();
}

// Función para generar ID único basado en timestamp
async function generateId(db: FirebaseFirestore.Firestore, customId?: string): Promise<string> {
  if (customId) return customId;
  
  // Generar ID único basado en timestamp + random
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `iniciativa-${timestamp}-${random}`;
}

// Mapeo de tipos CSV a categorías
const tipoToCategoria: Record<string, string> = {
  'reforma_constitucional': 'Reforma Constitucional',
  'reforma_codigo_penal': 'Reforma Penal',
  'ley_federal': 'Ley Federal',
  'ley_local': 'Ley Local',
  'reforma_salud': 'Reforma Salud',
  'reforma_ley_sectorial': 'Reforma Sectorial',
  'reforma_telecomunicaciones': 'Reforma Telecomunicaciones',
  'reforma_educacion': 'Reforma Educación',
  'reforma_otra': 'Otra Reforma',
  'marco_regulatorio': 'Marco Regulatorio'
};

export async function POST(request: Request) {
  console.log('[IMPORT API] Iniciando...');
  
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) {
    console.log('[IMPORT API] Error de autenticación');
    return authError;
  }

  try {
    const body = await request.json();
    console.log('[IMPORT API] Body recibido:', JSON.stringify(body).substring(0, 200));
    
    const { iniciativas } = body;
    
    if (!Array.isArray(iniciativas)) {
      console.log('[IMPORT API] No es un array:', typeof iniciativas);
      return NextResponse.json(
        { error: 'Se esperaba un array de iniciativas' },
        { status: 400 }
      );
    }

    console.log('[IMPORT API] Procesando', iniciativas.length, 'iniciativas');
    
    const db = getAdminDb();
    const results = [];
    
    for (let i = 0; i < iniciativas.length; i++) {
      const init = iniciativas[i];
      const id = await generateId(db, init.id);
      
      console.log(`[IMPORT API] Procesando ${i + 1}/${iniciativas.length}: ${id}`);
      
      try {
        // Soportar AMBOS formatos: legacy (Propuesta, Proponente) y nuevo (titulo, proponente)
        const titulo = init.titulo || init.Propuesta || '';
        const proponente = init.proponente || init.Proponente || 'Datos no disponibles';
        const fechaStr = init.fecha || init.Fecha;
        const estatus = init.estatus || init.Estado || 'En comisiones';
        const legislatura = init.legislatura || init.Legislatura || 'LXVI';
        const tipo = init.tipo || init.Tipo || '';
        const descripcion = init.descripcion || init.Descripción || '';
        const urlGaceta = init.urlGaceta || init.Fuente || '';
        const urlPDF = init.urlPDF || init.Fuente || '';
        const categoria = init.categoria || tipoToCategoria[tipo] || 'Otra Reforma';
        const camara = init.camara || (legislatura?.includes('CDMX') ? 'Local' : 'Diputados');
        const partido = init.partido || '';
        const resumen = init.resumen || '';
        const ambito = init.ambito || 'Federal';
        const entidadFederativa = init.entidadFederativa || '';
        const categoriaTema = init.categoriaTema || '';
        
        const data: Record<string, any> = {
          titulo,
          proponente,
          fecha: parseDate(fechaStr),
          estatus,
          legislatura,
          categoria,
          tipo,
          descripcion,
          urlGaceta,
          urlPDF,
          partido,
          camara,
          temas: init.temas || ['Inteligencia Artificial'],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          creadoManualmente: true,
        };

        // Agregar campos opcionales solo si tienen valor
        if (resumen) data.resumen = resumen;
        if (ambito) data.ambito = ambito;
        if (entidadFederativa) data.entidadFederativa = entidadFederativa;
        if (categoriaTema) data.categoriaTema = categoriaTema;
        
        await db.collection('iniciativas').doc(id).set(data);
        
        console.log(`[IMPORT API] ✓ Guardada: ${id}`);
        
        results.push({
          id,
          titulo: titulo.substring(0, 60),
          status: 'success'
        });
      } catch (error: any) {
        console.error(`[IMPORT API] ✗ Error en ${id}:`, error.message);
        results.push({
          id,
          titulo: (init.titulo || init.Propuesta || '').substring(0, 60),
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`[IMPORT API] Completado: ${successCount} exitosas, ${errorCount} errores`);
    
    return NextResponse.json({
      success: true,
      total: iniciativas.length,
      imported: successCount,
      errors: errorCount,
      results
    }, { status: 200 });
  } catch (error: any) {
    console.error('[IMPORT API] Error general:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
