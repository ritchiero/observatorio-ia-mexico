import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos para bulk

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

async function verifyInitiative(initiative: any) {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
      } as any],
      messages: [{
        role: "user",
        content: `Eres un experto en derecho mexicano especializado en legislación sobre inteligencia artificial. 

**FECHA ACTUAL:** ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Verifica la siguiente iniciativa legislativa:

**ID:** ${initiative.id}
**Título:** ${initiative.titulo}
**Proponente:** ${initiative.proponente}
**Estatus Actual:** ${initiative.estatus || initiative.status || 'No especificado'}
**Legislatura:** ${initiative.legislatura || 'No especificada'}
**Entidad Federativa:** ${initiative.entidadFederativa || 'Federal'}
**Cámara:** ${initiative.camara || 'No especificada'}
**URL Gaceta:** ${initiative.urlGaceta || 'No disponible'}

**Descripción:** ${initiative.descripcion || 'No disponible'}

---

Busca en fuentes oficiales (diputados.gob.mx, senado.gob.mx, congresos estatales, dof.gob.mx) para verificar esta iniciativa.

**RESPONDE ÚNICAMENTE CON JSON:**
{
  "verified": true/false,
  "confidence": "high" | "medium" | "low",
  "summary": "Resumen breve",
  "flags": ["alertas si hay"]
}

Solo JSON, sin texto adicional.`
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
    return { verified: false, confidence: 'low', summary: 'Error al parsear', flags: [] };
  } catch (error: any) {
    return { verified: false, confidence: 'low', summary: error.message, flags: ['Error en verificación'] };
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { iniciativaIds } = await request.json();
    const db = getAdminDb();
    
    // Si no se pasan IDs, obtener todas
    let ids = iniciativaIds;
    if (!ids || ids.length === 0) {
      const snapshot = await db.collection('iniciativas').get();
      ids = snapshot.docs.map(doc => doc.id);
    }

    const results = [];
    
    for (const id of ids) {
      const docRef = db.collection('iniciativas').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        results.push({ id, status: 'not_found' });
        continue;
      }

      const data = doc.data();
      const initiative = { id, ...data } as any;
      const verification = await verifyInitiative(initiative);
      
      // Determinar estado: Verificado o Revisión
      const estadoVerificacion = verification.verified && verification.confidence !== 'low' 
        ? 'verificado' 
        : 'revision';
      
      // Guardar en Firestore
      await docRef.update({
        estadoVerificacion,
        fechaVerificacion: new Date().toISOString(),
        resultadoVerificacion: verification,
        updatedAt: new Date()
      });

      results.push({
        id,
        titulo: initiative.titulo?.substring(0, 50),
        estadoVerificacion,
        confidence: verification.confidence,
        summary: verification.summary
      });

      // Pequeña pausa entre verificaciones para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const verificados = results.filter(r => r.estadoVerificacion === 'verificado').length;
    const revision = results.filter(r => r.estadoVerificacion === 'revision').length;

    return NextResponse.json({
      success: true,
      total: results.length,
      verificados,
      revision,
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
