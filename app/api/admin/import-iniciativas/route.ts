import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Función para convertir fecha DD/MM/YYYY a Timestamp
function parseDate(dateStr: string): Timestamp {
  if (!dateStr) return Timestamp.now();
  
  // Manejar formato "09/2025" (solo mes/año)
  if (dateStr.match(/^\d{2}\/\d{4}$/)) {
    const [month, year] = dateStr.split('/');
    return Timestamp.fromDate(new Date(`${year}-${month}-01T04:00:00.000Z`));
  }
  
  // Formato normal DD/MM/YYYY
  const [day, month, year] = dateStr.split('/');
  return Timestamp.fromDate(new Date(`${year}-${month}-${day}T04:00:00.000Z`));
}

// Función para generar ID único
function generateId(index: number, customId?: string): string {
  // Si se proporciona un ID personalizado, usarlo
  if (customId) return customId;
  // Empezar desde iniciativa-70 (asumiendo que ya hay 69)
  return `iniciativa-${70 + index}`;
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
  try {
    const { iniciativas } = await request.json();
    
    if (!Array.isArray(iniciativas)) {
      return NextResponse.json(
        { error: 'Se esperaba un array de iniciativas' },
        { status: 400 }
      );
    }
    
    const db = getAdminDb();
    const results = [];
    
    for (let i = 0; i < iniciativas.length; i++) {
      const init = iniciativas[i];
      const id = generateId(i, init.id);
      
      try {
        const data = {
          titulo: init.Propuesta || '',
          proponente: init.Proponente || 'Datos no disponibles',
          fecha: parseDate(init.Fecha),
          estatus: init.Estado || 'En comisiones',
          legislatura: init.Legislatura || 'LXVI',
          categoria: tipoToCategoria[init.Tipo] || 'Otra Reforma',
          tipo: init.Tipo || '',
          descripcion: init.Descripción || '',
          urlGaceta: init.Fuente || '',
          urlPDF: init.Fuente || '', // Usar misma URL inicialmente
          partido: '', // Extraer del proponente si es posible
          camara: init.Legislatura?.includes('CDMX') ? 'Local' : 'Diputados',
          temas: ['Inteligencia Artificial'],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await db.collection('iniciativas').doc(id).set(data);
        
        results.push({
          id,
          titulo: data.titulo.substring(0, 60),
          status: 'success'
        });
      } catch (error: any) {
        results.push({
          id,
          titulo: init.Propuesta?.substring(0, 60),
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    return NextResponse.json({
      success: true,
      total: iniciativas.length,
      imported: successCount,
      errors: errorCount,
      results
    }, { status: 200 });
  } catch (error: any) {
    console.error('[IMPORT] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
