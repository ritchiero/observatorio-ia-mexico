import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

export async function POST(request: NextRequest) {
  // Verificar autenticación de administrador
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { iniciativa, verificationResult } = await request.json();

    if (!iniciativa || !iniciativa.id) {
      return NextResponse.json({ error: 'Iniciativa requerida' }, { status: 400 });
    }

    const fechaActual = new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Construir el prompt para corrección
    const prompt = `Eres un experto en legislación mexicana. Tu tarea es CORREGIR los datos de una iniciativa legislativa basándote en información verificada.

**FECHA ACTUAL:** ${fechaActual}

**INICIATIVA A CORREGIR:**
- ID: ${iniciativa.id}
- Título: ${iniciativa.titulo}
- Estatus actual: ${iniciativa.estatus || iniciativa.status || 'No especificado'}
- Proponente: ${iniciativa.proponente || 'No especificado'}
- Ámbito: ${iniciativa.ambito || 'No especificado'}
- Entidad: ${iniciativa.entidadFederativa || 'No especificado'}
- Cámara: ${iniciativa.camara || 'No especificado'}
- Descripción: ${iniciativa.descripcion || 'No disponible'}
- URL Gaceta: ${iniciativa.urlGaceta || 'No disponible'}
- URL PDF: ${iniciativa.urlPDF || 'No disponible'}

**RESULTADO DE VERIFICACIÓN PREVIO:**
${verificationResult?.summary || 'No disponible'}

**CORRECCIONES SUGERIDAS PREVIAMENTE:**
${JSON.stringify(verificationResult?.corrections || {}, null, 2)}

**ALERTAS IDENTIFICADAS:**
${verificationResult?.flags?.join('\n') || 'Ninguna'}

**INSTRUCCIONES:**
1. Busca en fuentes oficiales (congresos estatales, Cámara de Diputados, Senado, gacetas oficiales) la información CORRECTA y ACTUALIZADA.
2. Verifica el estatus real de la iniciativa (presentada, en comisión, aprobada, rechazada, publicada, etc.)
3. Encuentra URLs oficiales cuando sea posible.
4. Corrige SOLO los campos que tengan errores o estén desactualizados.

**RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO** con esta estructura:
{
  "correctedData": {
    "titulo": "título corregido si aplica o null",
    "estatus": "estatus correcto verificado",
    "proponente": "proponente correcto si aplica o null",
    "descripcion": "descripción actualizada si aplica o null",
    "urlGaceta": "URL oficial de la gaceta si se encontró o null",
    "urlPDF": "URL del PDF oficial si se encontró o null",
    "resumen": "resumen actualizado basado en información verificada"
  },
  "correctionSummary": "Breve explicación de las correcciones realizadas",
  "sourcesUsed": ["lista de fuentes consultadas"]
}

IMPORTANTE: Solo incluye en correctedData los campos que realmente necesitan corrección. No incluyas campos con valor null.`;

    // @ts-ignore
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: [{ type: "web_search_20250305", name: "web_search" } as any],
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    // Extraer el texto de la respuesta
    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    // Parsear el JSON de la respuesta
    let result;
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', responseText);
      return NextResponse.json({
        error: 'Error al procesar la respuesta de IA',
        rawResponse: responseText.substring(0, 500)
      }, { status: 500 });
    }

    // Filtrar solo los campos con valores no null
    const correctedData: Record<string, any> = {};
    if (result.correctedData) {
      for (const [key, value] of Object.entries(result.correctedData)) {
        if (value !== null && value !== undefined && value !== '') {
          correctedData[key] = value;
        }
      }
    }

    // Guardar los cambios en Firestore
    const db = getAdminDb();
    await db.collection('iniciativas').doc(iniciativa.id).update({
      ...correctedData,
      estadoVerificacion: 'verificado',
      fechaVerificacion: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
      correccionAutomatica: {
        fecha: new Date().toISOString(),
        resumen: result.correctionSummary,
        fuentes: result.sourcesUsed
      }
    });

    return NextResponse.json({
      success: true,
      correctedData,
      correctionSummary: result.correctionSummary,
      sourcesUsed: result.sourcesUsed
    });

  } catch (error: any) {
    console.error('Error correcting initiative:', error);
    return NextResponse.json({
      error: error.message || 'Error al corregir iniciativa'
    }, { status: 500 });
  }
}
