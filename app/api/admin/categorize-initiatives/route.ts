import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const maxDuration = 300;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

const CATEGORIAS = [
  'propiedad_intelectual',
  'responsabilidad',
  'ciberseguridad',
  'delitos',
  'laboral',
  'privacidad_datos',
  'deepfakes',
  'salud',
  'educacion',
  'sector_publico',
  'etica_transparencia',
  'regulacion_general',
  'violencia_genero',
  'transporte',
  'servicios_financieros'
];

async function categorizeInitiative(initiative: any): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Clasifica la siguiente iniciativa legislativa en UNA de estas categorías:

CATEGORÍAS:
- propiedad_intelectual: Derechos de autor, patentes, obras generadas por IA
- responsabilidad: Responsabilidad civil/penal por uso de IA
- ciberseguridad: Seguridad de sistemas, ataques con IA
- delitos: Delitos cometidos con IA (fraude, estafas, suplantación)
- laboral: Impacto en empleo, derechos de trabajadores
- privacidad_datos: Protección de datos, reconocimiento facial
- deepfakes: Contenido sintético, suplantación de identidad, imágenes íntimas falsas
- salud: IA en medicina, diagnóstico
- educacion: IA en educación, herramientas educativas
- sector_publico: Gobierno digital, decisiones automatizadas
- etica_transparencia: Principios éticos, explicabilidad, sesgos
- regulacion_general: Marco regulatorio general de IA
- violencia_genero: Violencia digital, pornografía no consentida
- transporte: Vehículos autónomos, drones
- servicios_financieros: IA en banca, seguros, créditos

INICIATIVA:
Título: ${initiative.titulo}
Descripción: ${initiative.descripcion || 'No disponible'}
Tipo: ${initiative.tipo || 'No especificado'}

Responde SOLO con el identificador de la categoría (ej: "deepfakes"), sin explicación.`
      }]
    });

    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    const categoria = responseText.trim().toLowerCase().replace(/[^a-z_]/g, '');
    
    if (CATEGORIAS.includes(categoria)) {
      return categoria;
    }
    
    // Intentar encontrar la categoría en la respuesta
    for (const cat of CATEGORIAS) {
      if (responseText.toLowerCase().includes(cat)) {
        return cat;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error categorizing initiative:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { limit = 10, excludeCategorized = true } = await request.json();
    
    const db = getAdminDb();
    const snapshot = await db.collection('iniciativas').get();
    
    let docs = snapshot.docs;
    
    if (excludeCategorized) {
      docs = docs.filter(doc => {
        const data = doc.data();
        return !data.categoriaTema;
      });
    }
    
    docs = docs.slice(0, limit);
    
    console.log(`[CATEGORIZE] Processing ${docs.length} initiatives`);
    
    const results: Array<{ id: string; titulo: string; categoria: string | null }> = [];
    let categorized = 0;
    
    for (const doc of docs) {
      const data = doc.data();
      const initiative = { id: doc.id, ...data };
      
      console.log(`[CATEGORIZE] Processing: ${data.titulo?.substring(0, 50)}...`);
      
      const categoria = await categorizeInitiative(initiative);
      
      if (categoria) {
        await db.collection('iniciativas').doc(doc.id).update({
          categoriaTema: categoria,
          updatedAt: new Date()
        });
        categorized++;
      }
      
      results.push({
        id: doc.id,
        titulo: data.titulo,
        categoria
      });
      
      // Pausa entre llamadas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return NextResponse.json({
      success: true,
      total: docs.length,
      categorized,
      results
    });
    
  } catch (error: any) {
    console.error('Error in categorize:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
