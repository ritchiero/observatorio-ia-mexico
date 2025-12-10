import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const maxDuration = 300;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

async function verifyInitiative(initiative: any): Promise<any> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
      } as any],
      messages: [{
        role: "user",
        content: `Eres un experto en derecho mexicano. FECHA ACTUAL: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Verifica esta iniciativa:
- ID: ${initiative.id}
- Título: ${initiative.titulo}
- Proponente: ${initiative.proponente}
- Estatus: ${initiative.estatus || initiative.status || 'No especificado'}
- Entidad: ${initiative.entidadFederativa || 'Federal'}

Busca en fuentes oficiales y responde SOLO con JSON:
{"verified": true/false, "confidence": "high"|"medium"|"low", "summary": "resumen breve", "flags": []}`
      }]
    });

    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { verified: false, confidence: 'low', summary: 'Error al parsear', flags: ['Parse error'] };
  } catch (error: any) {
    console.error(`Error verificando ${initiative.id}:`, error.message);
    return { verified: false, confidence: 'low', summary: 'Error: ' + error.message, flags: ['API error'] };
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { iniciativaIds, excludeVerified = true, limit = 10 } = body;
    
    const db = getAdminDb();
    
    // Obtener iniciativas
    let query = db.collection('iniciativas');
    const snapshot = await query.get();
    
    let docs = snapshot.docs;
    
    // Filtrar por IDs si se proporcionan
    if (iniciativaIds && iniciativaIds.length > 0) {
      docs = docs.filter(doc => iniciativaIds.includes(doc.id));
    }
    
    // Excluir ya verificadas si se solicita
    if (excludeVerified) {
      docs = docs.filter(doc => {
        const data = doc.data();
        return !data.estadoVerificacion || data.estadoVerificacion === 'pendiente';
      });
    }
    
    // Limitar cantidad
    docs = docs.slice(0, limit);
    
    if (docs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay iniciativas pendientes de verificar',
        total: 0,
        verificados: 0,
        revision: 0,
        results: []
      });
    }

    const results = [];
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const id = doc.id;
      const data = doc.data();
      const initiative = { id, ...data } as any;
      
      console.log(`[Bulk] Verificando ${i + 1}/${docs.length}: ${id}`);
      
      // Verificar con IA
      const verification = await verifyInitiative(initiative);
      
      // Determinar estado
      const estadoVerificacion = verification.verified && verification.confidence !== 'low' 
        ? 'verificado' 
        : 'revision';
      
      // Guardar en Firestore
      try {
        await db.collection('iniciativas').doc(id).update({
          estadoVerificacion,
          fechaVerificacion: new Date().toISOString(),
          resultadoVerificacion: verification,
          updatedAt: new Date()
        });
      } catch (saveError: any) {
        console.error(`Error guardando ${id}:`, saveError.message);
      }

      results.push({
        id,
        titulo: initiative.titulo?.substring(0, 50) || 'Sin título',
        estadoVerificacion,
        confidence: verification.confidence,
        summary: verification.summary
      });

      // Pausa entre verificaciones para no saturar la API
      if (i < docs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const verificados = results.filter(r => r.estadoVerificacion === 'verificado').length;
    const revision = results.filter(r => r.estadoVerificacion === 'revision').length;

    return NextResponse.json({
      success: true,
      total: results.length,
      verificados,
      revision,
      pendientes: snapshot.size - results.length,
      results
    });

  } catch (error: any) {
    console.error('Error en verificación bulk:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
