import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 120;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const initiative = await request.json();
    
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
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
**Tipo:** ${initiative.tipo || 'No especificado'}
**URL Gaceta:** ${initiative.urlGaceta || 'No disponible'}
**URL PDF:** ${initiative.urlPDF || 'No disponible'}

**Descripción:** ${initiative.descripcion || 'No disponible'}

**Resumen:** ${initiative.resumen || 'No disponible'}

---

**TAREAS DE VERIFICACIÓN:**

1. **Validar Coherencia:** Verifica si el título, descripción y resumen son coherentes entre sí
2. **Evaluar Completitud:** Identifica campos faltantes o información incompleta
3. **Verificar Formato:** Revisa que los datos sigan el formato esperado
4. **Detectar Inconsistencias:** Señala cualquier discrepancia en los datos
5. **Sugerir Mejoras:** Proporciona recomendaciones para mejorar la información

**DOMINIOS OFICIALES DE REFERENCIA:**
- diputados.gob.mx (Cámara de Diputados Federal)
- senado.gob.mx (Senado)
- sil.gobernacion.gob.mx (Sistema de Información Legislativa)
- dof.gob.mx (Diario Oficial de la Federación)
- Congresos estatales: [estado].gob.mx

**FORMATO DE RESPUESTA (JSON estricto):**
{
  "verified": true/false,
  "confidence": "high" | "medium" | "low",
  "summary": "Resumen breve de la verificación en español (2-3 oraciones)",
  "currentStatus": "estatus actual verificado o 'no encontrado'",
  "statusMatch": true/false,
  "corrections": {
    "titulo": "título sugerido si aplica, o null",
    "estatus": "estatus sugerido si aplica, o null",
    "proponente": "proponente corregido si aplica, o null",
    "urlPDF": "URL de PDF corregida si aplica, o null"
  },
  "sources": [
    "URL de fuente oficial 1",
    "URL de fuente oficial 2"
  ],
  "flags": [
    "Lista de alertas o problemas encontrados"
  ],
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2"
  ]
}

**IMPORTANTE:** Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`
      }]
    });

    // Extraer el contenido de la respuesta
    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    // Intentar parsear como JSON
    let verification;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verification = JSON.parse(jsonMatch[0]);
      } else {
        verification = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      verification = {
        verified: false,
        confidence: 'low',
        summary: 'No se pudo completar la verificación. Error al parsear respuesta.',
        currentStatus: 'no encontrado',
        statusMatch: false,
        corrections: {},
        sources: [],
        flags: ['Error al parsear la respuesta de Claude'],
        recommendations: [],
        rawResponse: responseText.substring(0, 500)
      };
    }

    return NextResponse.json({
      success: true,
      verification,
      usage: message.usage
    });

  } catch (error: any) {
    console.error('Error en verificación:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}
